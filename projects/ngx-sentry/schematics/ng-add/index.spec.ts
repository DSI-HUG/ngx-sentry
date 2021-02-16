import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';

import * as path from 'path';
import { LIBRARIE_NAME, LIBRARIE_VERSION } from '../common';

const collectionPath = path.join(__dirname, '../collection.json');

describe('ngx-sentry schematic', () => {
    const testRunner = new SchematicTestRunner('ngx-sentry', collectionPath);

    const workspaceOptions: WorkspaceOptions = {
        name: 'workspace',
        newProjectRoot: 'projects',
        version: '6.0.0',
    };

    const appOptions: ApplicationOptions = {
        name: 'my-app',
        inlineStyle: false,
        inlineTemplate: false,
        routing: false,
        style: Style.Scss,
        skipTests: false,
        skipPackageJson: false,
    };

    const ngxSentryOptions = {
        sentryUrl : 'http://sentry.ch'
    };

    let appTree: UnitTestTree;

    /**
     * Create angular application before each test
     */
    beforeEach(async () => {
        appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions).toPromise();
        appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree).toPromise();
    });

    /**
     * Schematics should not work if not angular project is present
     */
    it('should failed without an angular app', async () => {
        await expectAsync(testRunner.runSchematicAsync('ng-add', ngxSentryOptions, Tree.empty()).toPromise())
            .toBeRejected();
    });

    /**
     * Schematics should work
     */
    it('should update & create files', async () => {
        const nbFiles = appTree.files.length;
        const tree = await testRunner.runSchematicAsync('ng-add', ngxSentryOptions, appTree).toPromise();

        expect(tree.files.length).toEqual(nbFiles + 1); // Should create only one new file

        const packagePath = tree.files.find((path) => path.indexOf('package.js') != -1);
        expect(packagePath).toBeDefined();
        if(packagePath) {
            expect(tree.exists(packagePath)).toBeTruthy();
            expect(tree.readContent(packagePath)).toContain(`"${LIBRARIE_NAME}": "^${LIBRARIE_VERSION}"`);
            expect(tree.readContent(packagePath)).toContain('sentry:finish');
            expect(tree.readContent(packagePath)).toContain('sentry:upload');
            expect(tree.readContent(packagePath)).toContain('sentry:version');
        }

        const tsConfigPath = tree.files.find((path) => path.indexOf('tsconfig.json') != -1);
        expect(tsConfigPath).toBeDefined();
        if(tsConfigPath) {
            expect(tree.exists(tsConfigPath)).toBeTruthy();
            expect(tree.readContent(tsConfigPath)).toContain('resolveJsonModule');
        }

        const appModulePath = tree.files.find((path) => path.indexOf('app.module.ts') != -1);
        expect(appModulePath).toBeDefined();
        if(appModulePath) {
            expect(tree.exists(appModulePath)).toBeTruthy();
            expect(tree.readContent(appModulePath)).toContain('NgxSentryModule.forRoot');
        }

        const envTsPath = tree.files.find((path) => path.indexOf('environment.ts') != -1);
        expect(envTsPath).toBeDefined();
        if(envTsPath) {
            expect(tree.exists(envTsPath)).toBeTruthy();
            expect(tree.readContent(envTsPath)).toContain('sentryUrl');
        }

        const envprodTsPath = tree.files.find((path) => path.indexOf('environment.prod.ts') != -1);
        expect(envprodTsPath).toBeDefined();
        if(envprodTsPath) {
            expect(tree.exists(envprodTsPath)).toBeTruthy();
            expect(tree.readContent(envprodTsPath)).toContain('sentryUrl');
        }

        const sentryclircPath = tree.files.find((path) => path.indexOf('.sentryclirc') != -1);
        expect(sentryclircPath).toBeDefined();
        if(sentryclircPath) {
            expect(tree.exists(sentryclircPath)).toBeTruthy();
            expect(tree.readContent(sentryclircPath)).toContain('[defaults]');
            expect(tree.readContent(sentryclircPath)).toContain(`url=${ngxSentryOptions.sentryUrl}`);
            expect(tree.readContent(sentryclircPath)).toContain(`project=${appOptions.name}`);
        }
    });
});