param(
  [string]$MongoUri = "mongodb://127.0.0.1:27017/telecom_contracts",
  [string]$Out = "telecom_contracts.archive.gz"
)

$mongodump = Get-Command mongodump -ErrorAction SilentlyContinue

if (-not $mongodump) {
  Write-Error "未找到 mongodump。请先安装 MongoDB Database Tools，并把 bin 目录加入 PATH。"
  exit 1
}

mongodump --uri="$MongoUri" --archive="$Out" --gzip

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "已导出数据库到 $Out"

