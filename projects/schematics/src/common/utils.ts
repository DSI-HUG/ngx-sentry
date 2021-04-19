import { Tree } from '@angular-devkit/schematics';
import { SchematicsException, UpdateRecorder } from '@angular-devkit/schematics';
import { Change, InsertChange } from '@schematics/angular/utility/change';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { Project } from 'ts-morph';
import * as ts from 'typescript';

import { defaultIndentation } from '.';
import { AngularJsonProject } from './constant';

export const getTsSourceFile = (host: Tree, path: string): ts.SourceFile => {
    const buffer = host.read(path);
    if (!buffer) {
        throw new SchematicsException(`Could not read file (${path}).`);
    }
    const content = buffer.toString();
    const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
    return source;
};

export const persistInsertChanges = (changes: Change[], recorder: UpdateRecorder): void => {
    changes.forEach((change: Change) => {
        if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
    });
};

export const getProjectIndentationSetting = (tree: Tree): number => {
    const defaultIdentation = defaultIndentation;
    const buffer = tree.read('.editorconfig');
    if (!buffer) {
        return defaultIdentation;
    }

    const content = buffer.toString();
    if (!content) {
        return defaultIdentation;
    }

    const regex = /^indent_size = (.)/gm;
    const res = regex.exec(content);
    if (Array.isArray(res) && res[1]) {
        return +res[1];
    }

    return 0;
};

export const formatFile = (tree: Tree, filePath: string, indentation: number): void => {
    const project = new Project();
    project.addSourceFilesAtPaths(filePath);
    const file = project.getSourceFileOrThrow(filePath);
    file.formatText({ indentSize: indentation });
    tree.overwrite(filePath, file.getFullText());
};

export const extractProjectName = (tree: Tree): string => {
    const angularFile = new JSONFile(tree, 'angular.json');
    return angularFile.get(['defaultProject']) as string;
};

export const extractProjectFromName = (tree: Tree, name: string): AngularJsonProject => {
    const angularFile = new JSONFile(tree, 'angular.json');
    const projects = angularFile.get(['projects']) as Record<string, AngularJsonProject>;

    if (!projects) {
        throw new SchematicsException('Projects not found.');
    }

    return projects[name];
};

export const isAngularProject = (tree: Tree): boolean => {
    const angularJson = new JSONFile(tree, 'angular.json');
    if (!angularJson) {
        throw new SchematicsException('Project is not an angular project.');
    }
    return true;
};
