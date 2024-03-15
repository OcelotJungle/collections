import { ComplexSet } from "../../src";

type Item = [number, number];
type S = ComplexSet<number, Item>;

const selector: (item: Item) => number = ([i]) => i;

describe("Complex Set", () => {
    test("being created", () => {
        new ComplexSet(selector) as S;
    });

    test("has right size", () => {
        const s: S = new ComplexSet(selector);

        expect(s.size).toBe(0);

        s.add([1, 2]);

        expect(s.size).toBe(1);

        s.delete([1, 2]);

        expect(s.size).toBe(0);
    });

    test("knows that has item", () => {
        const s: S = new ComplexSet(selector);

        expect(s.has([1, 2])).toBe(false);

        s.add([1, 2]);

        expect(s.has([1, 2])).toBe(true);

        s.delete([1, 2]);

        expect(s.has([1, 2])).toBe(false);
    });

    test("returns right item", () => {
        const s: S = new ComplexSet(selector, true);

        const _12 = [1, 2] as Item;
        const _34 = [3, 4] as Item;

        s.add(_12);
        s.add(_34);

        expect(s.get(1)).toBe(_12);
        expect(s.get(3)).toBe(_34);
    });

    test("updates existing", () => {
        const s: S = new ComplexSet(selector, true);

        const _1 = [1, 2] as Item;
        const _2 = [1, 2] as Item;

        s.add(_1);
        s.add(_2);

        expect(s.get(1)).not.toBe(_1);
        expect(s.get(1)).toBe(_2);
    });

    test("not updates existing", () => {
        const s: S = new ComplexSet(selector, false);

        const _1 = [1, 2] as Item;
        const _2 = [1, 2] as Item;

        s.add(_1);
        s.add(_2);

        expect(s.get(1)).toBe(_1);
        expect(s.get(1)).not.toBe(_2);
    });

    test("clears all", () => {
        const s: S = new ComplexSet(selector);

        s.add([1, 2]);
        s.add([3, 4]);

        expect(s.size).toBe(2);

        s.clear();

        expect(s.size).toBe(0);
    });

    test("creates right iterators", () => {
        const s: S = new ComplexSet(selector);

        const items = [
            [1, 2],
            [3, 4],
        ] as [Item, Item];

        s.add([1, 2]);
        s.add([3, 4]);

        expect([...s.entries()]).toEqual(items.map((item) => [item[0], item]));
        expect([...s.keys()]).toEqual(items.map(([key]) => key));
        expect([...s[Symbol.iterator]()]).toEqual(items);

        s.forEach(([a, b]) => expect(b - a).toBe(1));
    });

    test("stringifies", () => {
        expect(typeof (new ComplexSet(() => 0) as S)[Symbol.toStringTag]).toBe("string");
    });
});
