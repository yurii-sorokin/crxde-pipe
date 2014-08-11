var debug = require('debug');

/**
 * Expose logging targets
 *
 * @module logger
 */
module.exports = {
  /** Target for base logging */
  log: debug('app:log'),
  /** Target for logging errors */
  error: debug('app:error'),
  /** Target for logging updates of file on CQ (CRXDE) */
  update: debug('crxde:update'),
  /** Target for logging uploads of file to CQ (CRXDE) */
  create: debug('crxde:create'),
  /** Target for logging removal of file from CQ (CRXDE) */
  remove: debug('crxde:remove')
};
