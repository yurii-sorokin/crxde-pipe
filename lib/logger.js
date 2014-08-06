var debug = require('debug');

module.exports = {
  log: debug('app:log'),
  error: debug('app:error'),
  update: debug('crxde:update'),
  create: debug('crxde:create'),
  remove: debug('crxde:remove'),
  preproc: debug('crxde:preproc')
};
