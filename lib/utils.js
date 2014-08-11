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
   * @private
   */
  merge: function merge(obj, source) {
    var sources = slice.call(arguments, 1);

    sources.forEach(function (source) {
      for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
          obj[prop] = source[prop];
        }
      }
    });

    return obj;
  }
};
