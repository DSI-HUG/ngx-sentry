#!/usr/bin/env node
import { exec, ExecException } from 'child_process';

const directory = process?.argv[2] || '';
const version = process?.env?.npm_package_version || '';

const execCmd = (cmd: string, sucessMessage: string): Promise<void> => new Promise<void>((resolve, reject) => {
    exec(cmd, (err: ExecException, stdout: string, stderr: string) => {
        if (err) {
            console.error(stdout, stderr);
            reject(err);
        }
        console.log(sucessMessage);
        resolve();
    });
});

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async (): Promise<void> => {
    try {
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
