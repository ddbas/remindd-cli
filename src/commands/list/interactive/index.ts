import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

import Mode, { BaseMode, NormalMode } from './modes/index.js';
import Renderer from './renderer.js';
import store, { Record } from '../../../store/index.js';

const SYNC_INTERVAL = 5000;

/*
1. modes manage state by reacting to keypresses, and updates to records
2. renderer renders the terminal, based on the current mode's state.
3. interactive-list maintains the current mode, calls its callbacks, and calls the terminal renderer.
*/

class InteractiveList {
    mode: Mode;
    onExit: () => void;
    renderer: Renderer;

    constructor(records: Record[], onExit: () => void) {
        const base = new BaseMode(records);
        this.mode = new NormalMode(base);
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
        if (
            (key.ctrl && key.name === 'c') ||
            (!key.ctrl && !key.meta && !key.shift && key.name === 'q')
        ) {
            this.exit();
            return;
        }

        const { mode: newMode, update = false } =
            (await this.mode.keypress(data, key)) || {};
        if (newMode) {
            this.mode = newMode;
        }

        if (update || newMode) {
            this.update();
        }
    }

    async update() {
        const mode = await this.mode.update();
        if (mode) {
            this.mode = mode;
        }

        this.renderer.clear();
        this.renderer.render(this.mode);
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

    const records = await store.getIncomplete();
    const interactiveList = new InteractiveList(records, restore);

    stdout.write('\x1B[?25l'); // Hide cursor
    interactiveList.update();
    setInterval(interactiveList.update.bind(interactiveList), SYNC_INTERVAL);
};

export default interactive;
