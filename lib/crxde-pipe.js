'use strict';

var fs = require('fs');
var request = require('request');
var watchr = require('watchr');
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
 * @param {RegExp} options.ignore Matches files which will be ignored from watching. Default: `/\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb.*___$|Thumbs.db$|ehthumbs.db$|Desktop.ini$|\$RECYCLE.BIN|\.content.xml/`
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
  ignore: /\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb.*___$|Thumbs.db$|ehthumbs.db$|Desktop.ini$|\$RECYCLE.BIN|\.content.xml/,
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
    logger.log('res: %s', body);
  } else {
    logger.error(body);
  }
};

CRXDE.prototype._request = function(method, pathname, options){
  options = utils.merge({}, this._serverOptions, options, {
    method: method,
    url: { pathname: pathname }
  });

  // manual formatting is required
  // since https://github.com/mikeal/request/pull/1138 isn't published
  options.url = require('url').format(options.url);

  return request(options, this._serverCallback);
};

/**
 * Syncs files from source code to CQ (CRXDE)
 *
 * @param {Array} paths Watching paths
 * @return {CRXDE}
 */
CRXDE.prototype.pipe = function(paths) {
  var crxde = this;
  var cqPathMatch = this.options.match;

  logger.log('piping %s', paths);
  logger.log('options %j', utils.merge({}, this.options, { auth: { pass: '*****' } }));

  watchr.watch({
    paths: paths,
    interval: this.options.interval,
    ignoreCustomPatterns: this.options.ignore,
    listeners: {
      'change': function(event, path, stat/*, prevStat*/) {
        var cqPath;
        var match = path.match(cqPathMatch);

        if (!match) {
          return;
        }

        // concatenate all matches
        cqPath = match.length > 1 ? match.slice(1).join('') : match[0];

        // urlize path
        cqPath = cqPath.replace(/\\/g, '/');

        switch (event) {
          case 'create':
            logger.create('+ %s', cqPath);
            if (stat.isDirectory()) {
              crxde.add(cqPath, 'nt:folder');
            } else {
              crxde.update(cqPath, path);
            }

            break;
          case 'update':
            logger.update('~ %s', cqPath);
            crxde.update(cqPath, path);
            break;
          case 'delete':
            logger.remove('- %s', cqPath);
            crxde.remove(cqPath);
            break;
        }
      },
      'error': function(err) {
        logger.error(err);
      }
    }
  });

  return this;
};

/**
 * Uploads a new file to CQ (CRXDE)
 *
 * @param {string} path Path to file (relative to root)
 * @param {string} type Type of file (nt:file, nt:folder, etc.)
 * @return {CRXDE}
 */
CRXDE.prototype.add = function(path, type) {
  this._request('POST', path, { formData: { 'jcr:primaryType': type } });

  return this;
};

/**
 * Updates a file on CQ (CRXDE)
 *
 * @param {string} path Path to file (relative to root)
 * @param {string} resource Path to file in file system
 * @return {CRXDE}
 */
CRXDE.prototype.update = function(path, resource) {
  var req = this._request('PUT', path);

  fs.createReadStream(resource).pipe(req);

  return this;
};

/**
 * Removes a file from CQ (CRXDE)
 *
 * @param {string} path Path to file (relative to root)
 * @return {CRXDE}
 */
CRXDE.prototype.remove = function(path) {
  this._request('DELETE', path);

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
