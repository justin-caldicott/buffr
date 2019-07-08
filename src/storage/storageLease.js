/* eslint-disable no-underscore-dangle */

class Lease {
  constructor(storage, index) {
    this._storage = storage; // TODO: Find a way to actually make them unavailable outside
    this._index = index;
  }

  getRaw() {
    return this._storage.getRaw(this._index);
  }

  extend() {
    throw new Error('not implemented');
    // ArrayBuffer.transfer looks like the trick
  }
}

module.exports = Lease;
