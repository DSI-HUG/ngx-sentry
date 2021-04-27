import { Tree } from '@angular-devkit/schematics';
import { Schema } from '../schema/schema.model';
import { sentryCliRc } from './constant';

/**
 * Update sentryclirc file
 */
export const updateSentryCliRc = (tree: Tree, option: Schema): void => {
    const url = extractSentryRootUrl(option.sentryUrl);
    const projectName = option?.projectName || 'default';

    let contentFile = sentryCliRc.replace('{{sentryUrl}}', url);
    contentFile = contentFile.replace('{{projectName}}', projectName);
    if (tree.exists('.sentryclirc')) {
        tree.overwrite('.sentryclirc', contentFile);
    } else {
        tree.create('.sentryclirc', contentFile);
    }
};

/**
 * Export origin url from sentry url with authentication token
 */
export const extractSentryRootUrl = (completeUrl: string): string => {
    const url = new URL(completeUrl);
    return url.origin;
};
