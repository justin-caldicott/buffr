/* eslint-disable no-param-reassign */
class MemoryStorage {
  constructor() {
    const initialIndexCapacity = 4096;
    const headerSize = 4 * 4;
    this.buffer = new ArrayBuffer(headerSize + (4 * initialIndexCapacity) + 65536);
    this.bytes = new Uint8Array(this.buffer);
    const header = new Uint32Array(this.buffer, 0, 4);
    header[0] = 0;                                       // Size
    header[1] = initialIndexCapacity;                    // Capacity
    header[2] = headerSize;                              // Index offset
    header[3] = headerSize + (4 * initialIndexCapacity); // Next data offset
    this.header = header;
    this.index = new Uint32Array(this.buffer, headerSize, initialIndexCapacity);
  }

  /**
   * @param {Uint8Array} data
   * @returns {number} index
   */
  add(data, capacity = null) {
    const index = this.header[0];
    const offset = this.header[3];
    this.index[index] = offset; // TODO: Offsets as multiples of 16, to allow 32/64GB with 32-bits
    const itemHeader = new Uint32Array(this.buffer, offset, 2);
    itemHeader[0] = data.length;
    capacity = capacity || data.length + (4 - (data.length % 4)); // Adds an extra 4 bytes if already a multiple of 4, but it's ok
    itemHeader[1] = capacity;
    this.bytes.set(data, offset + 8);
    this.header[0] = this.header[0] + 1;
    this.header[3] = this.header[3] + 8 + capacity;
    return index;
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
