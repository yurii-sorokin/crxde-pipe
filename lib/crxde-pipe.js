'use strict';

var fs = require('fs');
var http = require('http');
var watchr = require('watchr');
var FormData = require('form-data');
var htmlToText = require('html-to-text');
var utils = require('./utils');
var logger = require('./logger');

/**
 @typedef Server
 @type {Object}
 @property {string} host Hostname of server
 @property {number} port Port of server
 */

/**
 * Provides piping of source code to CQ (CRXDE)
 *
 * @constructor
 * @param {Object} [options] Watching options
 * @param {RegExp} options.match Matches root path of CQ files. Default: `/jcr_root(.*)$/`
 * @param {RegExp} options.ignore Matches files which will be ignored from watching. Default: `/\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb__bak___|___jb_bak___|Thumbs.db$|ehthumbs.db$|Desktop.ini$|\$RECYCLE.BIN|\.content.xml/`
 * @param {number} options.interval Watching interval. Default: `500`
 * @param {Server} options.server Server of CRXDE instance. Default: `{ host: 'localhost': port: 4502 }`
 * @param {Server} options.dispatcher Server of dispatcher instance. Needed for flushing a cache. Default: false
 * @param {string} options.auth Authentication data for CRXDE instance. Default: `admin:admin`
 */
function CRXDE(options) {
  this.options = utils.deepMerge({}, this.defaults, options);

  this._serverOptions = {
    hostname: this.options.server.host,
    port: this.options.server.port,
    auth: this.options.auth
  };

  if (this.options.dispatcher) {
    this._dispatcherOptions = {
      hostname: this.options.dispatcher.host || this.options.server.host,
      port: this.options.dispatcher.port,
      auth: this.options.auth
    };
  }
}

CRXDE.prototype.defaults = {
  match: /jcr_root(.*)$/,
  ignore: /\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb__bak___|___jb_bak___|Thumbs.db$|ehthumbs.db$|Desktop.ini$|\$RECYCLE.BIN|\.content.xml/,
  interval: 500,
  server: {
    host: 'localhost',
    port: 4502
  },
  dispatcher: false,
  auth: 'admin:admin'
};

CRXDE.prototype._serverCallback = function(res){
  res.on('data', function(chunk){
    var text = chunk.toString();

    // html-to-text does not respect tbodies
    text = text.replace(/<\/*tbody>/g, '');
    text = htmlToText.fromString(text, { tables: true });

    if (res.statusCode >= 200 && res.statusCode < 300 || res.statusCode === 304) {
      logger.log('res: %s', text);
    } else {
      logger.error(text);
    }
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
 * @return {CRXDE}
 */
CRXDE.prototype.pipe = function(paths) {
  var crxde = this;
  var cqPathMatch = this.options.match;

  logger.log('piping %s', paths);
  logger.log('options %j', this.options);

  watchr.watch({
    paths: paths,
    interval: this.options.interval,
    ignoreCustomPatterns: this.options.ignore,
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

        if (crxde.options.dispatcher) {
          crxde.flush(cqPath);
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
 * Flushes cache on CQ (CRXDE)
 *
 * @param {string} [path] Path to file (relative to root)
 * @return {CRXDE}
 */
CRXDE.prototype.flush = function(path) {
  var req, options;

  options = utils.merge({}, this._dispatcherOptions, {
    method: 'POST',
    path: '/dispatcher/invalidate.cache',
    headers: {
      'CQ-Action': 'Activate',
      'CQ-Handle': path,
      'CQ-Path': path,
      'Content-Length': 0,
      'Content-Type': 'application/octet-stream'
    }
  });

  req = http.request(options);
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
    return new CRXDE(options).pipe(paths);
  }
};
