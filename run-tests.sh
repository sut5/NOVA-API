#!/usr/bin/env bash
set -euo pipefail
npm install
npm run test:smoke
npm run test:full
