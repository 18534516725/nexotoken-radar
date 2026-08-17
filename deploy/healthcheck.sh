#!/bin/sh
set -eu
curl -fsS --max-time 10 http://127.0.0.1:3010/api/health
