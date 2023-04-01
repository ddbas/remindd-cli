import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

import Mode, { NormalMode } from './modes/index.js';
import Renderer from './renderer.js';

const SYNC_INTERVAL = 5000;

class InteractiveList {
    mode: Mode;
    onExit: () => void;
    renderer: Renderer;

    constructor(onExit: () => void) {
        this.mode = new NormalMode();
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

        const { mode: newMode, update = false } =
            (await this.mode.keypress(data, key)) || {};
        if (newMode) {
            this.mode = newMode;
        }

        if (update || newMode) {
            this.update();
        }

        if (key.meta && key.name === 'escape') {
            this.mode = new NormalMode();
            this.update();
        }
    }

    async update() {
        const oldRecords = this.mode.liveStore.getRecords();
        await this.mode.liveStore.update();
        this.mode.update(oldRecords);

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

    const interactiveList = new InteractiveList(restore);

    stdout.write('\x1B[?25l'); // Hide cursor
    interactiveList.update();
    setInterval(interactiveList.update.bind(interactiveList), SYNC_INTERVAL);
};

export default interactive;
