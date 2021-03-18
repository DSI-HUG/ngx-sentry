import { SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { Project, ObjectLiteralExpression, SyntaxKind, StructureKind } from 'ts-morph';
import { extractProjectFromName, extractProjectName } from '.';
import { Schema } from '../schema/schema.model';

/**
 * Insert SentryUrl in environment file
 */
export function updateEnvironmentFiles(tree: Tree, context: SchematicContext, options: Schema, indentation: number): void {
    const projectName = extractProjectName(tree);
    const defaultProject = extractProjectFromName(tree, projectName);
    const envDirPath = `${defaultProject.sourceRoot}/environments`;
    const envDir = tree.getDir(envDirPath);
    if (!envDir) {
        throw new SchematicsException(`Could not find environments directory (${envDirPath}).`);
    }

    envDir.subfiles.forEach(fileName => {
        const filePath = `${envDirPath}/${fileName}`;
        const project = new Project({ useInMemoryFileSystem: true });
        const envFile = project.createSourceFile(filePath, tree.read(filePath)?.toString());
        const ole = envFile.getVariableDeclaration('environment')
            ?.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression) as ObjectLiteralExpression;

        if (!ole) {
            context.logger.debug('Environment declaration not found. Ignoring it.');
            return;
        }

        if (ole.getProperty('sentryUrl')) {
            context.logger.debug('SentryUrl property already exist. Ignoring it.');
            return;
        }

        ole.addProperty({ name: 'sentryUrl', initializer: `'${options.sentryUrl}'`, kind: StructureKind.PropertyAssignment });
        envFile.formatText({ indentSize: indentation });
        tree.overwrite(filePath, `${envFile.getFullText()}`);
    });
}
