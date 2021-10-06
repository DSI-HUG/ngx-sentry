import { tags } from '@angular-devkit/core';
import { noop, Rule, Tree } from '@angular-devkit/schematics';

import { addImportToNgModule, ensureIsAngularProject, getDefaultProjectOutputPath } from '../utility/angular';
import { addImportToFile, deployFiles, modifyJson, replaceInFile } from '../utility/file';
import { packageInstallTask } from '../utility/package-json';
import { schematic } from '../utility/rules';
import { SentryOptions } from './sentry-options';

export default (options: SentryOptions): Rule =>
    (tree: Tree): Rule =>
        schematic('sentry', [
            ensureIsAngularProject(),
            deployFiles({
                ...options,
                // Export origin url from sentry url with authentication token
                sentryOriginUrl: new URL(options.sentryDsnUrl).origin
            }),

            modifyJson('package.json', ['scripts', 'sentry'], `ngx-sentry ${getDefaultProjectOutputPath(tree)}`),

            modifyJson('tsconfig.json', ['compilerOptions', 'allowSyntheticDefaultImports'], true),
            modifyJson('tsconfig.json', ['compilerOptions', 'resolveJsonModule'], true),

            addImportToNgModule('src/app/app.module.ts', 'NgxSentryModule.forRoot()', '@hug/ngx-sentry'),

            addImportToFile('src/main.ts', 'initSentry', '@hug/ngx-sentry'),
            addImportToFile('src/main.ts', 'packageJson', 'package.json', true),
            (): Rule => {
                const mainTsContent = tree.read('src/main.ts')?.toString('utf-8') || '';
                if (mainTsContent.search(/initSentry\({?.*}?\)/sm) === -1) {
                    return replaceInFile(
                        'src/main.ts',
                        /platformBrowserDynamic\(/sm,
                        tags.stripIndent`
                            initSentry({
                                dsn: '${options.sentryDsnUrl}',
                                environment: 'DEV', // replace it with your own value
                                release: packageJson.version
                            });

                            platformBrowserDynamic(
                        `
                    );
                }
                return noop();
            },

            packageInstallTask()

        ], options);
