var debug = require('debug');

/**
 * Expose logging targets
 *
 * @module logger
 */
module.exports = {
  /** `app:log` Target for base logging */
  log: debug('app:log'),
  /** `app:error` Target for logging errors */
  error: debug('app:error'),
  /** `app:preproc` Target for logging preprocessing */
  preproc: debug('app:preproc'),
  /** `crxde:update` Target for logging updates of file on CQ (CRXDE) */
  update: debug('crxde:update'),
  /** `crxde:create` Target for logging uploads of file to CQ (CRXDE) */
  create: debug('crxde:create'),
  /** `crxde:remove` Target for logging removal of file from CQ (CRXDE) */
  remove: debug('crxde:remove')
};
