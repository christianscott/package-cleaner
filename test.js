import assert from 'assert';
import baretest from 'baretest';
import { cleanPackages } from './clean_packages.js';

const test = baretest('package-cleaner');

test('does not remove anything when there are no extra files', () => {
  const { rm } = setup();
  cleanPackages({
    pkgs: ['no_extra_files'],
    nodeModulesPath: 'fixtures',
    rm,
  });
  assert.deepStrictEqual(rm.removedFiles, []);
});

test('does not remove well-known files', () => {
  const { rm } = setup();
  cleanPackages({
    pkgs: ['keep_well_known_files'],
    nodeModulesPath: 'fixtures',
    rm,
  });
  assert.deepStrictEqual(rm.removedFiles, []);
});

test('removes files that are not listed in files or are not well-known', () => {
  const { rm } = setup();
  cleanPackages({
    pkgs: ['remove_extra_files'],
    nodeModulesPath: 'fixtures',
    rm,
  });
  assert.deepStrictEqual(rm.removedFiles, [
    'fixtures/remove_extra_files/src/index.ts',
  ]);
});

test('keeps directories listed in files', () => {
  const { rm } = setup();
  cleanPackages({
    pkgs: ['keep_dir'],
    nodeModulesPath: 'fixtures',
    rm,
  });
  assert.deepStrictEqual(rm.removedFiles, ['fixtures/keep_dir/other.js']);
});

function setup() {
  const rm = (f) => {
    rm.removedFiles.push(f);
  };
  rm.removedFiles = [];
  return { rm };
}

!(async function () {
  await test.run();
})();
