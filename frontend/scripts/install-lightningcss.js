#!/usr/bin/env node

/**
 * This script exists so the `postinstall` hook in package.json has a real target.
 * It simply verifies that lightningcss can be resolved and surfaces a helpful
 * warning when it cannot, but it never fails the install process outright.
 */

const fs = require("node:fs");
const path = require("node:path");

const logPrefix = "[install-lightningcss]";

const log = (message) => {
  console.log(`${logPrefix} ${message}`);
};

const packageJsonPath = path.join(__dirname, "..", "package.json");

let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
} catch (error) {
  log(`Unable to read package.json (${error.message}). Skipping.`);
  process.exit(0);
}

const lightningcssVersion =
  packageJson.dependencies?.lightningcss ??
  packageJson.devDependencies?.lightningcss;

if (!lightningcssVersion) {
  log("lightningcss is not listed as a dependency. Nothing to do.");
  process.exit(0);
}

try {
  require.resolve("lightningcss");
  log("lightningcss detected. No extra action required.");
} catch (error) {
  log(
    "lightningcss could not be resolved. Re-run your package manager install command if you need it."
  );
  log(`Original error: ${error.message}`);
}
