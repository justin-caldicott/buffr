/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */

class WriteBatch {
  constructor() {
    this.operations = [];
  }

  /**
   * Registers a document create or update operation for a collection
   * @param {*} document The document to create or update
   */
  put(collectionName, document) {
    // TODO: Get index values and serialize to avoid being impacted by subsequent document mutation
    this.operations.push({ collectionName, document });
  }

  /**
   * Registers a document delete operation for a collection
   * @param {string} indexName The name of the index in which to find the document
   * @param {*} value The value in the index that identifies the documents to delete
   */
  delete(collectionName, indexName, value) {
    this.operations.push({ collectionName, indexName, value });
  }
}

module.exports = WriteBatch;
