import { describe, expect, it } from "bun:test";
import { prepareChatStep } from "./step";

describe("prepareChatStep", () => {
	it("requires a tool call before the assistant can answer", () => {
		expect(prepareChatStep({ stepNumber: 0 })).toEqual({
			toolChoice: "required",
		});
	});

	it("lets the assistant answer after using a tool", () => {
		expect(prepareChatStep({ stepNumber: 1 })).toEqual({});
	});
});
