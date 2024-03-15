import { EnsuredMap } from "./default";

/**
 * For cases where you're absolutely sure you have such value in map.
 * Doesn't perform any null-checks.
 */
export class ArrayEnsuredMap<K, V> extends EnsuredMap<K, V[]> {
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
        else this.set(args[0], []);
    }
}
