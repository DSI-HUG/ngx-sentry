#!/usr/bin/env node

'use strict';

const { exec } = require('child_process');

const execCmd = (cmd, successMessage) => new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(stdout, stderr);
            reject(err);
        }
        console.log(successMessage);
        resolve();
    });
});

(async () => {
    try {
        const directory = process.argv[2] || '';
        const version = process.env.npm_package_version || '';

        // Create release
        let command = `sentry-cli releases new ${version}`;
        await execCmd(command, 'Release created');

        // Delete existing files
        command = `sentry-cli releases files ${version} delete --all`;
        await execCmd(command, 'Existing files deleted');

        // Upload files
        command = `sentry-cli releases files ${version} upload-sourcemaps ${directory} -x .js -x .map --validate --verbose --rewrite --strip-common-prefix`;
        await execCmd(command, 'Files uploaded');

        // Finish release
        command = `sentry-cli releases finalize ${version}`;
        await execCmd(command, 'Release finished');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
