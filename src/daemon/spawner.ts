import childProcess from 'node:child_process';
import path from 'node:path';
import url from 'node:url';

type PID = number;

const get = async (): Promise<PID | undefined> => {
    return new Promise((resolve, reject) => {
        childProcess.exec('ps -xa -ww -o pid,args', (error, stdout) => {
            if (error) {
                reject('Failed to search for the daemon.');
                return;
            }

            const lines = stdout.split('\n');
            const pids = lines.reduce((pidsAcc, line) => {
                const match = line.match(/^\s*(\d+)\s+.+remindd\.js\s*$/);
                if (!match) {
                    return pidsAcc;
                }

                return [...pidsAcc, parseInt(match[1])];
            }, [] as number[]);

            if (pids.length > 1) {
                reject("Illegal state: Multiple daemon's are running.");
            }

            resolve(pids.pop());
        });
    });
};

const start = async (): Promise<PID | undefined> => {
    if ((await get()) !== undefined) {
        return;
    }

    const currentFilename = url.fileURLToPath(import.meta.url);
    const currentDirname = path.dirname(currentFilename);
    const daemonPath = path.join(currentDirname, './remindd.js');
    const daemon = childProcess.spawn('node', [daemonPath], {
        detached: true,
        stdio: 'ignore',
    });

    daemon.unref();

    const pid = daemon.pid;
    if (!pid) {
        throw new Error('Failed to start the daemon.');
    }

    return pid;
};

const stop = async (): Promise<PID | undefined> => {
    const pid = await get();
    if (pid === undefined) {
        return;
    }

    process.kill(pid);
    return pid;
};

export default {
    get,
    start,
    stop,
};
