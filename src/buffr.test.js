/* eslint-disable arrow-parens */
const { test } = require('zora');
const JsonSerializer = require('./serializers/jsonSerializer');
const MemoryStorage = require('./storage/memoryStorage');
const Buffr = require('../src/buffr');
const SequentialIndex = require('./indexes/sequentialIndex');
const PropertyValueProvider = require('./valueProviders/propertyValueProvider');

const someCollection = 'someCollection';

test('buffr', t => {
  const buffr = new Buffr({
    serializer: new JsonSerializer(),
    storage: new MemoryStorage(),
    indexTypeModules: [SequentialIndex],
    valueProviderModules: [PropertyValueProvider],
  });
  buffr.putIndex(someCollection, 'id', 'SequentialIndex', {}, 'PropertyValueProvider', 'id');

  const doc = { id: 0, foo: 'bar' };
  buffr.put(someCollection, doc);
  t.equal(buffr.get(someCollection, 'id', doc.id), doc, 'gets a put document ok');

  const doc2 = { id: 1, foo: 'baz' };
  buffr.put(someCollection, doc2);
  t.equal(buffr.get(someCollection, 'id', doc2.id), doc2, 'gets a second put document ok');
});
