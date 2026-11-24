#!/usr/bin/env bash
# Fetch the pinned 0 A.D. release: the source/build tree and the data tree.
#
# Both archives are the official downloads from releases.wildfiregames.com and are checked against the
# SHA-256 sums published there. They are unpacked into re/0ad/orig/0ad-0.28.0/ (gitignored); the data
# archive's public.zip and mod.zip are not unpacked unless --unpack is given.
#
#   ./fetch.sh              download, verify and extract the two tarballs
#   ./fetch.sh --unpack     also extract web data public.zip and mod.zip into re/0ad/work/
#
# Reference: 0 A.D. 0.28.0 "Boiorix", tag v0.28.0, commit
# a2cae4d69f816e9e9d7eecb6bf88f762afc0c90d. See NOTES.md for the release and checksum pages.

set -euo pipefail
cd "$(dirname "$0")"

version=0.28.0
base=https://releases.wildfiregames.com
orig=orig
source_tar="$orig/0ad-${version}-unix-build.tar.xz"
data_tar="$orig/0ad-${version}-unix-data.tar.xz"
source_sha=27e217755ef76a922fe58dbf593d96e54b6ed2375d23f548c35619aa6bd5a42a
data_sha=e844b30ae2102c47e0a4fff2f0e0ef05ba0cebb1890aa72276fa12457c39526f

mkdir -p "$orig"

fetch_verified() {
	local url=$1 file=$2 sum=$3
	if [[ -f "$file" ]] && printf '%s  %s\n' "$sum" "$file" | sha256sum -c --status -; then
		echo "have     $file"
		return
	fi
	if [[ -f "$file" ]]; then
		echo "removing $file: checksum does not match $sum" >&2
		rm -f "$file"
	fi
	echo "download $url"
	# -C - resumes an interrupted .part; if the server refuses the range, start over once.
	if [[ -f "$file.part" ]]; then
		curl -fL --retry 8 --retry-delay 2 --retry-all-errors -C - -o "$file.part" "$url" || {
			rm -f "$file.part"
			curl -fL --retry 8 --retry-delay 2 --retry-all-errors -o "$file.part" "$url"
		}
	else
		curl -fL --retry 8 --retry-delay 2 --retry-all-errors -o "$file.part" "$url"
	fi
	if ! printf '%s  %s\n' "$sum" "$file.part" | sha256sum -c --status -; then
		echo "checksum mismatch for $file.part; expected $sum" >&2
		exit 1
	fi
	mv "$file.part" "$file"
}

fetch_verified "$base/0ad-${version}-unix-build.tar.xz" "$source_tar" "$source_sha"
fetch_verified "$base/0ad-${version}-unix-data.tar.xz" "$data_tar" "$data_sha"

# The build archive has the engine source; the data archive has binaries/data/mods/{public,mod}.zip.
if [[ ! -f "$orig/0ad-$version/source/simulation2/Simulation2.cpp" ]]; then
	echo "extract  $source_tar"
	tar -xJf "$source_tar" -C "$orig"
fi
if [[ ! -f "$orig/0ad-$version/binaries/data/mods/public/public.zip" ]]; then
	echo "extract  $data_tar"
	tar -xJf "$data_tar" -C "$orig"
fi

if [[ "${1:-}" == "--unpack" ]]; then
	command -v unzip >/dev/null || { echo "--unpack needs unzip" >&2; exit 1; }
	mkdir -p work
	if [[ ! -f work/public/mod.json ]]; then
		echo "unpack   public.zip -> work/public"
		unzip -q "$orig/0ad-$version/binaries/data/mods/public/public.zip" -d work/public
	fi
	if [[ ! -f work/mod/mod.json ]]; then
		echo "unpack   mod.zip -> work/mod"
		unzip -q "$orig/0ad-$version/binaries/data/mods/mod/mod.zip" -d work/mod
	fi
fi

echo
echo "0 A.D. $version ready:"
printf '  %s  %s bytes  %s\n' "$source_tar" "$(stat -c %s "$source_tar")" "$source_sha"
printf '  %s  %s bytes  %s\n' "$data_tar" "$(stat -c %s "$data_tar")" "$data_sha"
