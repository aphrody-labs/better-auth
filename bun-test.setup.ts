// Replaces vitest `clearMocks` + `restoreMocks` (used by most workspace packages).
import { afterEach, beforeEach, vi } from "bun:test";

beforeEach(() => {
	vi.clearAllMocks();
});
afterEach(() => {
	vi.restoreAllMocks();
});
