import { ComplexKeyMap } from "../../../src";

type Key = [number, number];
type Value = number;
type Entry = [Key, Value];
type M = ComplexKeyMap<Key, Value>;

describe("Complex Key Map", () => {
    test("being created", () => {
        new ComplexKeyMap(() => 0) as M;
    });

    test("being created with initial entries", () => {
        const m: M = new ComplexKeyMap(() => 0, [
            [[1, 2], 3],
            [[3, 4], 7],
        ]);

        expect(m.get([1, 2])).toBe(3);
        expect(m.get([3, 4])).toBe(7);
    });

    test("has valid size", () => {
        const m: M = new ComplexKeyMap(() => 0);

        expect(m.size).toBe(0);

        m.set([1, 2], 3);

        expect(m.size).toBe(1);

        m.get([3, 4]);

        expect(m.size).toBe(2);

        m.clear();

        expect(m.size).toBe(0);
    });

    test("ensures any key has at least default value", () => {
        const m: M = new ComplexKeyMap(() => -1, [
            [[1, 2], 3],
        ]);

        expect(m.get([1, 2])).toBe(3);
        expect(m.get([3, 4])).toBe(-1);
    });

    test("creates right iterators", () => {
        const entries = [
            [[1, 2], 3],
            [[3, 4], 7],
        ] as [Entry, Entry];

        const m: M = new ComplexKeyMap(() => 0, entries);

        expect([...m[Symbol.iterator]()]).toEqual(entries);
        expect([...m.keys()]).toEqual(entries.map(([key]) => key));
        expect([...m.values()]).toEqual(entries.map(([_, value]) => value));

        m.forEach((c, [a, b]) => expect(a + b).toBe(c));
    });

    test("deletes by key", () => {
        const m: M = new ComplexKeyMap(() => -1, [
            [[1, 2], 3],
            [[3, 4], 7],
        ]);

        expect(m.size).toBe(2);
        expect(m.get([1, 2])).toBe(3);

        expect(m.delete([1, 2])).toBe(true);

        expect(m.size).toBe(1);
        expect(m.get([1, 2])).toBe(-1);
    });

    test("stringifies", () => {
        expect(typeof (new ComplexKeyMap(() => 0) as M)[Symbol.toStringTag]).toBe("string");
    });
});
