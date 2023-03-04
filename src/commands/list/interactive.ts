import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

const interactive = () => {
    if (!stdin.isTTY) {
        throw new Error('Must be run in a terminal.');
    }

    readline.emitKeypressEvents(stdin);
    stdin.setRawMode(true);

    stdout.cursorTo(0, 0);
    stdout.clearScreenDown();

    stdin.on(
        'keypress',
        (
            str: string,
            key: {
                name: string;
                ctrl: boolean;
                meta: boolean;
                shift: boolean;
            }
        ) => {
            if (key.ctrl && key.name == 'c') {
                stdin.setRawMode(false);
                process.exit();
                return;
            }
        }
    );
};

export default interactive;
