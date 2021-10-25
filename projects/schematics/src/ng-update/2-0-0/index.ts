import { tags } from '@angular-devkit/core';
import { chain, noop, Rule, Tree } from '@angular-devkit/schematics';

import { modifyMainTs } from '../../sentry';
import { addImportToNgModule } from '../../utility/angular';
import { modifyJson, updateImportInFile } from '../../utility/file';
import {
    packageInstallTask, removePackageJsonDependencies, removePackageJsonDevDependencies
} from '../../utility/package-json';

export default (): Rule =>
    (tree: Tree): Rule => {
        const appModuleContent = tree.read('src/app/app.module.ts')?.toString('utf-8') || '';
        const forRootContent = /NgxSentryModule\.forRoot\({(.*?)}\)/sm.exec(appModuleContent)?.[1];

        return chain([
            // Remove dependencies
            chain([
                removePackageJsonDependencies([
                    '@sentry/angular',
                    '@sentry/browser',
                    '@sentry/tracing'
                ]),
                removePackageJsonDevDependencies([
                    '@sentry/cli'
                ]),
                packageInstallTask()
            ]),

            // Remove script in package.json
            modifyJson('package.json', ['scripts', 'sentry'], undefined),

            // Add new compiler options in tsconfig.json
            modifyJson('tsconfig.json', ['compilerOptions', 'allowSyntheticDefaultImports'], true),

            // Move initialization in main.ts
            (): Rule => {
                if (forRootContent) {
                    let newForRootContent = tags.stripIndents`${forRootContent}`;

                    // Replace `version` with `packageJson.version``
                    newForRootContent = newForRootContent.replace('release: version,', 'release: packageJson.version,');

                    // Add `enabled` option
                    newForRootContent = newForRootContent.replace('release:', 'enabled: environment.production,\nrelease:');

                    return modifyMainTs(tree, undefined, newForRootContent);
                }
                return modifyMainTs(tree);
            },

            // Modify app module
            (): Rule => {
                const content = (forRootContent) ? appModuleContent.replace(forRootContent, '') : appModuleContent;
                if (!content.includes('environment.')) {
                    return updateImportInFile('src/app/app.module.ts', 'environment', undefined, 'src/environments/environment');
                }
                return noop();
            },
            updateImportInFile('src/app/app.module.ts', 'version', undefined, 'package.json'),
            addImportToNgModule('src/app/app.module.ts', 'NgxSentryModule.forRoot()', '@hug/ngx-sentry')
        ]);
    };
