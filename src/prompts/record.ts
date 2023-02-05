import getFormatter, { Formattable, FormattableRecord } from '../format.js';
import prompt, { Keypress } from './prompt.js';
import makeSearcher, { Match, SearchResult } from '../search.js';
import { Record } from '../store.js';

const DEFAULT_LIMIT = 10;

const getHighlightedText = (text: string, matches: Match[]): string => {
    const greenStart = '\x1b[32m';
    const greenEnd = '\x1b[39m';
    return matches.reduce((highlightedText, match) => {
        const { start, end } = match;
        let offset = highlightedText.length - text.length;
        const offsetStart = start + offset;
        const newHighlightedText =
            highlightedText.slice(0, offsetStart) +
            greenStart +
            highlightedText.slice(offsetStart);
        offset = newHighlightedText.length - text.length;
        const offsetEnd = end + offset;
        return (
            newHighlightedText.slice(0, offsetEnd) +
            greenEnd +
            newHighlightedText.slice(offsetEnd)
        );
    }, text);
};

class RecordPrompt {
    private format: (f: Formattable) => string;
    private limit: number;
    private records: Record[];
    private results: SearchResult[];
    private search: (query: string) => SearchResult[];
    private selectionIndex: number;
    private startIndex: number;

    constructor(records: Record[]) {
        this.results = [];
        this.limit = DEFAULT_LIMIT;
        this.records = records;
        this.selectionIndex = 0;
        this.startIndex = 0;
        this.format = getFormatter();
        const toString = (record: Record) =>
            this.format(new FormattableRecord(record));
        this.search = makeSearcher(this.records, toString);
    }

    keypress(input: string, keypress: Keypress): string | undefined {
        const { key } = keypress;

        if (key.name === 'up') {
            this.updateSelectionIndex(this.selectionIndex - 1);
            return input;
        }

        if (key.name === 'down') {
            this.updateSelectionIndex(this.selectionIndex + 1);
            return input;
        }

        return undefined;
    }

    async render(input: string): Promise<string> {
        this.filterRecords(input);

        let output = `${this.results.length}/${this.records.length}\n`;
        this.results.forEach((result, index) => {
            if (
                index < this.startIndex ||
                index >= this.startIndex + this.limit
            ) {
                return;
            }

            const { record, matches } = result;
            const resultText = this.format(new FormattableRecord(record));
            const highlightedResult = getHighlightedText(resultText, matches);
            if (this.selectionIndex === index) {
                output += `> ${highlightedResult}`;
            } else {
                output += `  ${highlightedResult}`;
            }

            if (index !== this.results.length - 1) {
                output += `\n`;
            }
        });

        return output;
    }

    isValidSelection() {
        return this.selectionIndex < this.results.length;
    }

    getSelectedRecord(): Record {
        if (
            this.selectionIndex < 0 ||
            this.selectionIndex > this.results.length - 1
        ) {
            throw new Error('Failed to get the selected record.');
        }

        const { record } = this.results[this.selectionIndex];
        return record;
    }

    filterRecords(searchText: string) {
        this.results = this.search(searchText);
        this.updateSelectionIndex(this.selectionIndex);
    }

    updateSelectionIndex(selectionIndex: number) {
        this.selectionIndex = Math.max(
            0,
            Math.min(selectionIndex, this.results.length - 1)
        );
        this.updateStartIndex();
    }

    updateStartIndex() {
        let newStartIndex = Math.min(this.selectionIndex, this.startIndex);
        const diff = Math.max(
            this.selectionIndex - (newStartIndex + this.limit - 1),
            0
        );
        newStartIndex += diff;
        this.startIndex = newStartIndex;
    }
}

const record = async (
    searchText: string,
    records: Record[]
): Promise<Record | undefined> => {
    const recordPrompt = new RecordPrompt(records);

    const input = await prompt({
        message: 'Search:',
        initialInput: searchText,
        onKeypress: recordPrompt.keypress.bind(recordPrompt),
        onRender: recordPrompt.render.bind(recordPrompt),
        validate: recordPrompt.isValidSelection.bind(recordPrompt),
    });

    // Check if user cancelled
    if (input === undefined) {
        return undefined;
    }

    return recordPrompt.getSelectedRecord();
};

export default record;
