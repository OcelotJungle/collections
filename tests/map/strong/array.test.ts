import { ArrayStrongMap } from "../../../src";

type M = ArrayStrongMap<number, number>;

describe("Array Strong Map", () => {
    test("being created", () => {
        new ArrayStrongMap() as M;
    });

    test("being created with initial entries", () => {
        const m: M = new ArrayStrongMap([
            [1, [1, 2]],
            [2, [2, 4]],
        ]);

        expect(m.get(1)).toEqual([1, 2]);
        expect(m.get(2)).toEqual([2, 4]);
    });

    test("pushes to existing and unexisting keys", () => {
        const m: M = new ArrayStrongMap([[1, []]]);

        m.push(1, 1);
        m.push(1, 2);

        m.push(2, 2);
        m.push(2, 4);

        expect(m.get(1)).toEqual([1, 2]);
        expect(m.get(2)).toEqual([2, 4]);
    });

    test("clears all", () => {
        const m: M = new ArrayStrongMap([[1, [1, 2]]]);

        expect(m.size).toBe(1);

        m.clear();

        expect(m.size).toBe(0);
    });

    test("clears by key", () => {
        const m: M = new ArrayStrongMap([[1, [1, 2]]]);

        expect(m.get(1)).toEqual([1, 2]);

        m.clear(1);

        expect(m.get(1)).toEqual([]);
    });
});
