#!/usr/bin/env bash

set -euo pipefail

readonly SCRIPT_DIRECTORY="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIRECTORY="$(cd -- "${SCRIPT_DIRECTORY}/.." && pwd)"
readonly LOCALE_DIRECTORY="${PROJECT_DIRECTORY}/src/locale"
temporary_directory="$(mktemp -d /tmp/sample-app-i18n.XXXXXX)"

cleanup() {
  rm -rf -- "${temporary_directory}"
}
trap cleanup EXIT

cd "${PROJECT_DIRECTORY}"
npx ng extract-i18n --output-path "${temporary_directory}"
install -m 0644 "${temporary_directory}/messages.xlf" "${LOCALE_DIRECTORY}/messages.xlf"

arguments=()
if [[ "${1:-}" == "--install-models" ]]; then
  arguments+=("--install-models")
fi

python "${SCRIPT_DIRECTORY}/generate-i18n-drafts.py" \
  "${LOCALE_DIRECTORY}/messages.xlf" \
  "${LOCALE_DIRECTORY}" \
  "${arguments[@]}"

printf 'Rascunhos XLIFF gerados localmente e marcados para revisão humana.\n'
