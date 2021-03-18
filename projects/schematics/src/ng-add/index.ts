import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { JSONFile } from '@schematics/angular/utility/json-file';

import {
    getProjectIndentationSetting, updateTsConfig, updateAppModule, updateEnvironmentFiles,
    updatePackage, updateSentryCliRc
} from '../common';
import { Schema } from '../schema/schema.model';

function isAngularProject(tree: Tree): boolean {
    const angularJson = new JSONFile(tree, 'angular.json');
    if (!angularJson) {
        throw new SchematicsException(`Project is not an angular project.`);
    }
    return true;
}

export function ngAdd(options: Schema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        context.logger.debug('ngAdd', options as any);

        if (isAngularProject(tree)) {
            context.addTask(new NodePackageInstallTask());

            updatePackage(tree);
            updateTsConfig(tree);

            const indentation = getProjectIndentationSetting(tree);
            updateAppModule(tree, indentation, options);
            updateEnvironmentFiles(tree, context, options, indentation);

            updateSentryCliRc(tree, options);
        }

        return tree;
    };
}
