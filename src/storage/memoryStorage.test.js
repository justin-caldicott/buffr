/* eslint-disable no-shadow */
/* eslint-disable arrow-parens */
const { test } = require('zora');
const textEncoding = require('text-encoding');
const MemoryStorage = require('./memoryStorage');

const { TextEncoder, TextDecoder } = textEncoding;

const encoder = new TextEncoder('utf-8');
const decoder = new TextDecoder('utf-8');

const payload = 'foo bar';
const payload2 = 'foo bar baz';

test('memoryStorage', t => {
  t.test('when some data is stored', t => {
    const storage = new MemoryStorage();
    t.equal(storage.add(encoder.encode(payload)), 0, 'adds to correct index');
    t.equal(decoder.decode(storage.get(0)), payload, 'we get the same data back');
  });
  t.test('when a second item is stored', t => {
    const storage = new MemoryStorage();
    t.equal(storage.add(encoder.encode(payload)), 0, 'adds to correct index');
    t.equal(storage.add(encoder.encode(payload2)), 1, 'adds to correct index');
    t.equal(decoder.decode(storage.get(1)), payload2, 'we get the same data back');
  });
});
