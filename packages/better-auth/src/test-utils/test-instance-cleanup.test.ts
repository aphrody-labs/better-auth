import assert from "node:assert";
import { DatabaseSync } from "node:sqlite";
import type { Kysely } from "kysely";
import { sql } from "kysely";
import { afterAll, expect, it } from "bun:test";

let sqlite: DatabaseSync | undefined;
let postgres: Kysely<unknown> | undefined;

let fileHookAuth:
	| Awaited<ReturnType<typeof import("./test-instance").getTestInstance>>["auth"]
	| undefined;

// bun:test runs afterAll hooks in registration order (vitest ran them in reverse). The file hook
// is registered first so it runs before test-instance's cleanup, which registers when imported;
// the check hook is registered after the import so it runs once the cleanup has finished.
afterAll(async () => {
	if (!fileHookAuth) {
		return;
	}
	const session = await fileHookAuth.api.signInEmail({
		body: { email: "test@test.com", password: "test123456" },
	});
	expect(session.user.email).toBe("test@test.com");
});

const { getTestInstance } = await import("./test-instance");

// Each check needs the handle its test captured, so a run filtered with `-t` skips the other
// backend's check.
afterAll(async () => {
	if (sqlite) {
		expect(sqlite.isOpen).toBe(false);
	}
	if (postgres) {
		await expect(sql`select 1`.execute(postgres)).rejects.toThrow(
			"driver has already been destroyed",
		);
	}
});

it("closes the SQLite database the instance used", async () => {
	const { auth } = await getTestInstance();
	const { database } = auth.options;
	assert.ok(database instanceof DatabaseSync);
	expect(database.isOpen).toBe(true);
	sqlite = database;
	fileHookAuth = auth;
});

it("destroys the Postgres pool the instance used", async () => {
	const { auth } = await getTestInstance(undefined, {
		testWith: "postgres",
	});
	const { database } = auth.options;
	assert.ok(database && "db" in database);
	postgres = database.db;
	await expect(sql`select 1`.execute(postgres)).resolves.toBeDefined();
});
