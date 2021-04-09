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
    const url = extractSentryRootUrl(option.sentryUrl);

    let contentFile = SENTRY_CLI_RC.replace('{{sentryUrl}}', url);
    contentFile = contentFile.replace('{{projectName}}', projectName);
    if (tree.exists('.sentryclirc')) {
        tree.overwrite('.sentryclirc', contentFile);
    } else {
        tree.create('.sentryclirc', contentFile);
    }
}

/**
 * Export origin url from sentry url with authentication token
 */
export function extractSentryRootUrl(completeUrl: string): string {
    const url = new URL(completeUrl);
    return url.origin;
}
