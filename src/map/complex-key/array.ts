import { InitialMapEntries } from "../initial-entries";
import { ComplexKeyMap } from "./default";

export class ArrayComplexKeyMap<K, V> extends ComplexKeyMap<K, V[]> {
    constructor(entries?: InitialMapEntries<K, V[]>) {
        super(() => [], entries);
    }

    /**
     * Pushes items to the specified key array.
     */
    push(key: K, ...items: V[]) {
        this.get(key).push(...items);
    }

    /**
     * Emptifies array of the specified key.
     */
    override clear(key: K): void;

    /**
     * Removes all entries.
     */
    override clear(): void;

    override clear(...args: [] | [K]) {
        if (args.length === 0) super.clear();
        else this.set(args[0], this.defaultValueCallback());
    }
}
