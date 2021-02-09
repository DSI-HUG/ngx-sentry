import { Tree } from '@angular-devkit/schematics';

import { ArrayLiteralExpression, ObjectLiteralExpression, Project, PropertyAssignment, SyntaxKind } from "ts-morph";
import { Schema } from '../schema/schema';

/**
 * Update app.module.ts file
 * @param tree 
 */
export function updateAppModule(tree: Tree, indentation: number, options: Schema): void {
    const modulePath = 'src/app/app.module.ts';
    const project = new Project();
    const file = project.addSourceFileAtPath(modulePath);

    if (!file.getImportDeclaration('src/environments/environment')) {
        file.addImportDeclaration({
            namedImports: ['environment'],
            moduleSpecifier: 'src/environments/environment',
        });
    }

    if (!file.getImportDeclaration('package.json')) {
        file.addImportDeclaration({
            namedImports: ['version'],
            moduleSpecifier: 'package.json',
        });
    }

    if (!file.getImportDeclaration('ngx-sentry')) {
        file.addImportDeclaration({
            namedImports: ['NgxSentryModule'],
            moduleSpecifier: 'ngx-sentry',
        });
    }

    const decorator = file.getClassOrThrow('AppModule').getDecoratorOrThrow('NgModule');
    const argument = decorator.getArguments()[0] as ObjectLiteralExpression;

    const imports = argument?.getProperty('imports') as PropertyAssignment;
    const imps = imports?.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression) as ArrayLiteralExpression;
    
    const sentryModuleIndex = imps.getElements().findIndex((el) => el.getText().includes('NgxSentryModule'));
    if(sentryModuleIndex != -1) {
        imps.removeElement(sentryModuleIndex);
    }
    
    imps.addElement(`NgxSentryModule.forRoot({
        dsn: '${options.sentryUrl}',
        release: version,
        environment: environment.environment,
        tracingOrigins: ['*'],
    })`);

    file.formatText({ indentSize: indentation });
    tree.overwrite(modulePath, file.getFullText());
}