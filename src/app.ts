import os from 'node:os';
import path from 'node:path';

const APP_NAME = 'remind';

const homedir = os.homedir();
const LOGS_PATH = process.env.XDG_STATE_HOME
    ? path.join(process.env.XDG_STATE_HOME, APP_NAME, 'logs')
    : path.join(homedir, '.local', 'state', APP_NAME, 'logs');

const STORE_PATH = process.env.XDG_DATA_HOME
    ? path.join(process.env.XDG_DATA_HOME, APP_NAME)
    : path.join(homedir, '.local', 'share', APP_NAME);

export default {
    name: APP_NAME,
    paths: {
        logs: LOGS_PATH,
        store: STORE_PATH,
    },
};
