const textEncoding = require('text-encoding');
const MemoryStorage = require('./memoryStorage');

const { TextEncoder, TextDecoder } = textEncoding;

const encoder = new TextEncoder('utf-8');
const decoder = new TextDecoder('utf-8');

const payload = 'foo bar';
const payload2 = 'foo bar baz';

describe('given memoryStorage', () => {
  test('when some data is stored, then we get the same data back', () => {
    const storage = new MemoryStorage();
    expect(storage.add(encoder.encode(payload))).toEqual(0);
    expect(decoder.decode(storage.get(0))).toEqual(payload);
  });
  test('when a second item is stored, then we get the same data back', () => {
    const storage = new MemoryStorage();
    expect(storage.add(encoder.encode(payload))).toEqual(0);
    expect(storage.add(encoder.encode(payload2))).toEqual(1);
    expect(decoder.decode(storage.get(1))).toEqual(payload2);
  });
});
