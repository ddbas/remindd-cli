import fs from 'node:fs/promises';
import path from 'node:path';

import app from '../../app.js';

class Database {
    path: string;

    constructor(databasePath: string) {
        this.path = databasePath;
    }

    async read(): Promise<any> {
        let dataString;
        try {
            dataString = await fs.readFile(this.path, { encoding: 'utf8' });
        } catch {
            throw new Error(`Failed to read the database: ${this.path}`);
        }

        try {
            return JSON.parse(dataString);
        } catch {
            throw new Error(`The database is corrupted: ${this.path}`);
        }
    }

    async write(data: any): Promise<void> {
        const dataString = JSON.stringify(data);
        try {
            await fs.writeFile(this.path, dataString, { encoding: 'utf8' });
        } catch {
            throw new Error(`Failed to write to the database: ${this.path}`);
        }
    }
}

const makeDatabase = async (fileName: string): Promise<Database> => {
    const storePath = path.join(app.paths.store, fileName);
    try {
        await fs.access(storePath, fs.constants.R_OK | fs.constants.W_OK);
        return new Database(storePath);
    } catch {
        // Store not created yet.
    }

    const storeDirectory = path.dirname(app.paths.store);
    try {
        await fs.mkdir(storeDirectory, { recursive: true });
        await fs.writeFile(storePath, JSON.stringify({}));
    } catch {
        throw new Error('Failed to create the store.');
    }

    return new Database(storePath);
};

export { makeDatabase };
