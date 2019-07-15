/* eslint-disable no-shadow */
/* eslint-disable arrow-parens */
const { test } = require('zora');
const MemoryStorage = require('./memoryStorage');

const payload = new Uint8Array([1, 2, 3, 4, 5, 255]);
const payload2 = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 255]);

test('memoryStorage', t => {
  t.test('when some data is stored', t => {
    const storage = new MemoryStorage();
    t.equal(storage.add(payload), 0, 'adds to correct index');
    t.equal(storage.get(0), payload, 'we get the same data back');
  });
  t.test('when a second item is stored', t => {
    const storage = new MemoryStorage();
    t.equal(storage.add(payload), 0, 'adds to correct index');
    t.equal(storage.add(payload2), 1, 'adds to correct index');
    t.equal(storage.get(1), payload2, 'we get the same data back');
  });
});
