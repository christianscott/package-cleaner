import fg from 'fast-glob';
import fs from 'fs';
import path from 'path';

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

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}
