'use strict';

var fs = require('fs'),
    http = require('http'),
    watchr = require('watchr'),
    FormData = require('form-data'),
    utils = require('./utils'),
    logger = require('./logger'),
    preproc = require('./preprocCss'),
    Config = require('./config');

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
function CRXDE() {
  this.options = {};
}

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
CRXDE.prototype.pipe = function(paths, configPath) {
  logger.log('piping %s | configPath: %j', paths, configPath);

  this.options.paths = paths;

  this.config = new Config(configPath || '', this._runPipe.bind(this));
  return this;
};

CRXDE.prototype._runPipe = function (err) {
  var cqPathMatch = this.config.get('MATCH_ROOT'),
      crxde = this;

  watchr.watch({
    paths: this.options.paths,
    interval: this.config.get('INTERVAL'),
    ignoreCustomPatterns: this.config.get('IGNORE'),
    listeners: {
      'change': function(event, path, stat, prevStat) {
        var cqPath = (path.match(cqPathMatch)[1] || '').replace(/\\/g, '/');

        switch (event) {
          case 'create':
            logger.create('+ %s', cqPath);
            if (stat.isDirectory()) {
              crxde.add(cqPath, 'nt:folder');
            } else {
              crxde.config.get('ENABLE_PREPROC') && crxde.preproc(path);
              crxde.add(cqPath, 'nt:file');
              crxde.update(cqPath, path);
            }

            break;
          case 'update':
            logger.update('~ %s', cqPath);

            crxde.config.get('ENABLE_PREPROC') && crxde.preproc(path);
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
}

/**
 * Runs preprocessing
 * @param {string} path Path to file in file system
 */
CRXDE.prototype.preproc = function(path) {
  if(preproc.isFileCanBePreproc(path)) {
      preproc.preproc(path);
  }
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
  options = utils.merge({}, this.config.getServerOptions(), {
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

  options = utils.merge({}, this.config.getServerOptions(), {
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

  options = utils.merge({}, this.config.getServerOptions(), {
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
  pipe: function(paths, configPath) {
    return new CRXDE().pipe(paths, configPath);
  }
};
