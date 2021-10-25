#!/usr/bin/env node

'use strict';

const { green, magenta } = require('colors/safe');
const { exec } = require('child_process');
const { resolve } = require('path');

const execCmd = (cmd, opts) => new Promise((resolve, reject) => {
    exec(cmd, {cwd: process.cwd(), ...opts}, (err, stdout, stderr) => {
        if (err) {
            console.error(stdout, stderr);
            return reject(err);
        }
        return resolve(stdout);
    });
});

(async () => {
    try {
        const directory = resolve(process.cwd(), process.argv[2] || '');
        const version = process.env.npm_package_version || '';

        console.log('[ngx-sentry]');

        // Create release
        console.log(magenta('> 1/4 Creating release..'));
        await execCmd(`sentry-cli releases new "${version}"`);

        // Delete existing files
        console.log(magenta('> 2/4 Deleting existing files..'));
        await execCmd(`sentry-cli releases files "${version}" delete --all`);

        // Upload files
        console.log(magenta('> 3/4 Uploading new files..'));
        await execCmd(`sentry-cli releases files "${version}" upload-sourcemaps "${directory}" -x .js -x .map --validate --verbose --rewrite --strip-common-prefix`);

        // Finish release
        console.log(magenta('> 4/4 Finalizing release..'));
        await execCmd(`sentry-cli releases finalize "${version}"`);

        console.log(`> ${green('Done!')}\n`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
