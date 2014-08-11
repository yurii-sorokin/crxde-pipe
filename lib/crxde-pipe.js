'use strict';

var fs = require('fs');
var http = require('http');
var watchr = require('watchr');
var FormData = require('form-data');
var utils = require('./utils');
var logger = require('./logger');

/**
 * Provides piping of source code to CQ (CRXDE)
 *
 * @constructor
 * @param {Object} [options] Watching options
 * @param {RegExp} options.match Matches root path of CQ files. Default: `/jcr_root(.*)$/`
 * @param {RegExp} options.ignore Matches files which will be ignored from watching. Default: `/\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb__bak___|Thumbs.db$|ehthumbs.db$|Desktop.ini$|\$RECYCLE.BIN/`
 * @param {number} options.interval Watching interval. Default: `500`
 * @param {string} options.host Hostname of CRXDE instance. Default: `localhost`
 * @param {number} options.port Port of CRXDE instance. Default: `4502`
 * @param {string} options.auth Authentication data for CRXDE instance. Default: `admin:admin`
 */
function CRXDE(options) {
  this.options = utils.merge({}, this.defaults, options);

  this._serverOptions = {
    hostname: this.options.host,
    port: this.options.port,
    auth: this.options.auth
  };
}

CRXDE.prototype.defaults = {
  match: /jcr_root(.*)$/,
  ignore: /\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb__bak___|Thumbs.db$|ehthumbs.db$|Desktop.ini$|\$RECYCLE.BIN/,
  interval: 500,
  host: 'localhost',
  port: 4502,
  auth: 'admin:admin'
};

CRXDE.prototype._serverCallback = function(res){
  res.on('data', function(chunk){
    logger.log('res: %s', chunk);
  });
};

CRXDE.prototype._serverErrback = function(req){
  req.on('error', function(err) {
    logger.error(err);
  });
};

/**
 * Syncs files from source code to CQ (CRXDE)
 *
 * @param {Array} paths Watching paths
 * @param {Object} [options] Watching options
 * @return {CRXDE}
 */
CRXDE.prototype.pipe = function(paths, options) {
  logger.log('piping %s | options: %j', paths, options);
  var crxde = this;
  var cqPathMatch;

  options = options || {};
  cqPathMatch = options.match || crxde.options.match;

  watchr.watch({
    paths: paths,
    interval: options.interval || this.options.interval,
    ignoreCustomPatterns: options.ignore || this.options.ignore,
    listeners: {
      'change': function(event, path, stat, prevStat) {
        var cqPath = (path.match(cqPathMatch)[1] || '').replace(/\\/g, '/');

        switch (event) {
          case 'create':
            logger.create('+ %s', cqPath);
            if (stat.isDirectory()) {
              crxde.add(cqPath, 'nt:folder');
            } else {
              crxde.add(cqPath, 'nt:file');
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
  var req, form, options;

  form = new FormData();
  form.append('jcr:primaryType', type);
  options = utils.merge({}, this._serverOptions, {
    method: 'POST',
    path: path,
    headers: form.getHeaders()
  });
  req = http.request(options, this._serverCallback);
  form.pipe(req);
  this._serverErrback(req);

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
  var req, options;

  options = utils.merge({}, this._serverOptions, {
    method: 'PUT',
    path: path
  });

  req = http.request(options, this._serverCallback);
  fs.createReadStream(resource).pipe(req);
  this._serverErrback(req);

  return this;
};

/**
 * Removes a file from CQ (CRXDE)
 *
 * @param {string} path Path to file (relative to root)
 * @return {CRXDE}
 */
CRXDE.prototype.remove = function(path) {
  var req, options;

  options = utils.merge({}, this._serverOptions, {
    method: 'DELETE',
    path: path
  });

  req = http.request(options, this._serverCallback);
  req.end();
  this._serverErrback(req);

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
    return new CRXDE(options).pipe(paths, options);
  }
};
