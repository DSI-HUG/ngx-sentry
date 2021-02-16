import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { getProjectIndentationSetting, updateTsConfig, updateAppModule, updateEnvironmentFiles, updatePackage, updateSentryCliRc } from '../common';
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
        
        updatePackage(tree);
        updateTsConfig(tree);
        updateAppModule(tree, indentation, options);
        updateEnvironmentFiles(tree, context, options, indentation);
        updateSentryCliRc(tree, options);

        return tree;
    };
}