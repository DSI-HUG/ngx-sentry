import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { JSONFile } from '@schematics/angular/utility/json-file';

/**
 * Update package.json file
 */
export function updatePackage(tree: Tree): void {
    const angularFile = new JSONFile(tree, 'angular.json');
    const projects = angularFile.get(['projects']) as any;

    if (!projects) {
        throw new SchematicsException(`Projects not found.`);
    }

    const projectName = Object.keys(projects)[0];
    const outputPath = projects[projectName]?.architect?.build?.options?.outputPath as string;

    const jsonFile = new JSONFile(tree, `package.json`);
    jsonFile.modify(['scripts', 'sentry'], `ngx-sentry ${outputPath}`);
}
