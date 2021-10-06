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
    projectRoot: '',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Scss,
    skipTests: false,
    skipPackageJson: false
};

const schematicOptions: SentryOptions = {
    projectName: 'SentryProjectName',
    sentryDsnUrl: 'https://a1b2c3d4e5f6g7h8@sentry.domain.ch/4'
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

        it('should create only one new file (ie. .sentryclirc', () => {
            expect(tree.files.length).toEqual(nbFiles + 1);
        });

        it('should create .sentryclirc', () => {
            const sentryclircPath = tree.files.find(path => path.includes('.sentryclirc')) || '';
            expect(tree.exists(sentryclircPath)).withContext('.sentryclirc does not exists').toBeTruthy();
            expect(tree.readContent(sentryclircPath)).toContain('[defaults]');
            expect(tree.readContent(sentryclircPath)).toContain(`url=${new URL(schematicOptions.sentryDsnUrl).origin}`);
            expect(tree.readContent(sentryclircPath)).toContain(`project=${schematicOptions.projectName}`);
        });

        it('should update package.json', () => {
            const packageJsonPath = tree.files.find(path => path.includes('package.json')) || '';
            expect(tree.exists(packageJsonPath)).withContext('package.json does not exists').toBeTruthy();
            const packageJson = new JSONFile(tree, packageJsonPath);
            const packageJsonScripts = packageJson.get(['scripts']) as Record<string, string>;
            expect(packageJsonScripts?.sentry).withContext('{package.json}.scripts.sentry does not exists').toBeDefined();
        });

        it('should update tsconfig.json', () => {
            const tsConfigPath = tree.files.find(path => path.includes('tsconfig.json')) || '';
            expect(tree.exists(tsConfigPath)).withContext('tsconfig.json does not exists').toBeTruthy();
            const tsConfig = new JSONFile(tree, tsConfigPath);
            const tsConfigCompilerOptions = tsConfig.get(['compilerOptions']) as Record<string, string>;
            expect(tsConfigCompilerOptions?.resolveJsonModule).withContext('{tsconfig.json}.compilerOptions.resolveJsonModule does not exists').toBeDefined();
            expect(tsConfigCompilerOptions?.resolveJsonModule).withContext('{tsconfig.json}.compilerOptions.resolveJsonModule should be enabled').toBeTrue();
            expect(tsConfigCompilerOptions?.allowSyntheticDefaultImports).withContext('{tsconfig.json}.compilerOptions.allowSyntheticDefaultImports does not exists').toBeDefined();
            expect(tsConfigCompilerOptions?.allowSyntheticDefaultImports).withContext('{tsconfig.json}.compilerOptions.allowSyntheticDefaultImports should be enabled').toBeTrue();
        });

        it('should update main.ts', () => {
            const mainTsPath = tree.files.find(path => path.includes('main.ts')) || '';
            expect(tree.exists(mainTsPath)).withContext('main.ts does not exists').toBeTruthy();
            expect(tree.readContent(mainTsPath)).withContext('app.module.ts does not import @hug/ngx-sentry').toContain('from \'@hug/ngx-sentry\'');
            expect(tree.readContent(mainTsPath)).withContext('app.module.ts does not import package.json').toContain('package.json');
            expect(tree.readContent(mainTsPath)).withContext('app.module.ts does not initialize Sentry').toContain('initSentry');
        });

        it('should update app.module.ts', () => {
            const appModulePath = tree.files.find(path => path.includes('app.module.ts')) || '';
            expect(tree.exists(appModulePath)).withContext('app.module.ts does not exists').toBeTruthy();
            expect(tree.readContent(appModulePath)).withContext('app.module.ts does not import @hug/ngx-sentry').toContain('from \'@hug/ngx-sentry\'');
            expect(tree.readContent(appModulePath)).withContext('app.module.ts does not import NgxSentryModule').toContain('NgxSentryModule');
            expect(tree.readContent(appModulePath)).withContext('app.module.ts does not provide NgxSentryModule.forRoot()').toContain('NgxSentryModule.forRoot()');
        });
    });
});
