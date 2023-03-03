import { Fzf } from 'fzf';

import getFormatter, { FormattableRecord } from './format.js';
import { Record } from './store/index.js';

type FzfSearchResult = {
    item: Record;
    start: number;
    end: number;
    score: number;
    positions: Set<number>;
};

type Match = {
    start: number;
    end: number; // excluded from the match
};

type SearchResult = {
    record: Record;
    matches: Match[];
};

const makeSearcher = (
    records: Record[]
): ((query: string) => SearchResult[]) => {
    const format = getFormatter();
    const toString = (record: Record) => format(new FormattableRecord(record));
    const fzf = new Fzf(records, {
        selector: toString,
    });

    return (query: string): SearchResult[] => {
        const results: FzfSearchResult[] = fzf.find(query);
        return results.map((result) => {
            const { item: record, positions } = result;
            const sortedIndices = Array.from(positions).sort((a, b) => a - b);
            let startValue = sortedIndices[0];
            let previousValue = startValue - 1;
            const matches = sortedIndices.reduce((matches, value, index) => {
                const diff = value - previousValue;
                if (diff > 1) {
                    matches.push({ start: startValue, end: previousValue + 1 });
                    startValue = value;
                } else if (diff < 1) {
                    throw new Error(
                        'Unexpected state: Expected previous index to be smaller than current index.'
                    );
                }

                if (index === sortedIndices.length - 1) {
                    matches.push({ start: startValue, end: value + 1 });
                }

                previousValue = value;
                return matches;
            }, [] as Match[]);
            return {
                record,
                matches,
            };
        });
    };
};

export { Match, SearchResult };

export default makeSearcher;
