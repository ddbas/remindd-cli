import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';
import remind from '@remindd/core';
import getAction, { Action, ActionType, Key } from './action.js';
import { NonEmptyStack } from '../../../data-structures.js';
import { getRecordFormatter } from '../../../format.js';
import Mode, {
    AddMode,
    NormalMode,
    RescheduleMode,
    SearchMode,
    SelectionMode,
} from './modes.js';
import Renderer from './renderer.js';
import { BaseLiveStore, LiveStore, Record } from '../../../store/index.js';
import makeSearcher from '../../../search.js';

const UPDATE_INTERVAL = 5000;

class InteractiveList {
    private format: (record: Record) => string;
    private liveStore: LiveStore;
    private renderer: Renderer;
    private modes: NonEmptyStack<Mode>;

    constructor() {
        this.format = getRecordFormatter();
        this.liveStore = new BaseLiveStore(
            UPDATE_INTERVAL,
            this.run.bind(this)
        );
        this.renderer = new Renderer(UPDATE_INTERVAL);
        this.modes = new NonEmptyStack(new NormalMode());
    }

    private async processAction(action: Action): Promise<boolean> {
        if (action.type === ActionType.Abort) {
            this.stop();
            return false;
        }

        if (action.type === ActionType.Exit) {
            const mode = this.modes.pop();
            return !!mode;
        }

        const mode = this.modes.peek();
        if (action.type === ActionType.Submit) {
            if (mode instanceof AddMode) {
                try {
                    const reminder = remind(mode.input);
                    await this.liveStore.create(reminder);
                    this.modes.pop();
                    return true;
                } catch {
                    // Invalid reminder
                    return false;
                }
            }

            if (mode instanceof RescheduleMode) {
                const records = this.liveStore.records;
                if (!records.length) {
                    return false;
                }

                const record = records.find(
                    (record) => record.id === mode.record.id
                );
                if (!record) {
                    return false;
                }

                const { date } = remind(mode.input);
                record.reminder.date = date;
                await this.liveStore.update(record);
                this.modes.pop();
                return true;
            }

            if (mode instanceof SearchMode) {
                this.modes.pop();
                this.modes.push(new SelectionMode());
                return true;
            }
        }

        if (action.type === ActionType.Up || action.type === ActionType.Down) {
            if (mode instanceof NormalMode) {
                if (!this.liveStore.records.length) {
                    return false;
                }

                this.modes.push(new SelectionMode());
                return true;
            }
        }

        if (action.type === ActionType.Text) {
            if (action.text === 'a') {
                if (
                    mode instanceof NormalMode ||
                    mode instanceof SelectionMode
                ) {
                    this.modes.push(new AddMode());
                    return true;
                }
            }

            if (action.text === '/') {
                if (
                    mode instanceof NormalMode ||
                    mode instanceof SelectionMode
                ) {
                    this.modes.push(new SearchMode());
                    return true;
                }
            }
        }

        return mode.processAction(action);
    }

    private run(): void {
        let query;
        for (const mode of this.modes) {
            if (mode instanceof SearchMode) {
                query = mode.query;
                break;
            }
        }

        let list;
        if (query) {
            const search = makeSearcher(this.liveStore.records, this.format);
            const results = search(query);
            list = { results };
        } else {
            list = { records: this.liveStore.records };
        }

        this.renderer.render({
            lastUpdate: this.liveStore.lastUpdate,
            list,
        });
    }

    start(): void {
        if (!stdin.isTTY) {
            throw new Error('Must run in a terminal.');
        }

        readline.emitKeypressEvents(stdin);
        stdin.setRawMode(true);
        stdout.write('\x1B[?25l'); // Hide cursor
        stdin.on('keypress', async (data: string, key: Key) => {
            const action = getAction(data, key);
            const update = await this.processAction(action);
            if (update) {
                this.run();
            }
        });

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
