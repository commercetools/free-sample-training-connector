import { logger } from "./logger.utils"

describe("logger object", () => {
    it("should not throw an error when logger object", () => {
        expect(typeof logger).toEqual('object');
    });
});