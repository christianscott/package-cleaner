#!/usr/bin/env node
import fg from 'fast-glob';
import fs from 'fs';
import path from 'path';

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

export function cleanPackages({ pkgs, rm, nodeModulesPath = 'node_modules' }) {
  const alwaysIncludeFiles = [
    'package.json',
    'yarn.lock',
    'readme.md',
    'README.md',
  ];
  for (const pkg of pkgs) {
    const ns = (...f) => path.join(nodeModulesPath, pkg, ...f);
    const pkgJsonPath = ns('package.json');

    const { files } = readJson(pkgJsonPath);
    if (files == null) {
      continue;
    }

    const keep = [...files, ...alwaysIncludeFiles]
      .map((file) => {
        const p = ns(file);
        try {
          if (fs.lstatSync(p).isDirectory()) {
            return path.join(p, '**', '*');
          }
        } catch (e) {
          return undefined;
        }
        return p;
      })
      .filter((f) => f != null)
      .map((f) => '!' + f);

    const filesToClean = fg.sync([ns('**', '*'), ...keep]);
    for (const f of filesToClean) {
      console.log(`removing ${f}`);
      rm(f, { recursive: true });
    }
  }
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

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

function noop() {}
