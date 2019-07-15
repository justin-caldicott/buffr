/* eslint-disable class-methods-use-this */

const snappy = require('snappy');

class JsonSerializer {
  /**
   * Serialize an object into a byte array
   * @param {*} document
   */
  serialize(document) {
    return snappy.compressSync(JSON.stringify(document));
  }

  /**
   * Deserialize a byte array into an object
   * @param {Uint8Array} data
   */
  deserialize(data) {
    const buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    return JSON.parse(snappy.uncompressSync(buffer, { asBuffer: false }));
  }
}

module.exports = JsonSerializer;
