'use strict';

var fs = require('fs');
var http = require('http');
var watchr = require('watchr');
var FormData = require('form-data');
var utils = require('./utils');
var logger = require('./logger');
var preproc = require('./preprocCss');

var serverCallback = function(res){
  res.on('data', function(chunk){
    logger.log('res: %s', chunk);
  });
};

var serverErrback = function(req){
  req.on('error', function(err) {
    logger.error(err);
  });
};

/**
 *
 * @param {Object.<string,*>} options
 * @constructor
 */
function CRXDE(options) {
  this.options = utils.merge(this.defaults, options);
}

/**
 *
 * @type {{match: RegExp, ignore: RegExp}}
 */
CRXDE.prototype.defaults = {
  server: {
    hostname: 'localhost',
    port: 4502,
  },
  auth: 'admin:admin',
  match: /jcr_root(.*)$/,
  preprocessor: false,
  preprocEvents: ['create', 'update'],
  ignore: /\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb__bak___|Thumbs.db$|ehthumbs.db$|Desktop.ini$|\$RECYCLE.BIN/
};

/**
 *
 * @param {Array.<string>} paths
 * @param {Object} options
 */
CRXDE.prototype.pipe = function(paths, options) {
  logger.log('piping %s | options: %j', paths, options);
  var crxde = this;
  var cqPathMatch;

  options = options || {};
  cqPathMatch = options.match || crxde.options.match;

  watchr.watch({
    paths: paths,
    interval: options.interval || 500,
    ignoreCustomPatterns: options.ignore || this.options.ignore,
    listeners: {
      'change': function(event, path, stat, prevStat) {
        var cqPath = (path.match(cqPathMatch)[1] || '').replace(/\\/g, '/');

        if (crxde.options.preprocessor) {
          crxde.preproc(path, event);
        }

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
};

CRXDE.prototype.preproc = function(path, event) {
  var unixPath = path.replace(/\\/g, '/');

  if(this.options.preprocEvents.indexOf(event) === -1) {
    return;
  }

  if (preproc.isFileCanBePreproc(unixPath)) {
    preproc.preproc(unixPath);
  }
}

/**
 *
 * @param {string} path
 * @param {string} type
 */
CRXDE.prototype.add = function(path, type) {
  var req, form, options;

  form = new FormData();
  form.append('jcr:primaryType', type);

  options = utils.merge({}, this.options.server, {
    method: 'POST',
    path: path,
    headers: form.getHeaders(),
    auth: this.options.auth
  });
  req = http.request(options, serverCallback);
  form.pipe(req);
  serverErrback(req);
};

/**
 *
 * @param {string} path
 * @param {string} resource
 */
CRXDE.prototype.update = function(path, resource) {
  var req, options;

  options = utils.merge({}, this.options.server, {
    method: 'PUT',
    path: path,
    auth: this.options.auth
  });

  req = http.request(options, serverCallback);
  fs.createReadStream(resource).pipe(req);
  serverErrback(req);
};

/**
 *
 * @param {string} path
 */
CRXDE.prototype.remove = function(path) {
  var req, options;

  options = utils.merge({}, this.options.server, {
    method: 'DELETE',
    path: path,
    auth: this.options.auth
  });

  req = http.request(options, serverCallback);
  req.end();
  serverErrback(req);
};

/**
 *
 * @param {Array.<string>} paths
 * @param {Object} options
 */
exports.pipe = function(paths, options) {
  return new CRXDE(options).pipe(paths, options);
};
