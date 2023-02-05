import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

type Keypress = {
    str: string;
    key: {
        name: string;
        ctrl: boolean;
        meta: boolean;
        shift: boolean;
    };
};

type CancelCallback = () => any;
type KeypressCallback = (
    input: string,
    keypress: Keypress
) => string | undefined;
type RenderCallback = (input: string) => Promise<string>;
type SubmitCallback = (input: string) => any;
type ValidateCallback = (input: string) => boolean;

const clear = (previousPrompt: string): string => {
    const linesCount = previousPrompt.split(/\r?\n/).length;
    let clear = `\x1B[${linesCount - 1}B`; // Move cursor to the bottom
    for (let i = 1; i <= linesCount; i++) {
        clear += '\x1B[2K'; // Clear line
        if (i === linesCount) {
            clear += '\x1B[G'; // Move cursor to the start of the line
        } else {
            clear += '\x1B[1A'; // Move cursor up
        }
    }

    return clear;
};

const render = (message: string, input: string, content?: string): string => {
    let prompt = `${message} ${input}`;
    if (content) {
        prompt += `\x1B7\n${content}\x1B8`;
    }

    return prompt;
};

class Prompt {
    private message: string;
    private input: string;
    private previousPrompt: string | undefined;
    private destroy: () => void;

    private onCancel: CancelCallback;
    private onSubmit: SubmitCallback;
    private onKeypress?: KeypressCallback;
    private onRender?: RenderCallback;
    private validate?: ValidateCallback;

    constructor(options: {
        initialInput?: string;
        message: string;
        onCancel: CancelCallback;
        onKeypress?: KeypressCallback;
        onRender?: RenderCallback;
        onSubmit: SubmitCallback;
        validate?: ValidateCallback;
    }) {
        this.input = options.initialInput || '';
        this.message = options.message;
        this.onCancel = options.onCancel;
        this.onKeypress = options.onKeypress;
        this.onRender = options.onRender;
        this.onSubmit = options.onSubmit;
        this.validate = options.validate;

        if (!stdin.isTTY) {
            throw new Error('Must be run in a terminal.');
        }

        const rl = readline.createInterface({ input: stdin, output: stdout });
        readline.emitKeypressEvents(stdin, rl);
        stdin.setRawMode(true);

        this.destroy = () => {
            if (this.previousPrompt) {
                stdout.write(clear(this.previousPrompt));
            }

            stdin.setRawMode(false);
            rl.close();
        };

        stdin.on('keypress', this.keypress.bind(this));

        this.tick();
    }

    async tick() {
        let output = '\x1B[?25l'; // Hide cursor
        if (this.previousPrompt) {
            output += clear(this.previousPrompt);
        }

        if (this.onRender) {
            const content = await this.onRender(this.input);
            this.previousPrompt = render(this.message, this.input, content);
        } else {
            this.previousPrompt = render(this.message, this.input);
        }

        output += `${this.previousPrompt}\x1B[?25h`; // Show cursor
        stdout.write(output);
    }

    cancel() {
        this.destroy();
        this.onCancel();
    }

    submit() {
        if (this.validate) {
            if (!this.validate(this.input)) {
                return;
            }
        }

        this.destroy();
        this.onSubmit(this.input);
    }

    keypress(
        str: string,
        key: {
            name: string;
            ctrl: boolean;
            meta: boolean;
            shift: boolean;
        }
    ) {
        if (key.ctrl && key.name == 'c') {
            this.cancel();
            return;
        }

        if (key.ctrl || key.meta || key.shift) {
            return;
        }

        if (key.name === 'return' || key.name === 'enter') {
            stdout.write('\x1B[1A'); // Move cursor up. Not sure why enter key is sent to stdout.
            this.submit();
            return;
        }

        const inputOverride = this.onKeypress?.(this.input, { str, key });
        if (inputOverride !== undefined) {
            this.input = inputOverride;
            this.tick();
            return;
        }

        if (key.name === 'backspace') {
            this.input = this.input.slice(0, -1);
        } else {
            this.input += str;
        }

        this.tick();
    }
}

type Options = {
    message: string;
    initialInput?: string;
    onKeypress?: KeypressCallback;
    onRender?: RenderCallback;
    validate?: ValidateCallback;
};

const prompt = (options: Options): Promise<string | undefined> =>
    new Promise((resolve) => {
        new Prompt({
            ...options,
            onCancel: () => resolve(undefined),
            onSubmit: (input: string) => resolve(input),
        });
    });

export { Keypress };

export default prompt;
