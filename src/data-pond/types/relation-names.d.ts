import type { Keys } from ".";

export type RelationNames<T> =
    `${Keys<T>}-${Keys<T>}` extends infer R
        ? R extends `${infer A}-${infer B}`
            ? A extends B
                ? never
                : R
            : never
        : never;
