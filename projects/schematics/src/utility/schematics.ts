import { Option } from '@angular/cli/models/interface';
import { parseJsonSchemaToOptions } from '@angular/cli/utilities/json-schema';
import { JsonObject, schema } from '@angular-devkit/core';
import { SchematicContext } from '@angular-devkit/schematics';
import { IncomingMessage } from 'http';
import { get } from 'https';
import { dirname as pathDirname, resolve as pathResolve } from 'path';

export interface NgCliOption extends Option {
    hint: string;
}

const getJsonObjectFromUrl = async (hostname: string, path: string): Promise<JsonObject> =>
    new Promise((resolve, reject) => {
        // eslint-disable-next-line consistent-return
        const req = get({ hostname, path }, (res: IncomingMessage) => {
            if (res.statusCode === 200) {
                let rawData = '';
                res.setEncoding('utf8');
                res.on('data', chunk => rawData += chunk);
                res.once('end', () => {
                    res.setTimeout(0);
                    res.removeAllListeners();
                    try {
                        return resolve(JSON.parse(rawData));
                    } catch (err) {
                        return reject(err);
                    }
                });
            } else {
                res.removeAllListeners();
                res.resume(); // consume response data to free up memory
                return reject(`Request error (${String(res.statusCode)}): https://${hostname}/${path}`);
            }
        });
        const abort = (error: Error | string): void => {
            req.removeAllListeners();
            req.destroy();
            return reject(error);
        };
        req.once('timeout', () => abort(`Request timed out: https://${hostname}/${path}`));
        req.once('error', err => abort(err));
    });

const getExternalSchemaJson = async (packageName: string): Promise<JsonObject> => {
    const hostname = 'cdn.jsdelivr.net';
    const path = `/npm/${packageName}@latest`;
    const pkgJson = await getJsonObjectFromUrl(hostname, `${path}/package.json`);
    if (pkgJson?.schematics) {
        const collectionJson = await getJsonObjectFromUrl(hostname, pathResolve(path, pkgJson.schematics as string));
        if (collectionJson?.schematics) {
            const schemaPath = pathResolve(
                path,
                pathDirname(pkgJson.schematics as string),
                ((collectionJson.schematics as JsonObject)['ng-add'] as JsonObject).schema as string
            );
            return await getJsonObjectFromUrl(hostname, schemaPath);
        }
    }
    return {};
};

export const getSchematicSchemaOptions = async (context: SchematicContext, collectionName: string, schematicName: string, external = false): Promise<NgCliOption[]> => {
    try {
        let schemaJson: JsonObject;
        if (!external) {
            const collection = context.engine.createCollection(collectionName);
            const schematic = collection.createSchematic(schematicName, false);
            schemaJson = (schematic.description as unknown as { schemaJson: JsonObject }).schemaJson;
        } else {
            schemaJson = await getExternalSchemaJson(collectionName);
        }
        const registry = (context.engine.workflow as unknown as { registry: schema.SchemaRegistry })?.registry;
        const options = await parseJsonSchemaToOptions(registry, schemaJson || {}) as NgCliOption[];
        /**
         * Fix: @angular/cli is not handling required properly
         * Feat: add support for hint property
         */
        options.forEach(option => {
            const hint = ((schemaJson?.properties as JsonObject)[option.name] as JsonObject)?.hint as string;
            if (hint) {
                option.hint = hint;
            }
            if ((schemaJson?.required as string[])?.includes(option.name)) {
                option.required = true;
            }
        });
        // --
        return options;
    } catch (err) {
        console.error(err);
        return [];
    }
};
