// Resolves workspace packages to their `dev-source` export (TypeScript sources),
// replacing vitest `ssr.resolve.conditions: ["dev-source"]` without applying the
// condition to third-party packages (bun's `--conditions` is global).
import { plugin } from "bun";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir);
const exportsByName = new Map<
	string,
	{ dir: string; exports: Record<string, unknown> }
>();
for (const base of ["packages"]) {
	for (const d of readdirSync(join(root, base), { withFileTypes: true })) {
		const pj = join(root, base, d.name, "package.json");
		if (!d.isDirectory() || !existsSync(pj)) continue;
		const j = JSON.parse(readFileSync(pj, "utf8"));
		if (j.name && j.exports)
			exportsByName.set(j.name, {
				dir: join(root, base, d.name),
				exports: j.exports,
			});
	}
}

plugin({
	name: "workspace-dev-source",
	setup(build) {
		build.onResolve(
			{ filter: /^(better-auth|@better-auth\/[^/]+)(\/.*)?$/ },
			(args) => {
				const m = args.path.match(
					/^(better-auth|@better-auth\/[^/]+)(\/.*)?$/,
				)!;
				const pkg = exportsByName.get(m[1]!);
				if (!pkg) return;
				const sub = m[2] ? `.${m[2]}` : ".";
				let entry = pkg.exports[sub] as
					Record<string, unknown> | string | undefined;
				let star = "";
				if (!entry) {
					for (const [key, value] of Object.entries(pkg.exports)) {
						const i = key.indexOf("*");
						if (
							i < 0 ||
							!sub.startsWith(key.slice(0, i)) ||
							!sub.endsWith(key.slice(i + 1))
						)
							continue;
						entry = value as Record<string, unknown>;
						star = sub.slice(i, sub.length - (key.length - i - 1));
						break;
					}
				}
				const src =
					typeof entry === "object" ? entry?.["dev-source"] : undefined;
				if (typeof src !== "string") return;
				return { path: join(pkg.dir, star ? src.replace("*", star) : src) };
			},
		);
	},
});
