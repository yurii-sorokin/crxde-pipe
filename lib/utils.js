var call = Function.prototype.call;
var slice = call.bind([].slice);
var toString = call.bind({}.toString);

/**
 * Expose util functions
 *
 * @module utils
 * @ignore
 */
module.exports = {

  /**
   * Merge objects considering nesting
   *
   * @param {Object} obj
   * @param {...Object} source
   * @returns {Object}
   *
   * @ignore
   */
  merge: function deepMerge(obj, source) {
    var sources = slice(arguments, 1);

    if (toString(obj) !== '[object Object]') { return obj; }

    sources.forEach(function (source) {
      var prop, val;

      for (prop in source) {
        if (source.hasOwnProperty(prop)) {
          val = source[prop];

          if (val === undefined) { continue; }

          if (toString(val) === '[object Object]') {
            // merge if both are objects and clone otherwise
            obj[prop] = deepMerge((obj.hasOwnProperty(prop) && obj[prop]) || {}, val);
          } else {
            obj[prop] = val;
          }
        }
      }
    });

    return obj;
  }
};
