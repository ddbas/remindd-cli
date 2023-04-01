interface NonEmptyStack<Item> {
    peek(): Item;
    pop(): Item;
    push(item: Item): void;
    size(): number;
}
