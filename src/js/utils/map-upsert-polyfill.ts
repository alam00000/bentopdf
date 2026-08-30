type MapPrototypeWithUpsert = typeof Map.prototype & {
  getOrInsert?: (key: unknown, value: unknown) => unknown;
  getOrInsertComputed?: (
    key: unknown,
    callback: (key: unknown) => unknown
  ) => unknown;
};

const mapPrototype = Map.prototype as MapPrototypeWithUpsert;
const mapHas = Map.prototype.has;
const mapGet = Map.prototype.get;
const mapSet = Map.prototype.set;

if (typeof mapPrototype.getOrInsert !== 'function') {
  Object.defineProperty(mapPrototype, 'getOrInsert', {
    configurable: true,
    writable: true,
    value: function getOrInsert(key: unknown, value: unknown) {
      if (mapHas.call(this, key)) return mapGet.call(this, key);
      mapSet.call(this, key, value);
      return value;
    },
  });
}

if (typeof mapPrototype.getOrInsertComputed !== 'function') {
  Object.defineProperty(mapPrototype, 'getOrInsertComputed', {
    configurable: true,
    writable: true,
    value: function getOrInsertComputed(
      key: unknown,
      callback: (key: unknown) => unknown
    ) {
      const hasKey = mapHas.call(this, key);
      if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function');
      }
      if (hasKey) return mapGet.call(this, key);

      const value = callback(key);
      mapSet.call(this, key, value);
      return value;
    },
  });
}

export {};
