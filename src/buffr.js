/* eslint-disable */
const StorageLease = require('./storage/storageLease');

class Store {
  // Initially assumes documents are javascript objects
  constructor(config) {
    // TODO: Validate config required properties
    this._serializer = config.serializer;
    this._storage = config.storage;
    this._indexTypeModules = config.indexTypeModules.reduce(((acc, m) => (acc[m.name] = m, acc)), {});
    this._valueProviderModules = config.valueProviderModules.reduce(((acc, m) => (acc[m.name] = m, acc)), {});

    // TODO: Allow things to be async to support disk storage

    if (this._storage.length == 0) {
      this._rootDocument = {
        indexes: {}
      };
      const data = this._serializer.serialize(this._rootDocument);
      this._storage.add(data);
      this._indexes = {};
      this._valueProviders = {};
    } else {
      this._rootDocument = this._serializer.deserialize(this._storage.get(0));
      this._indexes = this._rootDocument.indexes.map(i => new this._indexTypeModules[i.type](
        new StorageLease(this._storage, i.storageIndex),
        new this._valueProviderModules[i.valueProviderType](i.valueProviderConfig),
        i.config
      ));
      // this._valueProviders = {}; TODO
    }
    //config.storageModule e.g. can be in memory, on disk, on disk with transaction support, with snappy, etc
    //transactions could be supported by storage module offering functions, e.g. commit()
    // Buffer passed in to memory buffer persistance module
  }

  /**
   * Creates an index if it doesn't exist or updates index config if changed 
   * @param {string} name The name of the index to create
   * @param {string} indexType The type of index to create.  A corresponding module must have been provided.
   * @param {object} indexConfig Config for the index, specific to the index type used
   */
  ensureIndex(name, indexType, indexConfig, valueProviderType, valueProviderConfig) {
    if (this._rootDocument.indexes[name]) {
      // TODO: How to handle if already exists, and config changed?
      throw new Error('not implemented');
    }
    const storageIndex = this._storage.add(new Uint8Array(0), 4096); // TODO: Default size
    this._rootDocument.indexes[name] = {
      storageIndex,
      indexType,
      indexConfig,
      valueProviderType,
      valueProviderConfig
    }
    const index = new this._indexTypeModules[indexType](new StorageLease(this._storage, storageIndex), indexConfig);
    this._indexes[name] = index;
    this._valueProviders[name] = new this._valueProviderModules[valueProviderType](valueProviderConfig);
  }

  /**
   * Deletes an index, if it exists
   * @param {*} name 
   */
  deleteIndex(name) {
  }

  /**
   * Puts 
   * @param {*} document 
   */
  put(document) {
    const data = this._serializer.serialize(document);
    const storageIndex = this._storage.add(data);

    // TODO: Gather values into those added and removed, and update as needed
    // TODO: PutBatch, so we can much more efficiently update indexes
    for (const [name, index] of Object.entries(this._indexes)) {
      const values = this._valueProviders[name].getValues(document);
      index.add(values.map(v => [v, storageIndex]));
    }
  }

  get(index, value) {
    // TODO: Call index module to get data index
    const [ storageIndex ] = this._indexes[index].getIndexes(value);
    const data = this._storage.get(storageIndex);
    return this._serializer.deserialize(data);
  }
}

module.exports = Store;
