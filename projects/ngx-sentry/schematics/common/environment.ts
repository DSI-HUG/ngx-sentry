import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { Project, ObjectLiteralExpression, SyntaxKind, StructureKind } from "ts-morph";
import { Schema } from '../schema/schema';

/**
 * Insert SentryUrl in environment file
 * @param tree 
 * @param context 
 * @param options 
 * @param indentation 
 */
export function updateEnvironmentFiles(tree: Tree, context: SchematicContext, options: Schema, indentation: number) {
    const envsPath = 'src/environments';

    const project = new Project();
    const files = project.addSourceFilesAtPaths(`${envsPath}/*.ts`);

    files.forEach(envFile => {
        const ole = envFile.getVariableDeclaration('environment')?.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression) as ObjectLiteralExpression;
    
        if(!ole) {
            context.logger.debug('Environment declaration not found. Ignoring it.');
            return;
        }

        if(ole.getProperty('sentryUrl')) {
            context.logger.debug('SentryUrl property already exist. Ignoring it.');
            return;
        }

        ole.addProperty({name: 'sentryUrl', initializer: `'${options.sentryUrl}'`, kind: StructureKind.PropertyAssignment });
        envFile.formatText({ indentSize: indentation });
        tree.overwrite(`src/environments/${envFile.getBaseName()}`, `${envFile.getFullText()}`);
    });
}