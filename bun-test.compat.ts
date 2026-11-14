// bun:test has no `onTestFailed`; failure-only diagnostics hooks are no-ops here.
// Use `onTestFinished` when cleanup is required regardless of the outcome.
export function onTestFailed(_fn: () => void | Promise<void>): void {}
