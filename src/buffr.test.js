const JsonSerializer = require('./serializers/jsonSerializer');
const MemoryStorage = require('./storage/memoryStorage');
const Store = require('../src/buffr');
const SequentialIndex = require('./indexes/sequentialIndex');
const PropertyValueProvider = require('./valueProviders/propertyValueProvider');

describe('given', () => {
  describe('when', () => {
    test('then', () => {
      const store = new Store({
        serializer: new JsonSerializer(),
        storage: new MemoryStorage(),
        indexTypeModules: [SequentialIndex],
        valueProviderModules: [PropertyValueProvider],
      });
      store.ensureIndex('id', 'SequentialIndex', {}, 'PropertyValueProvider', 'id');
      const doc = { id: 0, foo: 'bar' };
      store.put(doc);
      expect(store.get('id', doc.id)).toMatchObject(doc);
    });
  });
});
