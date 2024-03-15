import { ArrayComplexKeyMap } from "../../../src";

type Key = [number, number];
type Value = number;
type M = ArrayComplexKeyMap<Key, Value>;

describe("Array Complex Key Map", () => {
    test("being created", () => {
        new ArrayComplexKeyMap() as M;
    });

    test("being created with initial entries", () => {
        const m: M = new ArrayComplexKeyMap([
            [[1, 2], [2, 4]],
            [[3, 4], [6, 8]],
        ]);

        expect(m.get([1, 2])).toEqual([2, 4]);
        expect(m.get([3, 4])).toEqual([6, 8]);
    });

    test("pushes to existing and unexisting keys", () => {
        const m: M = new ArrayComplexKeyMap([[[1, 2], []]]);

        m.push([1, 2], 2);
        m.push([1, 2], 4);

        m.push([3, 4], 6);
        m.push([3, 4], 8);

        expect(m.get([1, 2])).toEqual([2, 4]);
        expect(m.get([3, 4])).toEqual([6, 8]);
    });

    test("clears all", () => {
        const m: M = new ArrayComplexKeyMap([[[1, 2], [2, 4]]]);

        expect(m.size).toBe(1);

        m.clear();

        expect(m.size).toBe(0);
    });

    test("clears by key", () => {
        const m: M = new ArrayComplexKeyMap([[[1, 2], [2, 4]]]);

        expect(m.get([1, 2])).toEqual([2, 4]);

        m.clear([1, 2]);

        expect(m.get([1, 2])).toEqual([]);
    });
});
