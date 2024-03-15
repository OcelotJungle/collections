export class ComplexSet<K, I> implements Set<I> {
    private readonly map = new Map<K, I>();

    get size() { return this.map.size }

    /**
     * @param selector function that reduces item to key (i.e. { foo: number, bar: string } => foo)
     * @param updateExisting replace by new item if same-key item already in set? default: false
     */
    constructor(
        private readonly selector: (item: I) => K,
        private readonly updateExisting = false,
    ) { }

    has(item: I) {
        return this.map.has(this.selector(item));
    }

    add(item: I) {
        const key = this.selector(item);

        if (!this.map.has(key) || this.updateExisting) {
            this.map.set(key, item);
        }

        return this;
    }

    get(key: K) {
        return this.map.get(key);
    }

    clear() {
        this.map.clear();
    }

    delete(item: I) {
        return this.map.delete(this.selector(item));
    }

    /** Returns an iterable of keys in the set. */
    // @ts-expect-error It implements Set<I>, but it's not Set<I>
    keys() { return this.map.keys() }

    values() { return this.map.values() }

    /** Returns an iterable of key, value pairs for every entry in the set. */
    // @ts-expect-error Still not Set<I>
    entries() { return this.map.entries() }

    [Symbol.iterator]() { return this.values() }

    // @ts-expect-error And here not Set<I>
    forEach(
        callbackfn: (item: I, key: K, set: this) => void,
        thisArg?: unknown,
    ) {
        for (const [key, item] of this.map) {
            callbackfn.call(thisArg, item, key, this);
        }
    }

    get [Symbol.toStringTag]() { return this.map[Symbol.toStringTag] }
}
