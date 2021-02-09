import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { getProjectIndentationSetting, updateTsConfig, updateAppModule, updateEnvironmentFiles } from '../common';
import { Schema } from '../schema/schema';

/**
 * Execute ng add process
 * @param options 
 */
export function ngAdd(options: Schema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        context.logger.debug('NGX Sentry ngAdd start', options as any);
        context.addTask(new NodePackageInstallTask());

        const indentation = getProjectIndentationSetting(tree);

        updateTsConfig(tree);
        updateAppModule(tree, indentation, options);
        updateEnvironmentFiles(tree, context, options, indentation);

        return tree;
    };
}