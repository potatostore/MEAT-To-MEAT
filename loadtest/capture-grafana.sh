#!/usr/bin/env bash
# Grafana 대시보드를 고해상도 PNG 로 저장한다 (헤드리스 Chrome).
#   사용: loadtest/capture-grafana.sh <결과폴더: loadtest/results/before|after>
#   결과폴더의 start.epoch / end.epoch(부하 테스트 시작·종료 시각)로 시간 범위를 맞춘다.
#   Grafana 는 익명 Viewer 접근이 켜져 있어 로그인 없이 캡처된다.
set -euo pipefail
cd "$(dirname "$0")/.."
DIR="$1"
FROM="$(cat "$DIR/start.epoch")000"
TO="$(cat "$DIR/end.epoch")000"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="http://localhost:3001"
mkdir -p "$DIR/grafana"

shot() {  # 이름, URL 경로, 너비, 높이
  local name="$1" path="$2" w="$3" h="$4"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size="$w,$h" --virtual-time-budget=20000 \
    --screenshot="$PWD/$DIR/grafana/$name.png" \
    "$BASE$path&from=$FROM&to=$TO&timezone=browser&kiosk" >/dev/null 2>&1
  echo "  $DIR/grafana/$name.png"
}

D="/d/meat-to-meat?orgId=1"
# 대시보드 전체 (세로로 긴 한 장)
shot dashboard-full "$D" 1600 3600
# 패널 단독 (viewPanel = 패널 id)
shot panel-api-summary "$D&viewPanel=2" 1600 1350
shot panel-rps        "$D&viewPanel=4" 1600 800
shot panel-p95        "$D&viewPanel=5" 1600 800
shot panel-errors     "$D&viewPanel=6" 1600 800
shot panel-hikari     "$D&viewPanel=8" 1600 800
shot panel-sql-rate   "$D&viewPanel=9" 1600 800
shot panel-sql-per-request "$D&viewPanel=10" 1600 800
