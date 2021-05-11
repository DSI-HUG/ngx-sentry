import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { ObjectLiteralExpression, Project, StructureKind, SyntaxKind } from 'ts-morph';

import { getDefaultProjectName } from '../../utility/angular';
import { SentryOptions } from '../sentry-options';
import { extractProjectFromName, getProjectIndentationSetting } from './utils';

/**
 * Insert SentryUrl in environment file
 */
export const updateEnvironmentFiles = (options: SentryOptions): Rule =>
    (tree: Tree, context: SchematicContext): void => {
        const indentation = getProjectIndentationSetting(tree);
        const projectName = getDefaultProjectName(tree);
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
    };
