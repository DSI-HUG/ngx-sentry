import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { join } from 'path';

import { SentryOptions } from './sentry-options';

const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '0.0.0'
};

const appOptions: ApplicationOptions = {
    name: 'app-test',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Scss,
    skipTests: false,
    skipPackageJson: false
};

const schematicOptions: SentryOptions = {
    sentryUrl: 'http://sentry.ch',
    projectName: 'sentryProjectName'
};

const collectionPath = join(__dirname, '../collection.json');

const runner = new SchematicTestRunner('sentry schematic', collectionPath);

const getCleanAppTree = async (): Promise<UnitTestTree> => {
    const workspaceTree = await runner
        .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
        .toPromise();
    return await runner
        .runExternalSchematicAsync('@schematics/angular', 'application', appOptions, workspaceTree)
        .toPromise();
};

describe('Test - ngAdd schematic', () => {
    /**
     * Angular project should be required
     */
    it('should failed without an angular app', async () => {
        const tree$ = runner.runSchematicAsync('sentry', schematicOptions, Tree.empty()).toPromise();
        await expectAsync(tree$).toBeRejected();
    });

    /**
     * Schematics should work
     */
    describe('should update & create files', () => {
        let tree: UnitTestTree;
        let nbFiles: number;

        beforeAll(async () => {
            tree = await getCleanAppTree();
            nbFiles = tree.files.length;
            tree = await runner.runSchematicAsync('sentry', schematicOptions, tree).toPromise();
        });

        it('should create only one new file', () => {
            expect(tree.files.length).toEqual(nbFiles + 1);
        });

        it('should update package.json', () => {
            const packageJsonPath = tree.files.find(path => path.includes('package.json')) || '';
            expect(tree.exists(packageJsonPath)).toBeTruthy('package.json does not exists');
            const packageJson = new JSONFile(tree, packageJsonPath);
            const packageJsonScripts = packageJson.get(['scripts']) as Record<string, string>;
            expect(packageJsonScripts?.sentry).toBeDefined('{package.json}.scripts.sentry does not exists');
        });

        it('should update tsconfig.json', () => {
            const tsConfigPath = tree.files.find(path => path.includes('tsconfig.json')) || '';
            expect(tree.exists(tsConfigPath)).toBeTruthy('tsconfig.json does not exists');
            const tsConfig = new JSONFile(tree, tsConfigPath);
            const tsConfigCompilerOptions = tsConfig.get(['compilerOptions']) as Record<string, string>;
            expect(tsConfigCompilerOptions?.resolveJsonModule).toBeDefined('{tsconfig.json}.compilerOptions.resolveJsonModule does not exists');
        });

        it('should update app.module.ts', () => {
            const appModulePath = tree.files.find(path => path.includes('app.module.ts')) || '';
            expect(tree.exists(appModulePath)).toBeTruthy('app.module.ts does not exists');
            expect(tree.readContent(appModulePath)).toContain('NgxSentryModule.forRoot');
        });

        it('should update environment.ts', () => {
            const envTsPath = tree.files.find(path => path.includes('environment.ts')) || '';
            expect(tree.exists(envTsPath)).toBeTruthy('environment.ts does not exists');
            expect(tree.readContent(envTsPath)).toContain('sentryUrl');
        });

        it('should update environment.prod.ts', () => {
            const envprodTsPath = tree.files.find(path => path.includes('environment.prod.ts')) || '';
            expect(tree.exists(envprodTsPath)).toBeTruthy('environment.prod.ts does not exists');
            expect(tree.readContent(envprodTsPath)).toContain('sentryUrl');
        });

        it('should create .sentryclirc', () => {
            const sentryclircPath = tree.files.find(path => path.includes('.sentryclirc')) || '';
            expect(tree.exists(sentryclircPath)).toBeTruthy('.sentryclirc does not exists');
            expect(tree.readContent(sentryclircPath)).toContain('[defaults]');
            expect(tree.readContent(sentryclircPath)).toContain(`url=${schematicOptions.sentryUrl}`);
            expect(tree.readContent(sentryclircPath)).toContain(`project=${schematicOptions.projectName}`);
        });
    });
});
