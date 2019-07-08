/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */

class SequentialIndex {
  constructor(storageLease, config) {
    this._storageLease = storageLease;
    const block = storageLease.getRaw();
    this._length = block.length;
    this._data = new Uint32Array(block.buffer, block.offset, block.capacity);
    // No need for config yet
  }

  // TODO: Hash type index that leases multiple storage blocks

  // IDEA: Guid references could be stored as documentIndexes, if referencial integrity is being preserved already
  // 260K documents with avg 6 references each would be 12MB.
  add(entries) {
    for (const [value, index] of entries.sort((a, b) => a.value < b.value)) { // TODO: Check direction of sort optimises copied data
      const insertOffset = this.getOffset(value);
      // TODO: Deal with overflow
      this._data.copyWithin(insertOffset + 2, insertOffset, this._length);
      this._data[insertOffset] = value; // TODO: Not just Uint32s...
      this._data[insertOffset + 1] = index;
    }
  }

  remove(documents) {
  }

  getOffset(searchValue) {
    const stride = 2; // TODO: work it out
    const data = this._data;
    const length = this._length;
    let imin = 0;
    let imax = length - 1;
    while (imax >= imin) {
      const imid = (imin + imax) / 2;
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
