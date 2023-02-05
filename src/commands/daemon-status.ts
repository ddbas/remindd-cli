import spawner from '../daemon/spawner.js';

const health = async (): Promise<void> => {
    const pid = await spawner.get();
    if (pid === undefined) {
        console.log('No daemon is running.');
        return;
    }

    console.log('Daemon (PID):', pid ?? 'None');
};

export default health;
