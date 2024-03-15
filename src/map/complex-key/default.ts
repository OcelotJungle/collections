import { InitialMapEntries } from "../initial-entries";

export class ComplexKeyMap<K, V> implements Map<K, V> {
    private readonly keyMap: Map<string, K> = new Map();
    private readonly valueMap: Map<string, V>;

    get size() { return this.valueMap.size }

    /**
     * @param defaultValueCallback a function that creates default V
     * @param entries optional initial entries
     */
    constructor(
        protected readonly defaultValueCallback: () => V,
        entries?: InitialMapEntries<K, V>,
    ) {
        const valueMapEntries: [string, V][] = [];

        for (const [key, value] of [...entries ?? []]) {
            const _key = this.keyify(key);

            this.keyMap.set(_key, key);
            valueMapEntries.push([_key, value]);
        }

        this.valueMap = new Map(valueMapEntries);
    }

    private keyify(key: K) { return JSON.stringify(key) }

    has(key: K) { return this.valueMap.has(this.keyify(key)) }

    /**
     * @returns Returns the element associated with the specified key. If no element is associated with the specified key, it is created in-time using defaultValueCallback.
     */
    get(key: K) {
        if (!this.has(key)) {
            this.set(key, this.defaultValueCallback());
        }

        return this.valueMap.get(this.keyify(key))!;
    }

    set(key: K, value: V) {
        const _key = this.keyify(key);

        this.keyMap.set(_key, key);
        this.valueMap.set(_key, value);

        return this;
    }

    clear() {
        this.keyMap.clear();
        this.valueMap.clear();
    }

    delete(key: K) {
        const _key = this.keyify(key);

        this.keyMap.delete(_key);
        return this.valueMap.delete(_key);
    }

    *entries(): IterableIterator<[K, V]> {
        for (const [_key, key] of this.keyMap) {
            yield [key, this.valueMap.get(_key)!];
        }
    }

    keys() { return this.keyMap.values() }
    values() { return this.valueMap.values() }
    [Symbol.iterator]() { return this.entries() }

    forEach(
        callbackfn: (value: V, key: K, map: this) => void,
        thisArg?: unknown,
    ) {
        for (const [_key, key] of this.keyMap) {
            callbackfn.call(thisArg, this.valueMap.get(_key)!, key, this);
        }
    }

    get [Symbol.toStringTag]() { return this.valueMap[Symbol.toStringTag] }
}
