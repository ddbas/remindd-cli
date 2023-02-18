import path from 'node:path';
import pino from 'pino';
import app from './app.js';

type PinoLogger = any;
enum Logger {
    CLI = 'cli',
    DAEMON = 'daemon',
}

const loggers: Record<string, PinoLogger> = {};
const directory = app.paths.logs;

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

export { Logger };

export default getLogger;
