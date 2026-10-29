// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// The form at the foot of a game's page: a bug, an idea or anything else, to the operator only (POST /feedback; the
// server keeps it in its data directory and publishes nothing). It sends the game, the kind, the text, a contact if
// the player gives one, and the site's release; the server adds the browser's family and system, no address.
import { el } from './dom.ts';

declare const __RELEASE__: string;

export function feedbackForm(game: string, title: string): HTMLElement {
  const kind = el('select', { name: 'kind' },
    el('option', { value: 'bug', textContent: 'Something does not work' }),
    el('option', { value: 'idea', textContent: 'An idea or a wish' }),
    el('option', { value: 'other', textContent: 'Something else' }));
  const text = el('textarea', { name: 'text', required: true, maxLength: 4000, rows: 5, placeholder: `What happened in ${title}? What did you expect?` });
  const contact = el('input', { name: 'contact', type: 'text', maxLength: 200, placeholder: 'E-mail, if you want an answer (optional)' });
  const send = el('button', { type: 'submit', className: 'feedback-send', textContent: 'Send' });
  const status = el('p', { className: 'feedback-status', role: 'status' });
  const form = el('form', { className: 'feedback-form' },
    el('label', {}, 'What is it about? ', kind),
    text,
    contact,
    el('p', { className: 'feedback-note' }, 'Only we read it; nothing is published. ',
      el('a', { href: 'datenschutz.html', textContent: 'Privacy' }), '.'),
    send, status);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!text.value.trim()) return;
    send.disabled = true;
    status.textContent = 'Sending…';
    const body = new URLSearchParams({ game, kind: kind.value, text: text.value, contact: contact.value, release: __RELEASE__ });
    fetch('feedback', { method: 'POST', body }).then((r) => {
      if (r.status === 204) {
        status.textContent = 'Thank you! We read every message.';
        text.value = '';
        contact.value = '';
      } else if (r.status === 429) {
        status.textContent = 'You sent several messages already: please try again in an hour.';
      } else {
        status.textContent = `That did not work (${r.status}). Please try again later.`;
      }
    }, () => { status.textContent = 'The server is not reachable right now. Please try again later.'; })
      .finally(() => { send.disabled = false; });
  });
  return el('section', { className: 'feedback' },
    el('details', {}, el('summary', { textContent: 'Report a problem or send feedback' }), form));
}
