export class Stack<Item> implements Iterable<Item> {
    private items: Item[] = [];

    peek(): Item | undefined {
        if (!this.items.length) {
            return;
        }

        return this.items[this.items.length - 1];
    }

    pop(): Item | undefined {
        return this.items.pop();
    }

    push(item: Item) {
        this.items.push(item);
    }

    size(): number {
        return this.items.length;
    }

    [Symbol.iterator](): Iterator<Item> {
        return Array.from(this.items).reverse().values();
    }
}

export class NonEmptyStack<Item> {
    private stack: Stack<Item>;

    constructor(item: Item) {
        this.stack = new Stack();
        this.stack.push(item);
    }

    peek(): Item {
        const item = this.stack.peek();
        if (!item) {
            throw new Error("[NonEmptyStack] Something wen't wrong");
        }

        return item;
    }

    pop(): Item | undefined {
        if (this.stack.size() <= 1) {
            return undefined;
        }

        return this.stack.pop() as Item;
    }

    push(item: Item) {
        this.stack.push(item);
    }

    size(): number {
        return this.stack.size();
    }

    [Symbol.iterator](): Iterator<Item> {
        return this.stack[Symbol.iterator]();
    }
}
