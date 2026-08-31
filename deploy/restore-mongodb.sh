#!/usr/bin/env bash
set -euo pipefail

ARCHIVE="${1:-telecom_contracts.archive.gz}"
MONGO_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/telecom_contracts}"

if ! command -v mongorestore >/dev/null 2>&1; then
  echo "未找到 mongorestore。请先安装 MongoDB Database Tools。" >&2
  exit 1
fi

mongorestore --uri="$MONGO_URI" --archive="$ARCHIVE" --gzip --drop
echo "已导入数据库：$ARCHIVE"

