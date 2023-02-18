import app from '../app.js';

const info = async (): Promise<void> => {
    console.log(`Data path: ${app.paths.store}`);
    console.log(`Log path: ${app.paths.logs}`);
};

export default info;
