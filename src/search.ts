import { Fzf } from 'fzf';

interface FzfSearchResult<Item> {
    item: {
        item: Item;
        text: string;
    };
    start: number;
    end: number;
    score: number;
    positions: Set<number>;
}

interface Match {
    start: number;
    end: number; // excluded from the match
}

interface SearchResult<Item> {
    item: Item;
    matches: Match[];
    text: string;
}

const makeSearcher = <Item>(
    items: Item[],
    toString: (item: Item) => string
): ((query: string) => SearchResult<Item>[]) => {
    const textItems = items.map((item) => ({ item, text: toString(item) }));
    const fzf = new Fzf(textItems, {
        selector: (item: { item: Item; text: string }) => item.text,
    });

    return (query: string): SearchResult<Item>[] => {
        const results: FzfSearchResult<Item>[] = fzf.find(query);
        return results.map((result) => {
            const {
                item: { item, text },
                positions,
            } = result;
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
                item,
                matches,
                text,
            };
        });
    };
};

const getWrappedResultText = (
    result: SearchResult<any>,
    start: string,
    end: string
): string => {
    const { matches, text } = result;
    return matches.reduce((highlightedText, match) => {
        const { start: startIndex, end: endIndex } = match;
        let offset = highlightedText.length - text.length;
        const offsetStart = startIndex + offset;
        const newHighlightedText =
            highlightedText.slice(0, offsetStart) +
            start +
            highlightedText.slice(offsetStart);
        offset = newHighlightedText.length - text.length;
        const offsetEnd = endIndex + offset;
        return (
            newHighlightedText.slice(0, offsetEnd) +
            end +
            newHighlightedText.slice(offsetEnd)
        );
    }, text);
};

export { Match, SearchResult, getWrappedResultText };

export default makeSearcher;
