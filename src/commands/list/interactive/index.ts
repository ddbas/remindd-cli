import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

import { NonEmptyStack } from '../../../data-structures.js';
import LiveStore, { DefaultLiveStoreView } from './live-store/index.js';
import Mode, { NormalMode } from './modes/index.js';
import Renderer from './renderer.js';

const RENDER_INTERVAL = 1000;

class InteractiveList {
    private modes: NonEmptyStack<Mode>;
    private onExit: () => void;
    private renderer: Renderer;

    constructor(liveStore: LiveStore, onExit: () => void) {
        const liveStoreView = new DefaultLiveStoreView(liveStore);
        this.modes = new NonEmptyStack(new NormalMode(liveStoreView));
        this.renderer = new Renderer();
        this.onExit = onExit;

        setInterval(this.render.bind(this), RENDER_INTERVAL);
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

            this.render();
            return;
        }

        if (key.meta && key.name === 'escape' && this.modes.pop()) {
            this.render();
            return;
        }
    }

    render() {
        const mode = this.modes.peek();
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

    const liveStore = new LiveStore();
    await liveStore.update();
    const interactiveList = new InteractiveList(liveStore, restore);

    stdout.write('\x1B[?25l'); // Hide cursor
    interactiveList.render();
};

export default interactive;
