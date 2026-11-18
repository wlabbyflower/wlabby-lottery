#!/bin/sh
set -eu
cd /app
exec node server/index.js 8888 n
