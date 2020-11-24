#!/usr/bin/env node
import fs from 'fs';
import { cleanPackages } from './clean_packages.js';

const [node, name, ...args] = process.argv;
const bin = `${node} ${name}`;

cli().then((code = 0) => {
  process.exitCode = code;
});

async function cli() {
  if (args.length === 0) {
    usage();
    return 1;
  }

  if (args.includes('--help') || args.includes('-h')) {
    usage();
    return 0;
  }

  const pkgs = args.filter((arg) => arg !== '--dry-run');
  const dryRun = pkgs.length !== args.length;

  cleanPackages({
    pkgs,
    rm: dryRun ? noop : (f) => fs.rmdirSync(f, { recursive: true }),
  });
}

function usage() {
  console.log(`package-cleaner removes all files except those listed inside the
"files" field inside the packages package.json.

usage:
  ${bin} [PACKAGES ...]

args:
  <PACKAGES>...
    The packages to clean`);
}

function noop() {}
