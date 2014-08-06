var fs = require('fs');
var sass = require('node-sass');
var stylus = require('stylus');
var stylus = require('less');
var _ = require('underscore');

var options = {
  preproc: {
    scss: sass,
    sass: sass,
    styl: stylus,
    less:
  }
}

function preprocSass(path){
  scss.renderFile({
    file: path,
    outFile: cssOutput,
    success: function () {
      logger.preproc('scss preproc file: ' + subPath);
    },

    error: function (err) {
      logger.error('scss cant preproc: ' + subPath);
    },

  });
}

function cssType(path) {
  var extention =  path.match(/\.([^.]+)$/)[1];

  if (this.options.cssType.indexOf(extention) >= 0) {
    return extention
  } else {
    return;
  }
}

function getFileName(path) {
  return path.match(/\/([^\/]*)\.[^\.]+$/)[1];
}

function getOutputDir(path) {
  var clientlibs = path.match(/^(.*\/clientlibs\/)/)[1];

  return clientlibs + 'css/';
}

function getOutputFile(path) {
  return sprintf("%s%s.%s", [getOutputDir(path), getFileName(path), cssType(path)]);
}

function getPathStartJSR(path) {

}

function isPathToComponent(path) {
  var componentIndex = path.indexOf('components');
  var clinetlibsIndex = path.indexOf('clientlibs');

  if (componentIndex && clinetlibsIndex && clinetlibsIndex > componentIndex) {
    return true;
  }

  return false;
}

function isFileCanBePreproc(path) {
  var cssType = cssType(path);
  var cssTypes = _.keys(options.preproc);

  return isPathToComponent(path) && (cssTypes.indexOf(cssType) >= 0);
}


function cssPreproc(path, type) {
  var cssDirPth = getOutputDir(path);

  fs.exists(cssDirPth, function(exists) {
    if (exists) {
      console.log('file exist: ' + path);
      scss.renderFile({
        file: path,
        outFile: cssOutput,
        success: function () {
          logger.preproc('scss preproc file: ' + subPath);
        },

        error: function (err) {
          logger.error('scss cant preproc: ' + subPath);
        },

      });
    } else {
      logger.error('css dir not exist:' + cssDirPth);
    }
  });
}

module.export = {
  isFileCanBePreproc: isFileCanBePreproc,
  preproc: cssPreproc
}
