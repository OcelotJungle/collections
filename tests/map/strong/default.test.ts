import { StrongMap } from "../../../src";

type M = StrongMap<number, number>;

describe("Strong Map", () => {
    test("being created", () => {
        new StrongMap(() => 0) as M;
    });

    test("being created with initial entries", () => {
        const m: M = new StrongMap(() => 0, [
            [1, 2],
            [3, 4],
        ]);

        expect(m.get(1)).toBe(2);
        expect(m.get(3)).toBe(4);
    });

    test("ensures any key has at least default value", () => {
        const m: M = new StrongMap(() => -1);

        m.set(1, 2);

        expect(m.get(1)).toBe(2);
        expect(m.get(3)).toBe(-1);
    });
});
