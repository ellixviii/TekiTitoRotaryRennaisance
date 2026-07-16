#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-start}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUNTIME="$ROOT/storage/app/dev-services"
LOGS="$ROOT/storage/logs"
mkdir -p "$RUNTIME" "$LOGS"

pid_file() { printf '%s/%s.pid' "$RUNTIME" "$1"; }
is_running() { [[ -f "$(pid_file "$1")" ]] && kill -0 "$(cat "$(pid_file "$1")")" 2>/dev/null; }

stop_services() {
    for name in backend frontend; do
        if is_running "$name"; then
            pid="$(cat "$(pid_file "$name")")"
            kill "$pid"
            echo "Stopped $name (PID $pid)."
        fi
        rm -f "$(pid_file "$name")"
    done
}

start_one() {
    name="$1" port="$2"; shift 2
    if is_running "$name"; then echo "$name is already running."; return; fi
    if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
        echo "Port $port is already in use." >&2; exit 1
    fi
    (cd "$ROOT" && nohup "$@" >"$LOGS/$name.log" 2>"$LOGS/$name.error.log" & echo $! >"$(pid_file "$name")")
    echo "Started $name on port $port (PID $(cat "$(pid_file "$name")"))."
}

start_services() {
    start_one backend 8890 php artisan serve --host=127.0.0.1 --port=8890
    start_one frontend 5180 npm run dev -- --host=127.0.0.1 --port=5180 --strictPort
    echo 'Open http://127.0.0.1:8890'
}

case "$ACTION" in
    start) start_services ;;
    restart) stop_services; start_services ;;
    stop) stop_services ;;
    status)
        for name in backend frontend; do
            if is_running "$name"; then echo "$name: running (PID $(cat "$(pid_file "$name")"))"; else echo "$name: stopped"; fi
        done ;;
    *) echo "Usage: $0 {start|restart|stop|status}" >&2; exit 2 ;;
esac
