var fs = require('fs');
var sass = require('node-sass');
var stylus = require('stylus');
var less = require('less');
var _ = require('underscore');
var logger = require('./logger');
var sprintf = require('sprintf').sprintf;
var options, log;

options = {
  preprocFun: {},
  errorMessages: {
    cssDirNotFound: function (cssDir) {
      logger.error('css dir not exist:' + getPathStartJSR(cssDir));
    },
    preprocFileDone: function (path, type) {
      logger.preproc(sprintf('%s successful preproc: %s', type, getPathStartJSR(path)));
    },
    preprocFileFail: function (path, type) {
      logger.preproc(sprintf('%s fails preproc:: %s', type, getPathStartJSR(path)));
    }
  },
  matchJsrRoot: /jcr_root(.*)$/,
}
log = options.errorMessages;


function cssType(path) {
  return path.match(/\.([^.]+)$/)[1];
}

function getFileName(path) {
  return path.match(/\/([^\/]*)\.[^\.]+$/)[1];
}

function getOutputDir(path) {
  var clientlibs = path.match(/^(.*\/clientlibs\/)/)[1];

  return clientlibs + 'css/';
}

function getOutputFile(path) {
  return sprintf("%s%s.css", getOutputDir(path), getFileName(path));
}

function getPathStartJSR(path) {
  return path.match(options.matchJsrRoot)[1];
}

function preprocIfDirExist(preproc) {
  return function (path) {
    var cssDir = getOutputDir(path);

    fs.exists(cssDir, function (exist) {
      if (exist) {
        preproc(path, getOutputFile(path))
      } else {
        log.cssDirNotFound(cssDir);
      }
    });
  }
}

function preprocSass(path, outputFile){

  console.log('sass: ' + path);

  sass.renderFile({
    file: path,
    outFile: outputFile,
    success: function () {
      log.preprocFileDone(path, 'scss');
    },

    error: function (err) {
      log.preprocFileFail(path, 'scss');
    },
  });
}

function preprocLess(path, outputFile) {
  fs.readFile(path, function (err, lessFile) {
    if(err) throw err;
    less.render(lessFile.toString(), function (err, css) {
      if(err) log.preprocFileFail(path, 'less');
      fs.writeFile(outputFile, css, function (err) {
        if(err) throw err;

        log.preprocFileDone(path, 'less');
      });
    });
  });

}

function preprocStylus(path, outputFile) {
  fs.readFile(path, function (err, stylusFile) {
    if(err) throw err;

    stylus(stylusFile.toString())
      .render(function(err, css){
        if(err) throw err;

          fs.writeFile(outputFile, css, function (err) {
            if(err) throw err;
            log.preprocFileDone(path, 'stylus');
          });
      });
  });
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
  var type = cssType(path);
  var cssTypes = _.keys(options.preprocFun);

  return isPathToComponent(path) && (cssTypes.indexOf(type) >= 0);
}

options.preprocFun = {
  sass: preprocIfDirExist(preprocSass),
  scss: preprocIfDirExist(preprocSass),
  less: preprocIfDirExist(preprocLess),
  styl: preprocIfDirExist(preprocStylus)
}

function cssPreproc(path) {
  var fileType = cssType(path);
  var preprocessor = options.preprocFun[fileType];

  preprocessor(path);
}

module.exports = {
  isFileCanBePreproc: isFileCanBePreproc,
  preproc: cssPreproc
}
