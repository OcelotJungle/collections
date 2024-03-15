export type InitialMapEntries<K, V> =
    Iterable<readonly [K, V]>
    | readonly (readonly [K, V])[]
    | null
    | undefined;
