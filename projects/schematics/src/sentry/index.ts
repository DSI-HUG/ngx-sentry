import { tags } from '@angular-devkit/core';
import { chain, noop, Rule, Tree } from '@angular-devkit/schematics';

import { addImportToNgModule, ensureIsAngularProject } from '../utility/angular';
import { addImportToFile, deployFiles, modifyJson, replaceInFile } from '../utility/file';
import { action, schematic } from '../utility/rules';
import { SentryOptions } from './sentry-options';

export const modifyMainTs = (tree: Tree, options?: SentryOptions, initOptions?: string): Rule => chain([
    addImportToFile('src/main.ts', 'initSentry', '@hug/ngx-sentry'),
    addImportToFile('src/main.ts', 'packageJson', 'package.json', true),
    addImportToFile('src/main.ts', 'environment', './environments/environment'),
    (): Rule => {
        const mainTsContent = tree.read('src/main.ts')?.toString('utf-8') || '';
        if (mainTsContent.search(/initSentry\({?.*}?\)/sm) === -1) {
            if (!initOptions) {
                initOptions = tags.stripIndents`
                    dsn: '${options?.sentryDsnUrl || 'replace it with your own value'}',
                    environment: 'DEV', // replace it with your own value
                    enabled: environment.production,
                    release: packageJson.version
                `;
            }
            return replaceInFile(
                'src/main.ts',
                /platformBrowserDynamic\(/sm,
                `initSentry({\n${tags.indentBy(2)`${initOptions}`}\n});\n\nplatformBrowserDynamic(`
            );
        }
        return noop();
    },
    action('Have a look at `main.ts` file and update Sentry configuration according to your needs')
]);

export const modifyAppModule = (): Rule =>
    addImportToNgModule('src/app/app.module.ts', 'NgxSentryModule.forRoot()', '@hug/ngx-sentry');

export const modifyTsConfig = (): Rule => chain([
    modifyJson('tsconfig.json', ['compilerOptions', 'allowSyntheticDefaultImports'], true),
    modifyJson('tsconfig.json', ['compilerOptions', 'resolveJsonModule'], true)
]);

export const modifyFiles = (options: SentryOptions): Rule =>
    deployFiles({
        ...options,
        // Export origin url from sentry url with authentication token
        sentryOriginUrl: new URL(options.sentryDsnUrl).origin
    });

export default (options: SentryOptions): Rule =>
    (tree: Tree): Rule =>
        schematic('sentry', [
            ensureIsAngularProject(),
            modifyFiles(options),
            modifyTsConfig(),
            modifyAppModule(),
            modifyMainTs(tree, options)
        ], options);
