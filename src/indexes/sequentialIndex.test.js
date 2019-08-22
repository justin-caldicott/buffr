/* eslint-disable no-shadow */
/* eslint-disable arrow-parens */
const { test } = require('zora');
const SequentialIndex = require('./sequentialIndex');
const MemoryStorage = require('../storage/memoryStorage');
const StorageLease = require('../storage/storageLease');

const someValue = 6;
const someOtherValue = 7;
const someDataIndex = 8;
const someOtherDataIndex = 9;

test('seqeuntial index', t => {
  t.test('when entries are added', t => {
    const storage = new MemoryStorage();
    const dataIndex = storage.add(new Uint8Array([]), 4096);
    const storageLease = new StorageLease(storage, dataIndex);
    const index = new SequentialIndex(storageLease, {});
    index.add([[someValue, someDataIndex]]);
    index.add([[someValue, someOtherDataIndex]]);
    index.add([[someOtherValue, someDataIndex]]);
    t.equal(index.getIndexes(someValue), [someDataIndex, someOtherDataIndex], 'getIndexes, with multiple entries, returns the correct data indexes');
    t.equal(index.getIndexes(someOtherValue), [someDataIndex], 'getIndexes, with single entry, returns the correct data indexes');

    t.test('and when entries are removed', t => {
      index.remove([someValue, someOtherDataIndex]);
      // TODO: Test remove of many
      t.equal(index.getIndexes(someValue), [someDataIndex], 'getIndexes, with previously multiple entries, returns the correct data indexes');
      t.equal(index.getIndexes(someOtherValue), [someDataIndex], 'getIndexes, with single entry, returns the correct data indexes');
    });
  });

  t.test('when more entries are added than there are space for', t => {
    const storage = new MemoryStorage();
    const dataIndex = storage.add(new Uint8Array([]), 4);
    const storageLease = new StorageLease(storage, dataIndex);
    const index = new SequentialIndex(storageLease, {});
    index.add([[someValue, someDataIndex]]);
    index.add([[someOtherValue, someOtherDataIndex]]);
    t.equal(index.getIndexes(someValue), [someDataIndex], 'getIndexes returns the correct data indexes');
    t.equal(index.getIndexes(someOtherValue), [someOtherDataIndex], 'getIndexes, for a second entry, returns the correct data indexes');
  });
});
