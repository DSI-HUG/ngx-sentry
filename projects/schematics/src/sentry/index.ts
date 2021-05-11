import { Rule, Tree } from '@angular-devkit/schematics';

import { ensureIsAngularProject, getDefaultProjectOutputPath } from '../utility/angular';
import { deployFiles, modifyJson } from '../utility/file';
import { packageInstallTask } from '../utility/package-json';
import { schematic } from '../utility/rules';
import { updateAppModule } from './common/app-module';
import { updateEnvironmentFiles } from './common/environment';
import { SentryOptions } from './sentry-options';

export default (options: SentryOptions): Rule =>
    (tree: Tree): Rule =>
        schematic('sentry', [
            ensureIsAngularProject(),
            deployFiles({
                ...options,
                // Export origin url from sentry url with authentication token
                sentryOriginUrl: new URL(options.sentryUrl).origin
            }),
            updateAppModule(),
            updateEnvironmentFiles(options),
            modifyJson('package.json', ['scripts', 'sentry'], `ngx-sentry ${getDefaultProjectOutputPath(tree)}`),
            modifyJson('tsconfig.json', ['compilerOptions', 'resolveJsonModule'], true),
            packageInstallTask()
        ]);
