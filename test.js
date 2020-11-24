import assert from 'assert';
import baretest from 'baretest';

const test = baretest('package-cleaner');

test('does the thing', () => {
  assert.strict(true);
});

!(async function () {
  await test.run();
})();
