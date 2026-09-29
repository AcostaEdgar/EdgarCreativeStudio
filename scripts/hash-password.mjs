// Prints a bcrypt hash for ADMIN_PASSWORD_HASH. Asks twice; typing is hidden.
import { hash } from "bcryptjs";
import readline from "node:readline";

const tty = Boolean(process.stdin.isTTY);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: tty });
rl._writeToOutput = () => {};
const lines = [];
const waiting = [];
rl.on("line", line => { const next = waiting.shift(); if (next) next(line); else lines.push(line); });
rl.on("close", () => waiting.splice(0).forEach(resolve => resolve("")));
const ask = question => {
  process.stdout.write(question);
  return new Promise(resolve => {
    const done = answer => { process.stdout.write("\n"); resolve(answer); };
    if (lines.length) done(lines.shift()); else waiting.push(done);
  });
};

const first = await ask("Admin password (typing is hidden): ");
const second = await ask("Type it again: ");
rl.close();
if (!first) { console.error("No password entered."); process.exit(1); }
if (first !== second) { console.error("The two entries did not match. Run it again."); process.exit(1); }
console.log("\nCopy this whole line into Vercel as ADMIN_PASSWORD_HASH:\n");
console.log(await hash(first, 12));
