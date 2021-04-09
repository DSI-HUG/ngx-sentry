import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { Schema as SchematicOptions } from '../schema/schema.model';
import { Tree } from '@angular-devkit/schematics';
import { join } from 'path';

describe('Test - ngAdd schematic', () => {
    const collectionPath = join(__dirname, '../collection.json');
    const runner = new SchematicTestRunner('ngAdd schematic', collectionPath);
    let appTree: UnitTestTree;

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
        skipPackageJson: false,
    };

    const schematicOptions: SchematicOptions = {
        sentryUrl: 'http://sentry.ch'
    };

    /**
     * Create angular application before each test
     */
    beforeEach(async () => {
        appTree = await runner.runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions).toPromise();
        appTree = await runner.runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree).toPromise();
    });

    /**
     * Angular project should be required
     */
    it('should failed without an angular app', async () => {
        const tree$ = runner.runSchematicAsync('ng-add', schematicOptions, Tree.empty()).toPromise();
        await expectAsync(tree$).toBeRejected();
    });

    /**
     * Schematics should work
     */
    it('should update & create files', async () => {
        const nbFiles = appTree.files.length;
        const tree = await runner.runSchematicAsync('ng-add', schematicOptions, appTree).toPromise();

        expect(tree.files.length).toEqual(nbFiles + 1); // Should create only one new file

        const packagePath = tree.files.find((path) => path.indexOf('package.js') != -1);
        expect(packagePath).toBeDefined();
        if (packagePath) {
            expect(tree.exists(packagePath)).toBeTruthy();
            expect(tree.readContent(packagePath)).toContain('sentry');
        }

        const tsConfigPath = tree.files.find((path) => path.indexOf('tsconfig.json') != -1);
        expect(tsConfigPath).toBeDefined();
        if (tsConfigPath) {
            expect(tree.exists(tsConfigPath)).toBeTruthy();
            expect(tree.readContent(tsConfigPath)).toContain('resolveJsonModule');
        }

        const appModulePath = tree.files.find((path) => path.indexOf('app.module.ts') != -1);
        expect(appModulePath).toBeDefined();
        if (appModulePath) {
            expect(tree.exists(appModulePath)).toBeTruthy();
            expect(tree.readContent(appModulePath)).toContain('NgxSentryModule.forRoot');
        }

        const envTsPath = tree.files.find((path) => path.indexOf('environment.ts') != -1);
        expect(envTsPath).toBeDefined();
        if (envTsPath) {
            expect(tree.exists(envTsPath)).toBeTruthy();
            expect(tree.readContent(envTsPath)).toContain('sentryUrl');
        }

        const envprodTsPath = tree.files.find((path) => path.indexOf('environment.prod.ts') != -1);
        expect(envprodTsPath).toBeDefined();
        if (envprodTsPath) {
            expect(tree.exists(envprodTsPath)).toBeTruthy();
            expect(tree.readContent(envprodTsPath)).toContain('sentryUrl');
        }

        const sentryclircPath = tree.files.find((path) => path.indexOf('.sentryclirc') != -1);
        expect(sentryclircPath).toBeDefined();
        if (sentryclircPath) {
            expect(tree.exists(sentryclircPath)).toBeTruthy();
            expect(tree.readContent(sentryclircPath)).toContain('[defaults]');
            expect(tree.readContent(sentryclircPath)).toContain(`url=${schematicOptions.sentryUrl}`);
            expect(tree.readContent(sentryclircPath)).toContain(`project=${appOptions.name}`);
        }
    });
});
