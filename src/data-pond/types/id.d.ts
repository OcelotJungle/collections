import type { Keys } from ".";

export type Id = string | number;

export type IdExtractor<T = unknown> = (entity: T) => Id;

export type IdExtractors<T> = {
    [EntityName in Keys<T>]: IdExtractor<T[EntityName]>;
}
