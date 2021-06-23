/* eslint-disable array-element-newline */
const { existsSync, renameSync, mkdirSync, rmSync } = require('fs-extra');
const { exec, spawn, spawnSync } = require('child_process');
const { watch: chokidarWatch } = require('chokidar');
const { green } = require('colors/safe');
const { basename } = require('path');
const cpy = require('cpy');

const TMP_PATH = './tmp';
const DIST_PATH = './dist';
const LIB_ASSETS = [
    'README.md',
    'LICENSE',
    'package.json'
];
const SCHEMATICS_ASSETS = [
    '*/schema.json',
    '*/files/**/*',
    'collection.json'
];

let schematicsWatcher;

const execCmd = (cmd, opts) => new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
        if (err) {
            console.error(stdout, stderr);
            return reject(err);
        }
        return resolve(stdout);
    });
});

const cleanDir = path => {
    if (existsSync(path)) {
        rmSync(path, { recursive: true });
    }
    mkdirSync(path, { recursive: true });
};

const copyAssets = () => cpy(
    LIB_ASSETS,
    DIST_PATH,
    {
        expandDirectories: true,
        parents: true
    }
);

const copySchematicsAssets = () => cpy(
    SCHEMATICS_ASSETS,
    `${process.cwd()}/${DIST_PATH}/schematics`,
    {
        cwd: `${process.cwd()}/projects/schematics/src`,
        expandDirectories: true,
        parents: true,
        dot: true
    }
);

const build = async () => {
    console.log('> Cleaning..');
    cleanDir(DIST_PATH);

    console.log('> Building library..');
    await execCmd('ng build library --configuration=production');

    console.log('> Building schematics..');
    await execCmd('tsc -p ./projects/schematics/tsconfig.json');

    console.log('> Copying assets..');
    await copyAssets();
    await copySchematicsAssets();

    console.log(`> ${green('Done!')}\n`);
};

/**
 * - Allow the creation of a new Angular project under /tmp/test-lib by avoiding the following error during `ng new test-lib`:
 *      "And invalid configuration file was found ['/angular.json']. Please delete the file before running the command."
 * - Allow the creation of a .git folder under /tmp/test-lib to track changes.
 */
const patchNgNew = patch => {
    if (patch) {
        if (existsSync('angular.json')) {
            renameSync('angular.json', 'angular-old.json');
        }
        if (existsSync('.git')) {
            renameSync('.git', '.git-old');
        }
    } else {
        if (existsSync('angular-old.json')) {
            renameSync('angular-old.json', 'angular.json');
        }
        if (existsSync('.git-old')) {
            renameSync('.git-old', '.git');
        }
    }
};

const linkLibrary = async () => {
    try {
        await execCmd('npm link', { cwd: './dist' });
        await execCmd('npm link @hug/ngx-sentry', { cwd: './tmp/test-lib' });

        console.log(green(`\n${'-'.repeat(78)}`));
        console.log(green('Linked library'));
        console.log(green(`${'-'.repeat(78)}`));
    } catch (err) {
        console.error(err);
    }
};

const unwatchSchematics = async () => {
    if (schematicsWatcher) {
        await schematicsWatcher.close();
    }
    patchNgNew(false);
};

const watchSchematics = () => {
    const rebuild = async () => {
        // Clean
        cleanDir(`${process.cwd()}/${DIST_PATH}/schematics`);
        // Build
        spawn('tsc', ['-p', './projects/schematics/tsconfig.json'], { stdio: 'inherit', stderr: 'inherit' })
            .on('exit', () => {
                console.log(green(`\n${'-'.repeat(78)}`));
                console.log(green('Built Schematics'));
                console.log(green(`${'-'.repeat(78)}`));
            });
        // Copy assets
        copySchematicsAssets().then(() => {
            console.log(green(`\n${'-'.repeat(78)}`));
            console.log(green('Copied Schematics assets'));
            console.log(green(`${'-'.repeat(78)}`));
        });
    };

    schematicsWatcher = chokidarWatch('./projects/schematics', { ignoreInitial: true });
    schematicsWatcher.on('ready', rebuild);
    schematicsWatcher.on('add', rebuild);
    schematicsWatcher.on('change', rebuild);
    schematicsWatcher.on('unlink', rebuild);
};

const watch = async () => {
    console.log('> Cleaning..');
    cleanDir(DIST_PATH);
    cleanDir(TMP_PATH);

    console.log('\n> Creating dummy Angular project..');
    patchNgNew(true);
    spawnSync('ng', [
        'new', 'test-lib',
        '--package-manager', 'npm',
        '--directory', `${basename(__dirname)}/tmp/test-lib`,
        '--style', 'scss',
        '--strict', 'true',
        '--routing', 'true'
    ], { stdio: 'inherit', stderr: 'inherit', cwd: '..' });
    patchNgNew(false);

    console.log('\n> Watching library..');
    spawn('ng', ['build', 'library', '--watch'], { stdio: 'inherit', stderr: 'inherit' });

    // Wait for ng to rebuild dist folder
    const watcher = chokidarWatch('./dist/package.json');
    watcher.on('add', () => {
        setTimeout(async () => {
            console.log('\n> Linking library..');
            await linkLibrary();

            console.log('\n> Watching schematics..');
            watchSchematics();

            watcher.close();
        });
    });
};

const cleanUp = async () => {
    await unwatchSchematics();
};

const registerExitEvents = () => {
    // catches exit
    process.on('exit', cleanUp);

    // catches ctrl+c
    process.on('SIGINT', cleanUp);

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', cleanUp);
    process.on('SIGUSR2', cleanUp);

    // catches uncaught exceptions
    process.on('uncaughtException', cleanUp);
};

(async () => {
    try {
        registerExitEvents();
        if (process.argv.includes('--build')) {
            await build();
        } else if (process.argv.includes('--watch')) {
            await watch();
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
