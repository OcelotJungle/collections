import { InitialMapEntries } from "../initial-entries";

export class StrongMap<K, V> extends Map<K, V> {
    /**
     * @param defaultValueCallback a function that creates default V
     * @param entries optional initial entries
     */
    constructor(
        protected readonly defaultValueCallback: () => V,
        entries?: InitialMapEntries<K, V>,
    ) {
        super(entries);
    }

    /**
     * @returns Returns the element associated with the specified key. If no element is associated with the specified key, it is created in-time using defaultValueCallback.
     */
    override get(key: K) {
        if (!this.has(key)) {
            this.set(key, this.defaultValueCallback());
        }

        return super.get(key)!;
    }
}
