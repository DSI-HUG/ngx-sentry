import { tags } from '@angular-devkit/core';
import { chain, Rule } from '@angular-devkit/schematics';
import {
    addImportToFile, addImportToNgModule, addProviderToBootstrapApplication, application,
    ChainableProjectContext, createOrUpdateFile, getProjectMainPath, isProjectStandalone, logAction, schematic, workspace
} from '@hug/ngx-schematics-utilities';

import { NgAddOptions } from './ng-add-options';

export const initSentry = (context: ChainableProjectContext, options: NgAddOptions): Rule => {
    const mainTsPath = getProjectMainPath(context.tree, context.project.name);
    const mainTsContent = context.tree.read(mainTsPath)?.toString('utf-8') ?? '';
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
            dsn: '${options?.dsnUrl ?? 'replace it with your own value'}',
            environment: 'DEV', // replace it with your own value
            release: packageJson.version,
            enabled: !isDevMode()
        `;

        let newContent = mainTsContent.substring(0, insertAtPosition);
        newContent += `\n\ninitSentry({\n${tags.indentBy(2)`${initOptions}`}\n});`;
        newContent += mainTsContent.substring(insertAtPosition);

        rules.push(
            createOrUpdateFile(mainTsPath, newContent),
            logAction('Have a look at `main.ts` file and update Sentry configuration according to your needs')
        );
    }
    rules.push(
        addImportToFile(mainTsPath, 'isDevMode', '@angular/core'),
        addImportToFile(mainTsPath, 'packageJson', '../package.json', true)
    );

    // Provide library
    rules.push(addImportToFile(mainTsPath, 'initSentry', '@hug/ngx-sentry'));
    if (isProjectStandalone(context.tree, context.project.name)) {
        rules.push(addProviderToBootstrapApplication(mainTsPath, 'provideSentry()', '@hug/ngx-sentry'));
    } else {
        const appModulePath = context.project.pathFromSourceRoot('app/app.module.ts');
        rules.push(addImportToNgModule(appModulePath, 'NgxSentryModule.forRoot()', '@hug/ngx-sentry'));
    }

    return chain(rules);
};

export default (options: NgAddOptions): Rule =>
    schematic('sentry', [
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
    ], options);
