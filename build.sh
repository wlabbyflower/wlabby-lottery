#!/bin/sh
set -eu
docker build -t "lottery:${1:-local}" .
