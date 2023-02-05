import os from 'node:os';
import path from 'node:path';
import pino from 'pino';

import constants from './constants.js';

const DIRECTORY = 'logs';

type PinoLogger = any;
enum Logger {
    CLI = 'cli',
    DAEMON = 'daemon',
}

const loggers: Record<string, PinoLogger> = {};
const homedir = os.homedir();
const directory = process.env.XDG_STATE_HOME
    ? path.join(process.env.XDG_STATE_HOME, constants.APP_NAME, DIRECTORY)
    : path.join(homedir, '.local', 'state', constants.APP_NAME, DIRECTORY);

const getLogger = (logger: Logger): PinoLogger => {
    if (loggers[logger]) {
        return loggers[logger];
    }

    const destination = path.join(directory, `${logger}.log`);
    loggers[logger] = pino({
        level: 'warn',
        transport: {
            targets: [
                {
                    level: 'trace',
                    target: 'pino/file',
                    options: {
                        destination,
                        mkdir: true,
                    },
                },
            ],
        },
    });
    return loggers[logger];
};

export { directory, Logger };

export default getLogger;
