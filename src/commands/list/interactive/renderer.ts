import { stdout } from 'node:process';
import getFormatter, {
    Formattable,
    getRecordFormatter,
} from '../../../format.js';
import { Record } from '../../../store/index.js';
import { formattableHeader } from '../utils.js';

interface ListContent {
    records: Record[];
    selectedRecord?: Record;
}

interface Prompt {
    message: string;
    input: string;
    // cursor: number; // TODO: cursor position
}

enum StatusType {
    INFO,
    ERROR,
}

interface Status {
    message: string;
    type?: StatusType;
}

interface Content {
    lastUpdate: number;
    status?: Status;
    prompt?: Prompt;
    list?: ListContent;
}

class Renderer {
    private format: (f: Formattable) => string;
    private formatRecord: (record: Record) => string;
    private currentContent: Content | undefined;
    private updateInterval: number;
    private updateTimeoutId?: NodeJS.Timeout;

    constructor(updateInterval: number) {
        this.format = getFormatter();
        this.formatRecord = getRecordFormatter();
        this.updateInterval = updateInterval;
    }

    private clear(): void {
        stdout.cursorTo(0, 0);
        stdout.clearScreenDown();
    }

    render(content: Content): void {
        this.clear();

        const rows: string[] = [];
        const { lastUpdate, prompt, list, status } = content;
        this.currentContent = content;

        // Status
        const statusRow = this.getStatusRow(lastUpdate, status);
        rows.push(statusRow);

        // Prompt
        const promptRow = prompt ? this.getPromptRow(prompt) : '';
        rows.push(promptRow);

        // Records
        if (list) {
            const { records, selectedRecord } = list;
            const recordRows = this.getRecordRows(records, selectedRecord);
            rows.push(...recordRows);
        }

        stdout.write(rows.join('\n'));

        this.updateTimeoutId = setTimeout(this.renderStatus.bind(this), 1000);
    }

    private renderStatus(): void {
        clearTimeout(this.updateTimeoutId); // in case render wasn't triggered by timeout.

        const content = this.currentContent;
        if (!content) {
            return;
        }

        const { lastUpdate, status } = content;
        const statusRow = this.getStatusRow(lastUpdate, status);

        stdout.cursorTo(0, 0);
        stdout.clearLine(1);
        stdout.write(statusRow);

        this.updateTimeoutId = setTimeout(this.renderStatus.bind(this), 1000);
    }

    private getStatusRow(lastUpdate: number, status?: Status): string {
        const elapsed = Date.now() - lastUpdate;
        const nextUpdate = Math.max(
            Math.round((this.updateInterval - elapsed) / 1000),
            0
        );

        if (!status) {
            return `(${nextUpdate})`;
        }

        const { message, type } = status;
        switch (type) {
            case StatusType.ERROR:
                return `(${nextUpdate}) \x1B[31m${message}\x1B[0m`;
            case StatusType.INFO:
            default:
                return `(${nextUpdate}) ${message}`;
        }
    }

    private getPromptRow(prompt: Prompt): string {
        return `${prompt.message}: ${prompt.input}`;
    }

    private getRecordRows(
        records: Record[],
        selectedRecord?: Record
    ): string[] {
        // Header
        const headerRow = this.format(formattableHeader);

        // Records
        const now = Date.now();
        const recordRows = records.map((record) => {
            const row = this.formatRecord(record);

            const isInPast = record.reminder.date.getTime() - now < 0;
            const isSelected =
                !!selectedRecord && record.id === selectedRecord.id;
            if (isInPast && isSelected) {
                return `\x1B[7m\x1B[31m${row}\x1B[0m`;
            } else if (isSelected) {
                return `\x1B[7m${row}\x1B[0m`;
            } else if (isInPast) {
                return `\x1B[31m${row}\x1B[0m`;
            }

            return row;
        });

        return [headerRow, ...recordRows];
    }

    stop(): void {
        clearTimeout(this.updateTimeoutId);
        this.clear();
    }
}

export default Renderer;
