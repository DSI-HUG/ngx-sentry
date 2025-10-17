import { tags } from '@angular-devkit/core';
import { chain, type Rule } from '@angular-devkit/schematics';
import {
    addImportToFile,
    addImportToNgModule,
    addProviderToBootstrapApplication,
    application,
    type ChainableApplicationContext,
    createOrUpdateFile,
    logAction,
    schematic,
    workspace
} from '@hug/ngx-schematics-utilities';

import type { NgAddOptions } from './ng-add-options';

export const initSentry = ({ tree, project }: ChainableApplicationContext, options: NgAddOptions): Rule => {
    const mainTsContent = tree.read(project.mainFilePath)?.toString('utf-8') ?? '';
    const rules: Rule[] = [];

    // Initialize Sentry in main.ts
    if (!mainTsContent.includes('initSentry(')) {
        let insertAtPosition = 0;
        const imports = mainTsContent.match(/import .*;/gm);
        if (imports?.length) {
            const lastImport = imports[imports.length - 1];
            insertAtPosition = mainTsContent.indexOf(lastImport) + lastImport.length;
        }

        const initOptions = tags.stripIndents`
            dsn: '${options.dsnUrl}',
            environment: 'DEV', // replace it with your own value
            release: packageJson.version,
            enabled: !isDevMode()
        `;

        let newContent = mainTsContent.substring(0, insertAtPosition);
        newContent += `\n\ninitSentry({\n${tags.indentBy(2)`${initOptions}`}\n});`;
        newContent += mainTsContent.substring(insertAtPosition);

        rules.push(
            createOrUpdateFile(project.mainFilePath, newContent),
            logAction('Have a look at `main.ts` file and update Sentry configuration according to your needs')
        );
    }
    rules.push(
        addImportToFile(project.mainFilePath, 'isDevMode', '@angular/core'),
        addImportToFile(project.mainFilePath, 'packageJson', '../package.json', true)
    );

    // Provide library
    rules.push(addImportToFile(project.mainFilePath, 'initSentry', '@hug/ngx-sentry'));
    if (project.isStandalone) {
        rules.push(addProviderToBootstrapApplication(project.mainFilePath, 'provideSentry()', '@hug/ngx-sentry'));
    } else {
        let appModulePath = project.pathFromSourceRoot('app/app-module.ts'); // for Angular 20+
        if (!tree.exists(appModulePath)) {
            appModulePath = project.pathFromSourceRoot('app/app.module.ts'); // for Angular < 20
        }
        rules.push(addImportToNgModule(appModulePath, 'NgxSentryModule.forRoot()', '@hug/ngx-sentry'));
    }

    return chain(rules);
};

export default (options: NgAddOptions): Rule =>
    schematic(
        'sentry',
        [
            workspace()
                // deploy files
                .deployFiles({
                    ...options,
                    originUrl: new URL(options.dsnUrl).origin
                })
                // tsconfig.json (required to extract the version in package.json)
                .modifyJsonFile('tsconfig.json', ['compilerOptions', 'allowSyntheticDefaultImports'], true)
                .modifyJsonFile('tsconfig.json', ['compilerOptions', 'resolveJsonModule'], true)
                .toRule(),

            application(options.project)
                .rule(context => initSentry(context, options))
                .toRule()
        ],
        options
    );
