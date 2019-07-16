/* eslint-disable prefer-destructuring */
/* eslint-disable no-bitwise */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

const defaultInitialIndexCapacity = 4096;

const nextMultipleOfFour = value => ((value + 3) & ~3);

class MemoryStorage {
  constructor(config) {
    config = config || {};
    config.initialIndexCapacity = nextMultipleOfFour(config.initialIndexCapacity || defaultInitialIndexCapacity);
    const headerSize = 4 * 4;
    this.buffer = new ArrayBuffer(headerSize + (4 * config.initialIndexCapacity) + 65536); // TODO: Start small and grow as needed
    this.bytes = new Uint8Array(this.buffer);
    const header = new Uint32Array(this.buffer, 0, 4);
    header[0] = 0;                                              // Size
    header[1] = config.initialIndexCapacity;                    // Capacity
    header[2] = headerSize;                                     // Index offset
    header[3] = headerSize + (4 * config.initialIndexCapacity); // Next data offset
    this.header = header;
    this.index = new Uint32Array(this.buffer, headerSize, config.initialIndexCapacity);
  }

  /**
   * Add data
   * @param {Uint8Array} data
   * @returns {number} index
   */
  add(data, capacity = null) {
    const { header } = this;

    const index = header[0];
    if (index >= header[1]) { // < capacity
      header[1] *= 2; // Capacity *= 2
      header[2] = header[3]; // Index offset = Next data offset
      header[3] += (4 * header[1]); // Next data offset += (4 * Capacity)
      const newIndex = new Uint32Array(this.buffer, header[2], header[1]);
      newIndex.set(this.index, 0);
      this.index = newIndex;
    }
    this._updateAtNewOffset(index, data, capacity);
    header[0] = index + 1; // Size = index + 1
    return index;
  }

  clear(index) {
    const offset = this.index[index];
    const itemHeader = new Uint32Array(this.buffer, offset, 2);
    itemHeader[0] = 0;
  }

  /**
   * Update data at an index
   * @param {*} index 
   * @param {*} data 
   * @param {*} capacity Capacity to use, if a new block is allocated
   */
  update(index, data, capacity = null) {
    const offset = this.index[index];
    const itemHeader = new Uint32Array(this.buffer, offset, 2);
    if (data.length <= itemHeader[1]) { // <= capacity
      itemHeader[0] = data.length;
      this.bytes.set(data, offset + 8);
    } else {
      this._updateAtNewOffset(index, data, capacity);
    }
  }

  _updateAtNewOffset(index, data, capacity) {
    const offset = this.header[3];
    this.index[index] = offset; // TODO: Offsets as multiples of 16, to allow 32/64GB with 32-bits
    const itemHeader = new Uint32Array(this.buffer, offset, 2);
    itemHeader[0] = data.length;
    capacity = nextMultipleOfFour(capacity || data.length);
    itemHeader[1] = capacity;
    this.bytes.set(data, offset + 8);
    this.header[3] = this.header[3] + 8 + capacity;
  }

  /**
   * Get data at index
   * @param {number} index
   * @returns {Uint8Array}
   */
  get(index) {
    const offset = this.index[index];
    const itemHeader = new Uint32Array(this.buffer, offset, 2);
    return new Uint8Array(this.buffer, offset + 8, itemHeader[0]);
  }

  getRaw(index) {
    const offset = this.index[index];
    const itemHeader = new Uint32Array(this.buffer, offset, 2);
    return {
      buffer: this.buffer,
      offset: offset + 8,
      length: itemHeader[0],
      capacity: itemHeader[1],
    };
  }

  get length() {
    return this.header[0];
  }
}

module.exports = MemoryStorage;
