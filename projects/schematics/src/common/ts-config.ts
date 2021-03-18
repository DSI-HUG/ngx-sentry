import { Tree } from '@angular-devkit/schematics';
import { JSONFile } from '@schematics/angular/utility/json-file';

/**
 * Update tsconfig.json file
 */
export function updateTsConfig(tree: Tree): void {
    const filePath = 'tsconfig.json';
    const jsonFile = new JSONFile(tree, `${tree.root.path}/${filePath}`);
    jsonFile.modify(['compilerOptions', 'resolveJsonModule'], true);
}
