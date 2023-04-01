import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

import { NonEmptyStack } from '../../../data-structures.js';
import Mode, { NormalMode } from './modes/index.js';
import Renderer from './renderer.js';

const SYNC_INTERVAL = 5000;

class InteractiveList {
    modes: NonEmptyStack<Mode>;
    onExit: () => void;
    renderer: Renderer;

    constructor(onExit: () => void) {
        this.modes = new NonEmptyStack(new NormalMode());
        this.renderer = new Renderer();
        this.onExit = onExit;

        stdin.on('keypress', this.keypress.bind(this));
    }

    private exit() {
        this.renderer.clear();
        this.onExit();
    }

    private async keypress(
        data: string,
        key: {
            name: string;
            ctrl: boolean;
            meta: boolean;
            shift: boolean;
        }
    ) {
        if (key.ctrl && key.name === 'c') {
            this.exit();
            return;
        }

        const keypressResult = await this.modes.peek().keypress(data, key);
        if (keypressResult) {
            if (typeof keypressResult !== 'boolean') {
                switch (keypressResult.kind) {
                    case 'POP':
                        this.modes.pop();
                        break;
                    case 'PUSH':
                        this.modes.push(keypressResult.mode);
                        break;
                    case 'REPLACE':
                        this.modes.pop();
                        this.modes.push(keypressResult.mode);
                        break;
                }
            }

            this.update();
        }

        if (key.meta && key.name === 'escape') {
            this.modes.pop();
            this.update();
        }
    }

    async update() {
        const mode = this.modes.peek();
        const oldRecords = mode.liveStore.getRecords();
        await mode.liveStore.update();
        mode.update(oldRecords);

        this.renderer.clear();
        this.renderer.render(mode);
    }
}

const interactive = async () => {
    if (!stdin.isTTY) {
        throw new Error('Must be run in a terminal.');
    }

    readline.emitKeypressEvents(stdin);
    stdin.setRawMode(true);

    const restore = () => {
        stdout.write('\x1B[?25h'); // Show cursor
        stdin.setRawMode(false);
        process.exit();
    };

    const interactiveList = new InteractiveList(restore);

    stdout.write('\x1B[?25l'); // Hide cursor
    interactiveList.update();
    setInterval(interactiveList.update.bind(interactiveList), SYNC_INTERVAL);
};

export default interactive;
