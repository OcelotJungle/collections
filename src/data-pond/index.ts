import type {
    PondSchema,
    Id,
    IdExtractor,
    IdExtractors,
    Keys,
    Pointer,
    RelationNames,
    DataPond0,
} from "./types";

import { EnsuredMap, StrongMap } from "..";

export type { Id, IdExtractor, IdExtractors, Pointer };

export class DataPond<T extends PondSchema> {
    private readonly entities = new StrongMap<Keys<T>, Map<Id, unknown>>(() => new Map());
    private readonly idExtractors: EnsuredMap<Keys<T>, IdExtractor>;

    private cachedOwner?: Pointer<T> | undefined;
    private cachedItem?: Pointer<T> | undefined;

    private readonly relations: StrongMap<
        RelationNames<T>,
        StrongMap<Id, Set<Id>>
    > = new StrongMap(() => new StrongMap(() => new Set()));

    private constructor(idExtractors: IdExtractors<T>) {
        this.idExtractors = new EnsuredMap(Object.entries(idExtractors));
    }

    /**
     * @param idExtractors record with callbacks that reduces entity to its id
     */
    static create<T extends PondSchema>(idExtractors: IdExtractors<T>) {
        return new this(idExtractors) as DataPond0<T>;
    }

    /** See ./types/variants/DataPondAdd for docs */
    add(entityName: Keys<T>, entity: unknown) {
        const id = this.idExtractors.get(entityName)(entity);

        this.entities
            .get(entityName)
            .set(id, entity);

        const pointer: Pointer<T> = [entityName, id];

        if (this.cachedOwner) {
            if (this.cachedItem) this.cachedOwner = this.cachedItem;
            this.cachedItem = pointer;
        }
        else this.cachedOwner = pointer;

        return this;
    }

    /** See ./types/variants/DataPondRelate for docs */
    relate(...args: (
        | [arg?: { owner?: Pointer<T> | Pointer<T>[], item?: Pointer<T> | Pointer<T>[] } | undefined]
        | [item?: Pointer<T> | Pointer<T>[] | undefined, owner?: Pointer<T> | Pointer<T>[] | undefined]
    )) {
        const [_item, _owner] = this.getRelateArgs(args);

        const owners = this.getPointerArray(_owner, this.cachedOwner);
        const items = this.getPointerArray(_item, this.cachedItem);

        for (const [ownerName, ownerId] of owners) {
            for (const [itemName, itemId] of items) {
                this.relations
                    .get(`${ownerName}-${itemName}` as RelationNames<T>)
                    .get(ownerId)
                    .add(itemId);
            }
        }

        if (this.cachedItem) {
            this.cachedOwner = this.cachedItem = undefined;
        }

        return this;
    }

    private getRelateArgs(args: (
        | [arg?: { owner?: Pointer<T> | Pointer<T>[], item?: Pointer<T> | Pointer<T>[] } | undefined]
        | [item?: Pointer<T> | Pointer<T>[] | undefined, owner?: Pointer<T> | Pointer<T>[] | undefined]
    )): [item?: Pointer<T> | Pointer<T>[] | undefined, owner?: Pointer<T> | Pointer<T>[] | undefined] {
        if (args.length === 0 || args[0] === undefined) return [];
        if (args.length === 2) return [args[0], args[1]];
        if (Array.isArray(args[0])) return [args[0]];

        return [args[0].item, args[0].owner];
    }

    private getPointerArray(
        pointer: Pointer<T> | Pointer<T>[] | undefined,
        fallback: Pointer<T> | undefined,
    ) {
        if (!pointer) return [fallback!];
        if (!pointer.length) return [];

        if (pointer.some(Array.isArray)) return pointer as Pointer<T>[];

        return [pointer] as Pointer<T>[];
    }

    /** Fetches specified entity. */
    fetch<EntityName extends Keys<T>>(entityName: EntityName, entityId: Id): T[EntityName];

    /**
     * Fetches specified entity.
     * 
     * @param relations an array of relations to subfetch
     */
    fetch<
        EntityName extends Keys<T>,
        Relations extends Keys<T>[] = [],
    >(
        entityName: EntityName,
        entityId: Id,
        relations: Relations
    ): T[EntityName] & { [R in (Relations[number]) as `_${R}`]: T[R][] };

    fetch(name: Keys<T>, id: Id, relations: Keys<T>[] = []) {
        const entities = this.entities.get(name);

        if (!entities.has(id)) return undefined;

        const entity = entities.get(id);

        for (const relation of relations) {
            const entities = this.entities.get(relation);

            // @ts-expect-error adding new field is a point
            entity[`_${relation}`] = [...this.relations
                .get(`${name}-${relation}` as RelationNames<T>)
                .get(id)]
                .filter(id => entities.has(id))
                .map(id => entities.get(id));
        }

        return entity;
    }
}
