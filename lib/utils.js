var slice = exports.slice = [].slice;

/**
 * Expose util functions
 *
 * @module utils
 * @ignore
 */
module.exports = {
  /**
   * Merge objects
   *
   * @param {Object} obj
   * @param {...Object} source
   * @returns {Object}
   *
   * @ignore
   */
  merge: function merge(obj, source) {
    var sources = slice.call(arguments, 1);

    if (obj === undefined) { return obj; }

    sources.forEach(function (source) {
      for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
          obj[prop] = source[prop];
        }
      }
    });

    return obj;
  },

  /**
   * Merge objects considering nesting
   *
   * @param {Object} obj
   * @param {...Object} source
   * @returns {Object}
   *
   * @ignore
   */
  deepMerge: function deepMerge(obj, source) {
    var sources = slice.call(arguments, 1);

    if (obj === undefined) { return obj; }

    sources.forEach(function (source) {
      var prop, val;

      for (prop in source) {
        if (source.hasOwnProperty(prop)) {
            val = source[prop];

            if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'object' && typeof val === 'object') {
              deepMerge(obj[prop], val);
            } else {
              obj[prop] = val;
            }
        }
      }
    });

    return obj;
  }
};
