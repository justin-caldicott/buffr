/* eslint-disable class-methods-use-this */

// TODO: text-encoding is deprecated, though I see no obvious alternative, maybe fast-text-encoding, utf8?
const textEncoding = require('text-encoding');

const { TextEncoder, TextDecoder } = textEncoding;

const encoder = new TextEncoder('utf-8');
const decoder = new TextDecoder('utf-8');

class JsonSerializer {
  /**
   * Serialize an object into a byte array
   * @param {*} document
   */
  serialize(document) {
    return encoder.encode(JSON.stringify(document));
  }

  /**
   * Deserialize a byte array into an object
   * @param {Uint8Array} data
   */
  deserialize(data) {
    return JSON.parse(decoder.decode(data));
  }
}

module.exports = JsonSerializer;
