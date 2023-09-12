
## Node modules to install
- rollup
- @types/jquery
- http-server (any other web server is good)

## Create bundles JS with
node_modules/.bin/rollup src/app.js -f iife -o dist/app.bundle.js -p @rollup/plugin-node-resolve

## Start test server
- In the "dist" directory:
    cd dist/
- Run the test server:
    ../node_modules/http-server/bin/http-server