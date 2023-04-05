import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

import { NonEmptyStack } from '../../../data-structures.js';
import LiveStore, { DefaultLiveStoreView } from './live-store/index.js';
import Mode, {
    AddMode,
    KeypressResult,
    NormalMode,
    RescheduleMode,
    SearchMode,
    SelectionMode,
} from './modes/index.js';
import Renderer from './renderer.js';

const RENDER_INTERVAL = 1000;

class InteractiveList {
    private liveStore: LiveStore;
    private modes: NonEmptyStack<Mode>;
    private onExit: () => void;
    private renderer: Renderer;

    constructor(liveStore: LiveStore, onExit: () => void) {
        this.liveStore = liveStore;
        const liveStoreView = new DefaultLiveStoreView(this.liveStore);
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

        if (key.meta && key.name === 'escape' && this.modes.pop()) {
            this.render();
            return;
        }

        const mode = this.modes.peek();
        const keypressResult = await mode.keypress(data, key);
        if (keypressResult == undefined) {
            return;
        }

        this.handleKeypressResult(mode, keypressResult);
    }

    private handleKeypressResult(mode: Mode, keypressResult: KeypressResult) {
        switch (keypressResult) {
            case KeypressResult.ADD:
                if (
                    mode instanceof NormalMode ||
                    mode instanceof SelectionMode
                ) {
                    this.modes.push(new AddMode(mode.liveStoreView));
                    break;
                }

                throw new Error('Something went wrong');
            case KeypressResult.RESCHEDULE:
                if (mode instanceof SelectionMode) {
                    const record = mode.getRecord();
                    if (record) {
                        this.modes.push(
                            new RescheduleMode(mode.liveStoreView, record)
                        );
                        break;
                    }
                }

                throw new Error('Something went wrong');
            case KeypressResult.SEARCH:
                if (
                    mode instanceof NormalMode ||
                    mode instanceof SelectionMode
                ) {
                    this.modes.push(new SearchMode(mode.liveStoreView));
                    break;
                }

                throw new Error('Something went wrong');
            case KeypressResult.SELECTION:
                if (mode instanceof NormalMode) {
                    this.modes.push(new SelectionMode(mode.liveStoreView));
                    break;
                }

                throw new Error('Something went wrong');
            case KeypressResult.SUBMIT:
                if (mode instanceof AddMode || mode instanceof RescheduleMode) {
                    this.modes.pop();
                    break;
                } else if (mode instanceof SearchMode) {
                    this.modes.pop();
                    this.modes.push(new SelectionMode(mode.liveStoreView));
                    break;
                }

                throw new Error('Something went wrong');
            case KeypressResult.CANCEL:
                if (
                    mode instanceof RescheduleMode ||
                    mode instanceof SearchMode
                ) {
                    this.modes.pop();
                    break;
                }

                throw new Error('Something went wrong');
            case KeypressResult.UPDATE:
                this.liveStore.update();
                break;
        }

        this.render();
        return;
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
