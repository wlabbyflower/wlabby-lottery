#!/bin/sh
set -eu
cd /app
exec node /app/server/index.js
