'use strict';

var fs = require('fs');
var url = require('url');
var request = require('request');
var chokidar = require('chokidar');
var htmlToText = require('html-to-text');
var utils = require('./utils');
var logger = require('./logger');

/**
 @typedef Server
 @type {Object}
 @property {string} protocol Server protocol
 @property {string} hostname Hostname portion of server host
 @property {number} port Port number portion of server host

 @link http://nodejs.org/api/url.html
 */

/**
 * Provides piping of source code to CQ (CRXDE)
 *
 * @constructor
 * @param {Object} [options] Watching options
 * @param {RegExp} options.match Matches root path of CQ files. Default: `/jcr_root(.*)$/`
 * @param {RegExp} options.ignore Matches files which will be ignored from watching. Default: `/\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb.*___$|Thumbs\.db$|ehthumbs\.db$|Desktop.ini$|\$RECYCLE.BIN|\.xml|node_modules/`
 * @param {number} options.interval Watching interval. Default: `500`
 * @param {Server} options.server Server of CRXDE instance. Default: `{ protocol: 'http', hostname: 'localhost': port: 4502 }`
 * @param {Object} options.auth Authentication data for CRXDE instance. Default: `{ user: 'admin', pass: 'admin' }`
 */
function CRXDE(options) {
  this.options = utils.merge({}, this.defaults, options);

  this._serverOptions = {
    url: this.options.server,
    auth: this.options.auth
  };
}

CRXDE.prototype.defaults = {
  match: /jcr_root(.*)$/,
  ignore: /\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb.*___$|Thumbs\.db$|ehthumbs\.db$|Desktop.ini$|\$RECYCLE.BIN|\.xml|node_modules/,
  interval: 1000,
  server: {
    protocol: 'http',
    hostname: 'localhost',
    port: 4502
  },
  auth: {
    user: 'admin',
    pass: 'admin'
  }
};

CRXDE.prototype._serverCallback = function(err, res, body){
  if (err) {
    logger.error(err);
    return;
  }

  body = body.toString();

  if (!body) { return; }

  // html-to-text does not respect tbodies
  body = body.replace(/<\/*tbody>/g, '');
  body = htmlToText.fromString(body, { tables: true });

  if (res.statusCode >= 200 && res.statusCode < 300 || res.statusCode === 304) {
    logger.debug('res: %s', body);
  } else {
    logger.error(body);
  }
};

CRXDE.prototype._request = function(method, pathname, options){
  options = utils.merge({}, this._serverOptions, options, {
    method: method,
    url: { pathname: pathname.replace(/\/+$/, '') }
  });

  // manual formatting is required
  // since https://github.com/mikeal/request/pull/1138 isn't published
  options.url = require('url').format(options.url);

  return request(options, this._serverCallback);
};

CRXDE.prototype._blankFileWorkaround = function(path, stat) {
  var ws;

  if (stat.size === 0) {
    ws = fs.createWriteStream(path);
    ws.write('\r\n');
    ws.end();

    return true;
  }

  return false;
};

CRXDE.prototype._pathToJcrUrl = function(path) {
  var jcrUrl;
  var match = path.match(this.options.match);

  if (!match) {
    return;
  }

  // concatenate all matches
  jcrUrl = match.length > 1 ? match.slice(1).join('') : match[0];

  // urlize path
  jcrUrl = jcrUrl.replace(/\\/g, '/');

  return jcrUrl;
};

CRXDE.prototype._onChange = function(event, path, stat) {
  var jcrUrl = this._pathToJcrUrl(path);

  if (!jcrUrl) {
    return;
  }

  switch (event) {
    case 'add':
      logger.create('+ %s', jcrUrl);
      if (!this._blankFileWorkaround(path, stat)) {
        this.upload(jcrUrl, path);
      }
      break;
    case 'addDir':
      logger.create('+ %s', jcrUrl);
      this.add(jcrUrl, 'nt:folder');
      break;
    case 'change':
      if (!this._blankFileWorkaround(path, stat)) {
        logger.update('~ %s', jcrUrl);
        this.upload(jcrUrl, path);
      }
      break;
    case 'unlink':
    case 'unlinkDir':
      logger.remove('- %s', jcrUrl);
      this.remove(jcrUrl);
      break;
  }
};

CRXDE.prototype._onError = function(err) {
  logger.error(err);
};

/**
 * Syncs files from source code to CQ (CRXDE)
 *
 * @param {Array} paths Watching paths
 * @return {CRXDE}
 */
CRXDE.prototype.pipe = function(paths) {
  var crxde = this;

  logger.log('piping %s', paths);
  logger.log('options %j', utils.merge({}, this.options, { auth: { pass: '*****' } }));

  var watcher = chokidar.watch(paths, {
    ignored: this.options.ignore,
    ignoreInitial: true,
    persistent: true,
    usePolling: true,
    interval: this.options.interval
  });

  watcher.on('all', function(event, path, stat) {
    crxde._onChange(event, path, stat);
  });

  watcher.on('error', function(error) {
    crxde._onError(error);
  });

  return this;
};

/**
 * Creates a new node in CQ (CRXDE)
 *
 * @param {string} jcrUrl Path to file (relative to root)
 * @param {string} type Type of file (nt:file, nt:folder, etc.)
 * @return {CRXDE}
 */
CRXDE.prototype.add = function(jcrUrl, type) {
  var req = this._request('POST', jcrUrl);
  var form = req.form();

  form.append('jcr:primaryType', type);

  return this;
};

/**
 * Uploads a file on CQ (CRXDE)
 *
 * @param {string} jcrUrl Path to file (relative to root)
 * @param {string} resource Path to file in file system
 * @return {CRXDE}
 */
CRXDE.prototype.upload = function(jcrUrl, resource) {
  var parentUrl = url.resolve(jcrUrl, '.');
  var req = this._request('POST', parentUrl);
  var form = req.form();

  form.append('*', fs.createReadStream(resource));

  return this;
};

/**
 * Updates a file on CQ (CRXDE)
 *
 * @param {string} jcrUrl Path to file (relative to root)
 * @param {string} resource Path to file in file system
 * @return {CRXDE}
 *
 * @deprecated since 0.1.0, use CRXDE#upload insted.
 */
CRXDE.prototype.update = CRXDE.prototype.upload;

/**
 * Removes a file from CQ (CRXDE)
 *
 * @param {string} jcrUrl Path to file (relative to root)
 * @return {CRXDE}
 */
CRXDE.prototype.remove = function(jcrUrl) {
  var req = this._request('POST', jcrUrl);
  var form = req.form();

  form.append(':operation', 'delete');

  return this;
};

/**
 * Expose a single function to pipe source files to CQ (CRXDE)
 *
 * @module crxde-pipe
 */
module.exports = {
  /**
   * Pipe source files to CQ (CRXDE)
   *
   * @param {Array} paths
   * @param {Object} options
   * @return {CRXDE}
   */
  pipe: function(paths, options) {
    return new CRXDE(options).pipe(paths);
  }
};
