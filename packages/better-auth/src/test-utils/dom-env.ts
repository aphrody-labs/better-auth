// Replaces the vitest per-file `// @vitest-environment happy-dom` directive.
// Import this module first in a test file that needs a DOM.
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll } from "bun:test";

if (!GlobalRegistrator.isRegistered) {
	GlobalRegistrator.register({ url: "http://localhost:3000" });
}

afterAll(async () => {
	if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});
