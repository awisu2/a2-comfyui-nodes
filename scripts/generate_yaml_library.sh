#!/usr/bin/env bash
# yaml 解析用の ライブラリ精製スクリプト
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BUILD_DIR="$SCRIPT_DIR/yaml_library_build"
OUTPUT_DIR="$SCRIPT_DIR/output"

mkdir -p "$BUILD_DIR" "$OUTPUT_DIR"

cd "$BUILD_DIR"

npm install --no-save --no-package-lock yaml@2 rollup

npx rollup \
  ./node_modules/yaml/browser/dist/index.js \
  --file "$OUTPUT_DIR/yaml.mjs" \
  --format es

echo "Generated: $OUTPUT_DIR/yaml.mjs"