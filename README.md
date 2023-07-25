

## Create bundles JS with
node_modules/.bin/rollup src/app.js -f iife -o dist/app.bundle.js -p @rollup/plugin-node-resolve

## Start test server
cd dist/
node_modules/http-server/bin/http-server