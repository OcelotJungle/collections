import type { DataPond } from "..";
import type { Pointer, Keys, PondSchema } from ".";

type Switch<Value, Cases extends [unknown, unknown][]> =
    Cases extends [infer Case, ...infer Rest]
        ? Case extends [infer V, infer R]
            ? V extends Value
                ? R
                : Switch<Value, Rest>
            : never
        : never;

type DataPondBase<T extends PondSchema> = Omit<DataPond<T>, "add" | "relate">;

interface DataPondAdd<T extends PondSchema, TReturn extends DataPondBase<T>> {
    /**
     * Adds an entity into a pond.
     * 
     * If called in a chain, then (see `relate`):
     * - for first call returns pond with cached owner;
     * - for other calls returns pond with cached owner and item (last two added entities);
     */
    <EntityName extends Keys<T>>(entityName: EntityName, entity: T[EntityName]): TReturn;
}

interface DataPondRelate<
    T extends PondSchema,
    TReturn extends DataPondBase<T>,
    ObligatoryCount extends 0 | 1 | 2,
    Pointers = Pointer<T> | Pointer<T>[],
    MaybePointers = Pointers | undefined,
> {
    /**
     * Relates an item entity to an owner entity.
     * 
     * - if called on "no-cache" pond, requires item and owner;
     * 
     * - if called on "owner-cache" pond, requires only item,
     * that will be related to a cached owner (or you can define owner explicitly);
     * can be called in a chain, preserving cached owner;
     * 
     * - if called on "full-cache" pond, then zero-argument call will relate cached item to cached owner
     * (or you can define item and/or owner explicitly);
     * 
     * Pond "remembers" only two last added entities!
     */

    (...args: Switch<ObligatoryCount, [
        [0, [item?: MaybePointers, owner?: MaybePointers]],
        [1, [item: Pointers, owner?: MaybePointers]],
        [2, [item: Pointers, owner: Pointers]],
    ]>): TReturn;

    (arg: Switch<ObligatoryCount, [
        [0, { owner?: MaybePointers, item?: MaybePointers } | undefined],
        [1, { owner: Pointers, item?: MaybePointers } | { owner?: MaybePointers, item: Pointers }],
        [2, { owner: Pointers, item: Pointers }],
    ]>): TReturn;
}

type DataPond0<T extends PondSchema> = DataPondBase<T> & {
    add: DataPondAdd<T, DataPond1<T>>;
    relate: DataPondRelate<T, DataPond0<T>, 2>;
};

type DataPond1<T extends PondSchema> = DataPondBase<T> & {
    add: DataPondAdd<T, DataPond2<T>>;
    relate: DataPondRelate<T, DataPond1<T>, 1>;
};

type DataPond2<T extends PondSchema> = DataPondBase<T> & {
    add: DataPondAdd<T, DataPond2<T>>;
    relate: DataPondRelate<T, DataPond0<T>, 0>;
};

export type { DataPond0 };
