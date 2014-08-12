var fs = require('fs');
var pth = require('path');

var sass = require('node-sass');
var stylus = require('stylus');
var less = require('less');

var logger = require('./logger');

var options, log;

options = {
  preprocFun: {},
  errorMessages: {
    cssDirNotFound: function (cssDir) {
      logger.error('css dir not exist:' + getPathStartJSR(cssDir));
    },
    preprocFileDone: function (path, type) {
      logger.preproc('%s successful preproc: %s', type, getPathStartJSR(path));
    },
    preprocFileFail: function (path, type) {
      logger.preproc('%s fails preproc: %s', type, getPathStartJSR(path));
    }
  },
  matchJsrRoot: /jcr_root(.*)$/
};

log = options.errorMessages;


function cssType(path) {
  return pth.extname(path).replace('.', '');
}

function getFileName(path) {
  return pth.basename(path, pth.extname(path));
}

function getOutputDir(path) {
  return pth.dirname(path);
}

function getOutputFile(path) {
  return pth.join(getOutputDir(path), getFileName(path) + '.css');
}

function getPathStartJSR(path) {
  return path.match(options.matchJsrRoot)[1];
}

function preprocIfDirExist(preproc) {
  return function (path) {
    var cssDir = getOutputDir(path);

    fs.exists(cssDir, function (exist) {
      if (exist) {
        preproc(path, getOutputFile(path));
      } else {
        log.cssDirNotFound(cssDir);
      }
    });
  };
}

function preprocSass(path, outputFile){
  sass.renderFile({
    file: path,
    outFile: outputFile,
    success: function () {
      log.preprocFileDone(path, 'scss');
    },

    error: function (err) {
      console.log(err);
      log.preprocFileFail(path, 'scss');
    }
  });
}

function preprocLess(path, outputFile) {
  fs.readFile(path, function (err, lessFile) {
    if(err) {
      throw err;
    }
    less.render(lessFile.toString(), function (err, css) {
      if(err) {
        log.preprocFileFail(path, 'less');
      }
      fs.writeFile(outputFile, css, function (err) {
        if(err) {
          throw err;
        }

        log.preprocFileDone(path, 'less');
      });
    });
  });

}

function preprocStylus(path, outputFile) {
  fs.readFile(path, function (err, stylusFile) {
    if(err) {
      throw err;
    }

    stylus(stylusFile.toString())
      .render(function(err, css){
        if(err) {
          throw err;
        }

          fs.writeFile(outputFile, css, function (err) {
            if(err) {
              throw err;
            }
            log.preprocFileDone(path, 'stylus');
          });
      });
  });
}

function isPathToComponent(path) {
  var componentIndex = path.indexOf('components');
  var clinetlibsIndex = path.indexOf('clientlibs');

  return !!(componentIndex && clinetlibsIndex && clinetlibsIndex > componentIndex);
}

/**
 * Checks if file could be preprocessed
 *
 * @param {string} path Path to file in file system
 * @return {boolean}
 */
function isFileCanBePreproc(path) {
  var type = cssType(path);
  var cssTypes = Object.keys(options.preprocFun);

  return isPathToComponent(path) && (cssTypes.indexOf(type) >= 0);
}

options.preprocFun = {
  sass: preprocIfDirExist(preprocSass),
  scss: preprocIfDirExist(preprocSass),
  less: preprocIfDirExist(preprocLess),
  styl: preprocIfDirExist(preprocStylus)
};

/**
 * Runs preprocessing
 *
 * @param {string} path Path to file in file system
 */
function cssPreproc(path) {
  var fileType = cssType(path);
  var preprocessor = options.preprocFun[fileType];

  preprocessor(path);
}

/**
 * Expose preprocessing functions
 *
 * @module
 */
module.exports = {
  isFileCanBePreproc: isFileCanBePreproc,
  preproc: cssPreproc
};
