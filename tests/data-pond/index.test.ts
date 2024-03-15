import { DataPond } from "../../src";

describe("Data pond", () => {
    const pond = DataPond.create<{
        foo: { id: number };
        bar: { name: number };
    }>({
        foo: ({ id }) => id,
        bar: ({ name }) => name,
    });

    test("adds", () => {
        pond
            .add("foo", { id: 11 })

            .add("bar", { name: 1 })
            .add("bar", { name: 2 })
            .add("bar", { name: 3 })
            .add("bar", { name: 4 })
            .add("bar", { name: 5 });

        // @ts-expect-error Private property hidden by type
        const entities = pond.entities as Map<string, Map<unknown, unknown>>;

        expect(entities.has("foo")).toBe(true);
        expect(entities.has("bar")).toBe(true);

        expect(entities.get("foo")?.size).toBe(1);
        expect(entities.get("bar")?.size).toBe(5);
    });

    test("relates", () => {
        pond
            .relate(["bar", 1], ["foo", 11])
            .relate({ owner: ["foo", 11], item: ["bar", 2] })
            .relate({ owner: ["foo", 11], item: [["bar", 3], ["bar", 4]] });


        pond
            .add("foo", { id: 21 })
            .relate(["bar", 1])
            .relate(["bar", 2])
            .relate({ item: ["bar", 3] })
            .relate({ item: [["bar", 4], ["bar", 5]] });


        pond
            .add("foo", { id: 22 })
            .add("bar", { name: 6 })
            .relate();

        pond
            .relate({ owner: [], item: [] });

        // @ts-expect-error Still private property
        const entities = pond.entities as Map<string, Map<unknown, unknown>>;

        expect(entities.get("foo")?.size).toBe(3);
        expect(entities.get("bar")?.size).toBe(6);

        // @ts-expect-error Again
        const relations = pond.relations as Map<string, Map<unknown, Set<unknown>>>;

        expect(relations.has("foo-bar")).toBe(true);
        expect(relations.get("foo-bar")?.get(11)?.size).toBe(4);
        expect(relations.get("foo-bar")?.get(21)?.size).toBe(5);
        expect(relations.get("foo-bar")?.get(22)?.size).toBe(1);
    });

    test("fetches", () => {
        expect(pond.fetch("foo", 0)).toBeUndefined();

        expect(pond.fetch("foo", 11)).toEqual({ id: 11 });

        expect(pond.fetch("foo", 11, ["bar"])).toEqual({
            id: 11,
            _bar: [
                { name: 1 },
                { name: 2 },
                { name: 3 },
                { name: 4 },
            ],
        });

        expect(pond.fetch("foo", 21, ["bar"])).toEqual({
            id: 21,
            _bar: [
                { name: 1 },
                { name: 2 },
                { name: 3 },
                { name: 4 },
                { name: 5 },
            ],
        });

        expect(pond.fetch("foo", 22, ["bar"])).toEqual({
            id: 22,
            _bar: [{ name: 6 }],
        });
    });
});
