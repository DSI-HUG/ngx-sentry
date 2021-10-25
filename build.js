/* eslint-disable array-element-newline */
const { existsSync, renameSync, mkdirSync, rmSync, readFileSync, writeFileSync } = require('fs');
const { exec, spawn, spawnSync } = require('child_process');
const { watch: chokidarWatch } = require('chokidar');
const { green, magenta } = require('colors/safe');
const { basename } = require('path');
const cpy = require('cpy');

// --- OPTIONS
const USE_SCHEMATICS = true;
// ---

const TMP_PATH = './tmp';
const DIST_PATH = './dist';
const DEMO_PROJECT_NAME = 'demo-app';
const LIB_ASSETS = [
    'README.md',
    'LICENSE'
];
const SCHEMATICS_ASSETS = [
    '*/schema.json',
    '*/files/**/*',
    'migration.json',
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

const cleanDir = path => new Promise(resolve => {
    const exists = existsSync(path);
    if (exists) {
        rmSync(path, { recursive: true });
    }
    // Gives time to rmSync to unlock the file on Windows
    setTimeout(() => {
        mkdirSync(path, { recursive: true });
        resolve();
    }, exists ? 1000 : 0);
});

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

const log = str => console.log(magenta(str));
const logHeader = str => {
    console.log(green(`\n${'-'.repeat(78)}`));
    console.log(green(str));
    console.log(green(`${'-'.repeat(78)}`));
};

const deployPackageJson = async () => {
    await cpy('./package.json', './projects/library/src');

    const pkgJsonPath = './projects/library/src/package.json';
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, { encoding: 'utf8' }));
    delete pkgJson.engines;
    writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 4), { encoding: 'utf8' });
};

const build = async () => {
    log('> Cleaning..');
    await cleanDir(DIST_PATH);

    log('> Deploying package.json..');
    await deployPackageJson();

    log('> Building library..');
    await execCmd('ng build library --configuration=production');

    if (USE_SCHEMATICS) {
        log('> Building schematics..');
        await execCmd('tsc -p ./projects/schematics/tsconfig.json');
    }

    log('> Copying assets..');
    await copyAssets();
    if (USE_SCHEMATICS) {
        await copySchematicsAssets();
    }

    log(`> ${green('Done!')}\n`);
};

/**
 *  Allow the creation of a new Angular project under /tmp/${DEMO_PROJECT_NAME} by avoiding the following error during `ng new`:
 *  "And invalid configuration file was found ['/angular.json']. Please delete the file before running the command."
 */
const patchNgNew = patch => {
    if (patch && (existsSync('angular.json'))) {
        renameSync('angular.json', 'angular-old.json');
    } else if (!patch && existsSync('angular-old.json')) {
        renameSync('angular-old.json', 'angular.json');
    }
};

const linkLibrary = async () => {
    try {
        await execCmd('npm link', { cwd: './dist' });
        await execCmd('npm link @hug/ngx-sentry --save', { cwd: `./tmp/${DEMO_PROJECT_NAME}` });
        logHeader('Linked library');
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
        await cleanDir(`${process.cwd()}/${DIST_PATH}/schematics`);
        // Build
        spawn('tsc', ['-p', './projects/schematics/tsconfig.json'], { stdio: 'inherit', stderr: 'inherit', shell: true })
            .on('exit', () => logHeader('Built Schematics'));
        // Copy assets
        copySchematicsAssets().then(() => logHeader('Copied Schematics assets'));
    };

    schematicsWatcher = chokidarWatch('./projects/schematics', { ignoreInitial: true, usePolling: true });
    schematicsWatcher.on('ready', rebuild);
    schematicsWatcher.on('add', rebuild);
    schematicsWatcher.on('change', rebuild);
    schematicsWatcher.on('unlink', rebuild);
};

const watch = async () => {
    log('> Cleaning..');
    await cleanDir(DIST_PATH);
    await cleanDir(TMP_PATH);

    log('\n> Deploying package.json..');
    await deployPackageJson();

    log('\n> Creating dummy Angular project..');
    patchNgNew(true);
    try {
        spawnSync('ng', [
            'new', DEMO_PROJECT_NAME,
            '--package-manager', 'npm',
            '--directory', `${basename(__dirname)}/tmp/${DEMO_PROJECT_NAME}`,
            '--style', 'scss',
            '--strict', 'true',
            '--routing', 'true'
        ], { stdio: 'inherit', stderr: 'inherit', cwd: '..', shell: true });
    } catch (err) {
        console.error(err);
    }
    patchNgNew(false);

    log('\n> Modifying dummy Angular project..');
    const demoPkgJsonPath = `./tmp/${DEMO_PROJECT_NAME}/angular.json`;
    const pkgJson = JSON.parse(readFileSync(demoPkgJsonPath, { encoding: 'utf8' }));
    pkgJson.projects[DEMO_PROJECT_NAME].architect.build.options.preserveSymlinks = true;
    writeFileSync(demoPkgJsonPath, JSON.stringify(pkgJson, null, 4), { encoding: 'utf8' });

    log('\n> Initializing git in dummy Angular project..');
    await execCmd('git init', { cwd: `./tmp/${DEMO_PROJECT_NAME}` });
    await execCmd('git add --all', { cwd: `./tmp/${DEMO_PROJECT_NAME}` });
    await execCmd('git commit -am "First commit"', { cwd: `./tmp/${DEMO_PROJECT_NAME}` });

    log('\n> Watching library..');
    try {
        spawn('ng', ['build', 'library', '--configuration', 'development', '--watch'], { stdio: 'inherit', stderr: 'inherit', shell: true });
    } catch (err) {
        console.error(err);
    }

    // Wait for ng to rebuild dist folder
    const watcher = chokidarWatch('./dist/package.json', { usePolling: true });
    watcher.on('add', () => {
        setTimeout(async () => {
            log('\n> Linking library..');
            await linkLibrary();

            if (USE_SCHEMATICS) {
                log('\n> Watching schematics..');
                watchSchematics();
            }

            watcher.close();
        }, 1000);
    });
};

const cleanUp = async () => {
    if (USE_SCHEMATICS) {
        await unwatchSchematics();
    }
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
