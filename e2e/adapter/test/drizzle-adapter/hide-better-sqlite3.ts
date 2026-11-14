// Preload for the drizzle-kit child process: Bun cannot load better-sqlite3, so hide it and let
// drizzle-kit fall back to its `bun:sqlite` driver.
import { plugin } from "bun";

plugin({
	name: "hide-better-sqlite3",
	setup(build) {
		build.onResolve({ filter: /^better-sqlite3$/ }, () => {
			throw new Error("better-sqlite3 is not supported in Bun");
		});
	},
});
