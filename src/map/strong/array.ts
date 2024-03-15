import { InitialMapEntries } from "../initial-entries";
import { StrongMap } from "./default";

export class ArrayStrongMap<K, V> extends StrongMap<K, V[]>  {
    /**
     * @param entries optional initial entries
     */
    constructor(entries?: InitialMapEntries<K, V[]>) {
        super(() => [], entries);
    }

    /**
     * Pushes value to the specified key array.
     * If no array is associated with specified key, then an empty array will be created.
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
