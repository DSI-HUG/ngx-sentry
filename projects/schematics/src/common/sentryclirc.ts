import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { JSONFile } from '@schematics/angular/utility/json-file';

import { Schema } from '../schema/schema.model';
import { SENTRY_CLI_RC } from './constant';

/**
 * Update sentryclirc file
 */
export function updateSentryCliRc(tree: Tree, option: Schema): void {
    const angularFile = new JSONFile(tree, 'angular.json');
    const projects = angularFile.get(['projects']) as any;

    if (!projects) {
        throw new SchematicsException(`Projects not found.`);
    }

    const projectName = Object.keys(projects)[0];

    let contentFile = SENTRY_CLI_RC.replace('{{sentryUrl}}', option.sentryUrl);
    contentFile = contentFile.replace('{{projectName}}', projectName);
    if (tree.exists('.sentryclirc')) {
        tree.overwrite('.sentryclirc', contentFile);
    } else {
        tree.create('.sentryclirc', contentFile);
    }
}
