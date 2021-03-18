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
    jsonFile.modify(['scripts', 'sentry:version'], `sentry-cli releases new $npm_package_version`);
    jsonFile.modify(['scripts', 'sentry:upload'], `sentry-cli releases files $npm_package_version delete --all && sentry-cli releases files $npm_package_version upload-sourcemaps ${outputPath} -x .js -x .map --validate --verbose --rewrite --strip-common-prefix`);
    jsonFile.modify(['scripts', 'sentry:finish'], `rm ${outputPath}/*.map && sentry-cli releases finalize $npm_package_version`);
}
