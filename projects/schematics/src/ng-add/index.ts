import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { getProjectIndentationSetting, isAngularProject, updateAppModule, updateEnvironmentFiles, updatePackage, updateSentryCliRc, updateTsConfig } from '../common';
import { Schema } from '../schema/schema.model';

/**
 * Execute ng add process
 */
export const ngAdd = (options: Schema): Rule => (tree: Tree, context: SchematicContext): Tree => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context.logger.debug('ngAdd', options as any);

    if (isAngularProject(tree)) {
        context.addTask(new NodePackageInstallTask());

        const indentation = getProjectIndentationSetting(tree);

        updatePackage(tree);
        updateTsConfig(tree);
        updateAppModule(tree, indentation);
        updateEnvironmentFiles(tree, context, options, indentation);
        updateSentryCliRc(tree, options);
    }

    return tree;
};
