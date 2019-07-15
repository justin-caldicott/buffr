/* eslint-disable arrow-parens */
const { test } = require('zora');
const JsonSerializer = require('./serializers/jsonSerializer');
const MemoryStorage = require('./storage/memoryStorage');
const Store = require('../src/buffr');
const SequentialIndex = require('./indexes/sequentialIndex');
const PropertyValueProvider = require('./valueProviders/propertyValueProvider');

const someCollection = 'someCollection';

test('buffr', t => {
  const store = new Store({
    serializer: new JsonSerializer(),
    storage: new MemoryStorage(),
    indexTypeModules: [SequentialIndex],
    valueProviderModules: [PropertyValueProvider],
  });
  store.putIndex(someCollection, 'id', 'SequentialIndex', {}, 'PropertyValueProvider', 'id');

  const doc = { id: 0, foo: 'bar' };
  store.put(someCollection, doc);
  t.equal(store.get(someCollection, 'id', doc.id), doc, 'gets a put document ok');

  const doc2 = { id: 1, foo: 'baz' };
  store.put(someCollection, doc2);
  t.equal(store.get(someCollection, 'id', doc2.id), doc2, 'gets a second put document ok');
});
