import assert from "node:assert/strict";
import fs from "node:fs/promises";
import ts from "typescript";

async function source(path) {
  const { outputText } = ts.transpileModule(await fs.readFile(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return import(
    "data:text/javascript;base64," + Buffer.from(outputText).toString("base64")
  );
}
const {
  mutateLatest,
  versionPath,
  versionUrl,
  parseVersion,
  newestVersion,
  nextVersion,
  staleVersions,
  isCreateConflict,
} = await source("lib/blob-state.ts");
const { moveWork } = await source("lib/portfolio-order.ts");

// Version files sort and parse predictably; unrelated blobs are ignored.
assert.equal(versionPath(42), "studio/collection/0000000042.json");
assert.equal(parseVersion(versionPath(42)), 42);
// Version URLs resolve from the store root, not the public copy's folder.
assert.equal(
  versionUrl("https://abc.public.blob.vercel-storage.com/studio/artist-state-v2.json", 7),
  "https://abc.public.blob.vercel-storage.com/studio/collection/0000000007.json",
);
assert.equal(parseVersion("studio/artist-state-v2.json"), null);
const blobs = [3, 11, 7].map((v) => ({ pathname: versionPath(v), url: "u" + v }));
blobs.push({ pathname: "studio/collection/notes.txt", url: "x" });
assert.equal(newestVersion(blobs).version, 11);
assert.equal(newestVersion([]), null);
// A save based on version N creates N + 1; first-ever save creates 1.
assert.equal(nextVersion("11"), 12);
assert.equal(nextVersion("new"), 1);
assert.equal(nextVersion(undefined), 1);
// Pruning keeps the newest versions and never touches other files.
assert.deepEqual(staleVersions(blobs, 2), ["u3"]);
assert.deepEqual(staleVersions(blobs, 25), []);
// Only a create collision counts as "someone else saved first".
assert.ok(isCreateConflict(new Error("This blob already exists, use allowOverwrite")));
assert.ok(!isCreateConflict(new Error("storage unavailable")));
const defaults = () => ({ portfolio: [{ id: 1 }, { id: 2 }], revision: "new" });

// Two independent requests read the same version. The loser reapplies its
// deletion to the newly saved order, instead of overwriting the other save.
let stored = { portfolio: [{ id: 1 }, { id: 2 }, { id: 3 }], revision: "v1" };
let sequence = 1;
let reads = 0;
let release;
const bothRead = new Promise((resolve) => {
  release = resolve;
});
class Conflict extends Error {}
const read = async () => {
  const copy = structuredClone(stored);
  reads++;
  if (reads === 2) release();
  if (reads <= 2) await bothRead;
  return copy;
};
const write = async (state) => {
  if (state.revision !== stored.revision) throw new Conflict();
  stored = { ...structuredClone(state), revision: "v" + ++sequence };
  return structuredClone(stored);
};
await Promise.all([
  mutateLatest(
    read,
    write,
    (s) => {
      s.portfolio = moveWork(s.portfolio, { id: 3, beforeId: 1, position: 0 });
    },
    (e) => e instanceof Conflict,
  ),
  mutateLatest(
    read,
    write,
    (s) => {
      s.portfolio = s.portfolio.filter((w) => w.id !== 2);
    },
    (e) => e instanceof Conflict,
  ),
]);
assert.deepEqual(
  stored.portfolio.map((w) => w.id),
  [3, 1],
);
assert.equal(reads, 3, "No extra read after successful writes");
const changed = [{ id: 1 }, { id: 3 }, { id: 4 }];
assert.deepEqual(
  moveWork(changed, { id: 3, beforeId: 2, position: 0 }).map((w) => w.id),
  [3, 1, 4],
);
assert.deepEqual(
  moveWork(changed, { id: 1, beforeId: null, position: 3 }).map((w) => w.id),
  [3, 4, 1],
);
await assert.rejects(
  mutateLatest(
    async () => defaults(),
    async () => {
      throw Error("storage unavailable");
    },
    () => {},
    () => false,
  ),
  /storage unavailable/,
);
console.log(
  "PASS: version naming, version URLs, newest-version selection, pruning, conflict detection, concurrent move/delete rebasing, acknowledged-save response, and storage failure handling.",
);
