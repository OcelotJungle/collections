/**
 * For cases where you're absolutely sure you have such value in map.
 * Doesn't perform any null-checks.
 */
export class EnsuredMap<K, V> extends Map<K, V> {
    /** @returns Returns the element associated with the specified key. */
    override get(key: K) {
        return super.get(key) as V;
    }
}
