/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */

const stride = 2; // TODO: work it out

class SequentialIndex {
  constructor(storageLease, config) {
    this._storageLease = storageLease;
    const block = storageLease.getRaw();
    this._length = block.length;
    this._data = new Uint32Array(block.buffer, block.offset, block.capacity);
    // No need for config yet
  }

  // TODO: Hash type index that leases multiple storage blocks
  // TODO: Traverse or scan behaviour

  // IDEA: Guid references could be stored as documentIndexes, if referencial integrity is being preserved already
  // 260K documents with avg 6 references each would be 12MB.
  add(entries) {
    const data = this._data;
    for (const [value, index] of entries.sort((a, b) => a[0] < b[0])) { // TODO: Check direction of sort optimises copied data
      const insertOffset = this._getOffset(value);
      // TODO: Deal with overflow
      data.copyWithin(insertOffset + 2, insertOffset, this._length * stride);
      data[insertOffset] = value; // TODO: Not just Uint32s...
      data[insertOffset + 1] = index;
      this._length++;
    }
  }

  remove(entries) {
    throw new Error('not implemented');
  }

  getIndexes(value) {
    const data = this._data;
    const endOffset = this._getOffset(value);
    const startOffset = endOffset - 2; // TODO: Support range properly
    return [data[startOffset + 1]];
  }

  _getOffset(searchValue) {
    const data = this._data;
    const length = this._length;
    let imin = 0;
    let imax = length - 1;
    while (imax >= imin) {
      const imid = ((imin + imax) / 2) | 0; // Round down, .NET does this by default
      const value = data[imid * stride];
      if (searchValue > value) {
        imin = imid + 1;
      } else if (searchValue < value) {
        imax = imid - 1;
      } else {
        imin = imid + 1;
        if (imid === (length - 1) || data[imin * stride] !== searchValue) {
          return imin * stride;
        }
      }
    }
    return imin * stride;
  }
}

module.exports = SequentialIndex;
