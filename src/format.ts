import { Record } from './store.js';

const DEFAULT_COMPONENT_WIDTHS = {
    i: 8,
    d: 14,
    t: 30,
};

const DEFAULT_TEMPLATE = '%i  %d  %t';

interface Formattable {
    i(): string; // ID component of the formattable type.
    d(): string; // Date component of the formattable type.
    t(): string; // Title component of the formattable type.
}

class FormattableRecord implements Formattable {
    private record: Record;

    constructor(record: Record) {
        this.record = record;
    }

    i(): string {
        return this.record.id;
    }

    d(): string {
        const {
            reminder: { date },
        } = this.record;
        return `${date.toLocaleDateString('en-US', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
        })} ${date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            hour12: false,
            minute: '2-digit',
        })}`;
    }

    t(): string {
        return this.record.reminder.title;
    }
}

const setTextWidth = (text: string, width: number) => {
    if (text.length > width) {
        const trimmedColumn = text.substring(0, width - 3);
        return trimmedColumn.padEnd(width, '.');
    }

    return text.padEnd(width, ' ');
};

const getFormatter = (
    template: string = DEFAULT_TEMPLATE
): ((f: Formattable) => string) => {
    const regex = /%([idt])/g;
    return (formattable: Formattable): string => {
        return template.replace(regex, (_, placeholderIdentifier) => {
            switch (placeholderIdentifier) {
                case 'i':
                    return setTextWidth(
                        formattable.i(),
                        DEFAULT_COMPONENT_WIDTHS.i
                    );
                case 'd':
                    return setTextWidth(
                        formattable.d(),
                        DEFAULT_COMPONENT_WIDTHS.d
                    );
                case 't':
                    return setTextWidth(
                        formattable.t(),
                        DEFAULT_COMPONENT_WIDTHS.t
                    );
                default:
                    throw new Error(
                        `Unexpected placeholder: ${placeholderIdentifier}.`
                    );
            }
        });
    };
};

export { Formattable, FormattableRecord };

export default getFormatter;
