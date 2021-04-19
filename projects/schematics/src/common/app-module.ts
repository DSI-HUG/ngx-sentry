import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { ObjectLiteralExpression, Project, PropertyAssignment, QuoteKind, SyntaxKind } from 'ts-morph';

import { libraryName } from './constant';
import { extractProjectFromName, extractProjectName } from './utils';

/**
 * Update app.module.ts file
 */
export const updateAppModule = (tree: Tree, indentation: number): void => {
    const projectName = extractProjectName(tree);
    const defaultProject = extractProjectFromName(tree, projectName);
    const modulePath = `${defaultProject.sourceRoot}/app/app.module.ts`;
    if (!tree.exists(modulePath)) {
        throw new SchematicsException(`Could not read file (${modulePath}).`);
    }

    const project = new Project({
        useInMemoryFileSystem: true,
        manipulationSettings: {
            quoteKind: QuoteKind.Single
        }
    });
    const file = project.createSourceFile(modulePath, tree.read(modulePath)?.toString());

    if (!file.getImportDeclaration('src/environments/environment')) {
        file.addImportDeclaration({
            namedImports: ['environment'],
            moduleSpecifier: 'src/environments/environment'
        });
    }

    if (!file.getImportDeclaration('package.json')) {
        file.addImportDeclaration({
            namedImports: ['version'],
            moduleSpecifier: 'package.json'
        });
    }

    if (!file.getImportDeclaration(libraryName)) {
        file.addImportDeclaration({
            namedImports: ['NgxSentryModule'],
            moduleSpecifier: libraryName
        });
    }

    const decorator = file.getClassOrThrow('AppModule').getDecoratorOrThrow('NgModule');
    const argument = decorator.getArguments()[0] as ObjectLiteralExpression;

    const imports = argument?.getProperty('imports') as PropertyAssignment;
    const imps = imports?.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);

    const sentryModuleIndex = imps.getElements().findIndex(el => el.getText().includes('NgxSentryModule'));
    if (sentryModuleIndex !== -1) {
        imps.removeElement(sentryModuleIndex);
    }

    imps.addElement(`NgxSentryModule.forRoot({
        dsn: environment.sentryUrl,
        release: version,
        environment: environment.name, // Or replace it by your own value
        tracingOrigins: ['*'],
    })`);

    file.formatText({ indentSize: indentation });
    tree.overwrite(modulePath, file.getFullText());
};
