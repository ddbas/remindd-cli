import spawner from '../daemon/spawner.js';

const stop = async (): Promise<void> => {
    const pid = await spawner.stop();
    if (pid === undefined) {
        console.log('No daemon is running.');
        return;
    }

    console.log(`Stopped the daemon: PID=${pid}.`);
};

export default stop;
