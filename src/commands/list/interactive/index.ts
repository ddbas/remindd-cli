import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';
import LiveStore from './live-store.js';
import Renderer from './renderer.js';

const UPDATE_INTERVAL = 5000;

class InteractiveList {
    private liveStore: LiveStore;
    private renderer: Renderer;

    constructor() {
        this.liveStore = new LiveStore(UPDATE_INTERVAL, this.run.bind(this));
        this.renderer = new Renderer(UPDATE_INTERVAL);
    }

    private keypress(
        data: string,
        key: {
            name: string;
            ctrl: boolean;
            meta: boolean;
            shift: boolean;
        }
    ): void {
        if (key.ctrl && key.name === 'c') {
            this.stop();
            return;
        }
    }

    private run(): void {
        this.renderer.render({
            lastUpdate: this.liveStore.lastUpdate,
            list: {
                records: this.liveStore.records,
            },
            status: { message: 'foooooo hefawf' },
        });
    }

    start(): void {
        if (!stdin.isTTY) {
            throw new Error('Must run in a terminal.');
        }

        readline.emitKeypressEvents(stdin);
        stdin.setRawMode(true);
        stdout.write('\x1B[?25l'); // Hide cursor
        stdin.on('keypress', this.keypress.bind(this));

        this.liveStore.start();
        this.run();
    }

    private stop(): void {
        this.liveStore.stop();
        this.renderer.stop();
        this.restore();
        process.exit();
    }

    private restore(): void {
        stdout.write('\x1B[?25h'); // Show cursor
        stdin.setRawMode(false);
    }
}

export default InteractiveList;
