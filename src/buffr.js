/* eslint-disable */

const WriteBatch = require('./writeBatch');
const StorageLease = require('./storage/storageLease');

class Buffr {
  // Initially assumes documents are javascript objects
  // TODO: Implement batched writes
  constructor(config) {
    // TODO: Validate config required properties
    this._serializer = config.serializer;
    this._storage = config.storage;
    this._indexTypeModules = config.indexTypeModules.reduce(((acc, m) => (acc[m.name] = m, acc)), {});
    this._valueProviderModules = config.valueProviderModules.reduce(((acc, m) => (acc[m.name] = m, acc)), {});

    // TODO: Allow things to be async to support disk storage

    if (this._storage.length == 0) {
      this._rootDocument = {
        collections: {}
      };
      const data = this._serializer.serialize(this._rootDocument);
      this._storage.add(data);
      this._collections = {};
      this._valueProviders = {};
    } else {
      this._rootDocument = this._serializer.deserialize(this._storage.get(0));
      // TODO: By name, code currently not covered..
      this._collections = this._rootDocument.collections.map(c => { indexes: c.indexes.map(i => new this._indexTypeModules[i.type](
        new StorageLease(this._storage, i.storageIndex),
        new this._valueProviderModules[i.valueProviderType](i.valueProviderConfig),
        i.config
      ))});
      // this._valueProviders = {}; TODO
    }
    //config.storageModule e.g. can be in memory, on disk, on disk with transaction support, with snappy, etc
    //transactions could be supported by storage module offering functions, e.g. commit()
    // Buffer passed in to memory buffer persistance module
  }

  /**
   * Creates or updates an index on a collection
   * @param {string} collectionName The name of the collection on which to put the index
   * @param {string} indexName The name of the index to create
   * @param {string} indexType The type of index to create.  A corresponding module must have been provided.
   * @param {object} indexConfig Config for the index, specific to the index type used
   */
  putIndex(collectionName, indexName, indexType, indexConfig, valueProviderType, valueProviderConfig) {
    const collectionConfig = this._rootDocument.collections[collectionName] = this._rootDocument.collections[collectionName] || { indexes: {} };

    if (collectionConfig.indexes[indexName]) {
      // TODO: How to handle if already exists, and config changed?
      throw new Error('not implemented');
    }
    const storageIndex = this._storage.add(new Uint8Array(0), 4096); // TODO: Default size
    collectionConfig.indexes[indexName] = {
      storageIndex,
      indexType,
      indexConfig,
      valueProviderType,
      valueProviderConfig,
    };
    const index = new this._indexTypeModules[indexType](new StorageLease(this._storage, storageIndex), indexConfig);
    this._collections[collectionName] = this._collections[collectionName] || { indexes: {} };
    this._collections[collectionName].indexes[indexName] = index;
    this._valueProviders[indexName] = new this._valueProviderModules[valueProviderType](valueProviderConfig);
  }

  /**
   * Deletes an index, if it exists
   * @param {*} indexName 
   */
  deleteIndex(collectionName, indexName) {
    // TODO: Throw if only index and not empty
    // TODO: If only index and empty, all traces of the collection should be gone
  }

  /**
   * Creates or updates a document in the collection
   * @param {*} document 
   */
  put(collectionName, document) {
    const data = this._serializer.serialize(document);
    const storageIndex = this._storage.add(data);

    // TODO: Index removes
    for (const [name, index] of Object.entries(this._collections[collectionName].indexes)) {
      const values = this._valueProviders[name].getValues(document);
      index.add(values.map(v => [v, storageIndex]));
    }
  }

  /**
   * Delete documents from the collection
   * @param {string} indexName The name of the index in which to find the document
   * @param {*} value The value in the index that identifies the documents to delete
   */
  delete(collectionName, indexName, value) {
    throw new Error('not implemented');
  }

  /**
   * Get documents from the collection
   * @param {string} indexName The name of the index in which to find the document
   * @param {*} value The value in the index that identifies the documents to get
   */
  get(collectionName, indexName, value) {
    // TODO: Support multiple returned documents
    const [storageIndex] = this._collections[collectionName].indexes[indexName].getIndexes(value);
    const data = this._storage.get(storageIndex);
    return this._serializer.deserialize(data);
  }

  newWriteBatch() {
    return new WriteBatch();
  }

  applyWriteBatch(writeBatch) {
    throw new Error('not implemented');
  }
}

module.exports = Buffr;
