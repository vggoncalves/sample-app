#!/usr/bin/env bash

set -euo pipefail

readonly REPORT="coverage/sample-app/lcov.info"
readonly TIMEOUT_SECONDS="${SAMPLE_TEST_TIMEOUT_SECONDS:-120}"
readonly TIMEOUT_LABEL="${TIMEOUT_SECONDS}s"
marker="$(mktemp /tmp/sample-app-lcov.XXXXXX)"

cleanup() {
  rm -f -- "${marker}"
}
trap cleanup EXIT

setsid npx ng test --watch=false --coverage &
test_pid=$!

while kill -0 "${test_pid}" 2>/dev/null; do
  if (( SECONDS >= TIMEOUT_SECONDS )); then
    kill -TERM -- "-${test_pid}" 2>/dev/null || true
    sleep 2
    kill -KILL -- "-${test_pid}" 2>/dev/null || true
    disown "${test_pid}" 2>/dev/null || true
    printf 'Testes Angular excederam o limite de %s; a análise SonarQube foi bloqueada.\n' "${TIMEOUT_LABEL}" >&2
    exit 124
  fi
  sleep 1
done

set +e
wait "${test_pid}"
status=$?
set -e

if (( status != 0 )); then
  printf 'Testes Angular terminaram com código %s; a análise SonarQube foi bloqueada.\n' "${status}" >&2
  exit "${status}"
fi

if [[ ! -s "${REPORT}" || ! "${REPORT}" -nt "${marker}" ]]; then
  printf 'LCOV ausente ou não gerado nesta execução: %s\n' "${REPORT}" >&2
  exit 1
fi

printf 'LCOV atual validado: %s\n' "${REPORT}"
