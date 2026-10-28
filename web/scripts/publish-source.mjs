// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Publishes the source of a release to the public repository (source-paths.mjs): the files of SOURCE_PATHS at a commit
// of this repository, as one commit on its main branch with the release's tag, and web/SOURCE.md as its README.md. So
// the public history is the list of releases, and the game server never goes there (NEVER). tools/deploy.sh runs it
// before it uploads a release; a tag that is published already for the same commit is left as it is.
//   node web/scripts/publish-source.mjs <release-YYYY-MM-DD[.n]> [<commit>]      (default HEAD)
// The clone of the public repository lives in $FREEGAMES_SOURCE_DIR (default ~/.cache/freegames-client);
// $FREEGAMES_SOURCE_REMOTE publishes to another repository (a test).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE_PATHS, SOURCE_REMOTE, SOURCE_URL, sourceFiles } from './source-paths.mjs';

const [tag, commitArg = 'HEAD'] = process.argv.slice(2);
if (!/^release-\d{4}-\d{2}-\d{2}(\.\d+)?$/.test(tag ?? '')) {
  console.error('usage: node web/scripts/publish-source.mjs release-YYYY-MM-DD[.n] [commit]');
  process.exit(2);
}
const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(web, '..');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28 });
const commit = git(repo, 'rev-parse', `${commitArg}^{commit}`).trim();
const files = sourceFiles((...a) => git(repo, ...a), commit);

// nothing secret goes public (keys, tokens, the dashboard's password hash)
const SECRETS = ['-----BEGIN [A-Z ]*PRIVATE KEY-----', 'NIRO_TOKEN=[^ $]', 'ghp_[A-Za-z0-9]{30,}', 'ADMIN_PASSWORD_HASH=pbkdf2'];
let found = '';
try {
  // (this file names the patterns, so it is left out)
  found = git(repo, 'grep', '-I', '-l', '-E', ...SECRETS.flatMap((s) => ['-e', s]), commit, '--', ...SOURCE_PATHS,
    ':(exclude)web/scripts/publish-source.mjs');
} catch (e) {
  if (e.status !== 1) throw e; // 1: nothing found
}
if (found.trim()) throw new Error(`what looks like a secret would go public:\n${found}`);

const dir = process.env.FREEGAMES_SOURCE_DIR ?? join(homedir(), '.cache', 'freegames-client');
if (!existsSync(join(dir, '.git'))) {
  mkdirSync(dirname(dir), { recursive: true });
  git(dirname(dir), 'clone', '-q', process.env.FREEGAMES_SOURCE_REMOTE ?? SOURCE_REMOTE, dir);
}
git(dir, 'fetch', '-q', '--tags', '--force', 'origin');
if (git(dir, 'tag', '-l', tag).trim()) {
  if (git(dir, 'log', '-1', '--format=%B', tag).includes(commit)) {
    console.log(`source: ${tag} is published already: ${SOURCE_URL}/tree/${tag}`);
    process.exit(0);
  }
  throw new Error(`${tag} is published already in ${SOURCE_URL}, for another commit`);
}
let hasMain = true;
try { git(dir, 'rev-parse', '--verify', '-q', 'origin/main'); } catch { hasMain = false; }
if (hasMain) git(dir, 'checkout', '-q', '-f', '-B', 'main', 'origin/main');
else git(dir, 'checkout', '-q', '--orphan', 'main');
// the tree becomes exactly the release's files
try { git(dir, 'rm', '-rqf', '--ignore-unmatch', '.'); } catch { /* an empty repository has nothing to remove */ }
git(dir, 'clean', '-fdxq');
const tar = execFileSync('git', ['archive', '--format=tar', commit, '--', ...SOURCE_PATHS], { cwd: repo, maxBuffer: 1 << 30 });
execFileSync('tar', ['-x', '-C', dir], { input: tar, maxBuffer: 1 << 20 });
writeFileSync(join(dir, 'README.md'), readFileSync(join(web, 'SOURCE.md'), 'utf8'));
git(dir, 'add', '-A');
const name = git(repo, 'config', 'user.name').trim(), email = git(repo, 'config', 'user.email').trim();
const msg = `${tag}: the source of https://freegames.stream/ in this release\n\nFrom commit ${commit} of the site's repository; ${files.length} files.`;
git(dir, '-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-q', '--allow-empty', '-m', msg);
git(dir, '-c', `user.name=${name}`, '-c', `user.email=${email}`, 'tag', '-a', tag, '-m', msg);
git(dir, 'push', '-q', 'origin', 'main', tag);
console.log(`source: ${tag} published (${files.length} files): ${SOURCE_URL}/tree/${tag}`);
