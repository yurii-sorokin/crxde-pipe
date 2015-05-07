var debug = require('debug');
var pad = function(s) { return ('00'+s).slice(-2); };

debug.formatArgs = function() {
  var args = arguments;
  var name = this.namespace;
  var c = this.color;
  var now = new Date();
  var time = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

  args[0] = ' \u001b[3' + c + 'm(' + time + ') ' + '\u001b[0m\u001b[9' + c + 'm' + name + '\u001b[0m' +
      '\u001b[90m ' + args[0] + '\u001b[0m\u001b[3' + c + 'm' + ' +' + debug.humanize(this.diff) + '\u001b[0m';

  return args;
};

/**
 * Expose logging targets
 *
 * @module logger
 */
module.exports = {
  /** `app:log` Target for base logging */
  log: debug('app:log'),
  /** `app:debug` Target for debugging */
  debug: debug('app:debug'),
  /** `app:error` Target for logging errors */
  error: debug('app:error'),
  /** `crxde:update` Target for logging updates of file on CQ (CRXDE) */
  update: debug('crxde:update'),
  /** `crxde:create` Target for logging uploads of file to CQ (CRXDE) */
  create: debug('crxde:create'),
  /** `crxde:remove` Target for logging removal of file from CQ (CRXDE) */
  remove: debug('crxde:remove')
};
