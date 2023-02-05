import { directory as logDirectory } from '../logger.js';
import Store from '../store.js';

const info = async (): Promise<void> => {
    const store = new Store();

    console.log(`Data path: ${store.path}`);
    console.log(`Log path: ${logDirectory}`);
};

export default info;
