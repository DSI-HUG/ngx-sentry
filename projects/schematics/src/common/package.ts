import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { JSONFile } from '@schematics/angular/utility/json-file';

import { AngularJsonProject } from './constant';

/**
 * Update package.json file
 */
export const updatePackage = (tree: Tree): void => {
    const angularFile = new JSONFile(tree, 'angular.json');
    const projects = angularFile.get(['projects']) as Record<string, AngularJsonProject>;

    if (!projects) {
        throw new SchematicsException('Projects not found.');
    }

    const projectName = Object.keys(projects)[0];
    const outputPath = projects[projectName]?.architect?.build?.options?.outputPath;

    const jsonFile = new JSONFile(tree, 'package.json');
    jsonFile.modify(['scripts', 'sentry'], `ngx-sentry ${outputPath}`);
};
