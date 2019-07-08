/* eslint-disable no-underscore-dangle */

class PropertyValueProvider {
  constructor(propertyName) {
    this._propertyName = propertyName;
  }

  getValues(document) {
    return [document[this._propertyName]];
  }
}

module.exports = PropertyValueProvider;
