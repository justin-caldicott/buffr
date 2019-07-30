/* eslint-disable max-len */
/* eslint-disable no-shadow */
/* eslint-disable arrow-parens */

const { test } = require('zora');
const MemoryStorage = require('./memoryStorage');

const payload = new Uint8Array([1, 2, 3, 4, 5, 255]);
const payload2 = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
const payload3 = new Uint8Array([5, 6, 7]);

const isBasedOn = (capacity, length) => capacity >= length && capacity < (length + 8);

test('memoryStorage', t => {
  t.test('when some data is added', t => {
    const storage = new MemoryStorage();
    t.equal(storage.add(payload), 0, 'returns the correct index');
    t.equal(storage.get(0), payload, 'get returns the same data');
    const data = storage.getRaw(0);
    const bytes = new Uint8Array(data.buffer, data.offset, data.length);
    t.equal(bytes, payload, 'getRaw returns the same data');
    t.ok(isBasedOn(data.capacity, payload.length), 'getRaw returns capacity ~= length');
  });

  // TODO: Test inputs:
  // * capacity is a number
  // * capacity >= data.length
  // * data is a UInt8Array

  t.test('when some data is added, with capacity set', t => {
    const storage = new MemoryStorage();
    t.equal(storage.add(payload, 128), 0, 'returns the correct index');
    t.equal(storage.get(0), payload, 'get returns the same data');
    t.equal(storage.getRaw(0).capacity, 128, 'getRaw returns the set capacity');
  });

  t.test('when a second item is added', t => {
    const storage = new MemoryStorage();
    storage.add(payload);
    t.equal(storage.add(payload2), 1, 'returns the correct index');
    t.equal(storage.get(1), payload2, 'get returns the same data');
  });

  t.test('when data is cleared', t => {
    const storage = new MemoryStorage();
    storage.add(payload);
    const before = storage.getRaw(0);
    storage.clear(0);
    const data = storage.getRaw(0);
    t.equal(data.length, 0, 'getRaw returns zero length');
    t.equal(data.capacity, before.capacity, 'getRaw returns the same capacity');
  });

  t.test('when data is updated to be smaller', t => {
    const storage = new MemoryStorage();
    storage.add(payload);
    const before = storage.getRaw(0);
    storage.update(0, payload3);
    t.equal(storage.get(0), payload3, 'get returns the updated data');
    const data = storage.getRaw(0);
    t.equal(data.length, payload3.length, 'getRaw returns the updated length');
    t.equal(data.capacity, before.capacity, 'getRaw returns the same capacity');
  });

  t.test('when data is updated to be larger', t => {
    const storage = new MemoryStorage();
    storage.add(payload);
    storage.update(0, payload2);
    t.equal(storage.get(0), payload2, 'get returns the updated data');
    const data = storage.getRaw(0);
    t.equal(data.length, payload2.length, 'getRaw returns the updated length');
    t.ok(isBasedOn(data.capacity, payload2.length), 'getRaw returns capacity ~= updated length');
  });

  t.test('when data is updated to be larger, with capacity set', t => {
    const storage = new MemoryStorage();
    storage.add(payload);
    storage.update(0, payload2, 128);
    t.equal(storage.get(0), payload2, 'get returns the updated data');
    const data = storage.getRaw(0);
    t.equal(data.length, payload2.length, 'getRaw returns the updated length');
    t.ok(isBasedOn(data.capacity, 128), 'getRaw returns the set capacity');
  });

  t.test('when initial index capacity is exceeded', t => {
    const storage = new MemoryStorage({ initialIndexCapacity: 4 });
    storage.add(payload);
    storage.add(payload2);
    storage.add(payload);
    storage.add(payload);
    t.equal(storage.add(payload), 4, 'returns the correct index');
    t.equal(storage.get(4), payload, 'get returns the same data');
    t.equal(storage.get(1), payload2, 'get of earlier items return the same data');
  });

  t.test('when buffer length is exceeded by adding an item', t => {
    const storage = new MemoryStorage({ initialDataCapacity: 8 });
    storage.add(payload);
    t.equal(storage.add(payload2), 1, 'returns the correct index');
    t.equal(storage.get(1), payload2, 'get returns the same data');
    t.equal(storage.get(0), payload, 'get of earlier items return the same data');
  });

  t.test('when buffer length is exceeded by updating an item', t => {
    const storage = new MemoryStorage({ initialDataCapacity: 16 });
    storage.add(payload);
    storage.add(payload);
    storage.update(1, payload2);
    t.equal(storage.get(1), payload2, 'get returns the updated data');
    t.equal(storage.get(0), payload, 'get of earlier items return the same data');
  });

  t.test('when buffer length is exceeded by the index growing', t => {
    const storage = new MemoryStorage({ initialIndexCapacity: 4, initialDataCapacity: 4 * 16 });
    storage.add(payload);
    storage.add(payload);
    storage.add(payload);
    storage.add(payload);
    storage.add(payload);
    for (let i = 0; i < 5; i++) {
      t.equal(storage.get(i), payload, `get ${i} returns the same data`);
    }
  });

  t.test('when we start small and grow lots', t => {
    const count = 1000;
    const storage = new MemoryStorage({ initialIndexCapacity: 4, initialDataCapacity: 4 * 16 });
    for (let i = 0; i < count; i++) {
      storage.add(payload);
      storage.update(i, payload2);
    }

    const results = [];
    const expected = [];
    for (let i = 0; i < count; i++) {
      results.push(storage.get(i));
      expected.push(payload2);
    }
    t.equal(results, expected, `gets returns the same data`);
  });
});
