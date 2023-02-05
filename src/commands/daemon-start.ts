import spawner from '../daemon/spawner.js';

const start = async (): Promise<void> => {
    const pid = await spawner.start();
    if (pid) {
        console.log(`Started the daemon: PID=${pid}.`);
    } else {
        console.log('The daemon is already running.');
    }
};

export default start;
