# crxde-pipe

## CLI

Install `crxde-pipe` from sources:
```sh
$ git clone https://github.com/fortywinkz/crxde-pipe.git
$ npm install
$ nmp link
```

Run:
```bash
crxde-pipe path/to/project/src
```

Enable debugging:
```bash
DEBUG=* crxde-pipe path/to/project/src
```
Also you can specify debugging target:
```bash
DEBUG=app:error crxde-pipe path/to/project/src
```
_For more information see [docs](docs/README.md) and [debug](https://github.com/visionmedia/debug) project_

Options:
```bash
crxde-pipe -h                                                                                             [15:54:04]

Usage: crxde-pipe [options] [dir]

Options:

-h, --help            output usage information
-V, --version         output the version number
-m, --match [regex]   Regex for matching CQ path
-i, --ignore [regex]  Regex for excluding files from watching
-I, --interval [ms]   Interval of watching
```

## API

###Index

**Modules**

* [crxde-pipe](#module_crxde-pipe)
  * [crxde-pipe.pipe(paths, options)](#module_crxde-pipe.pipe)
* [logger](#module_logger)
  * [logger.log](#module_logger.log)
  * [logger.error](#module_logger.error)
  * [logger.update](#module_logger.update)
  * [logger.create](#module_logger.create)
  * [logger.remove](#module_logger.remove)

**Classes**

* [class: CRXDE](#CRXDE)
  * [new CRXDE([options])](#new_CRXDE)
  * [cRXDE.pipe(paths, [options])](#CRXDE#pipe)
  * [cRXDE.add(path, type)](#CRXDE#add)
  * [cRXDE.update(path, resource)](#CRXDE#update)
  * [cRXDE.remove(path)](#CRXDE#remove)
 
<a name="module_crxde-pipe"></a>
###crxde-pipe
Expose a single function to pipe source files to CQ (CRXDE)

<a name="module_crxde-pipe.pipe"></a>
####crxde-pipe.pipe(paths, options)
Pipe source files to CQ (CRXDE)

**Params**

- paths `Array`  
- options `Object`  

**Returns**: [CRXDE](#CRXDE)  
<a name="module_logger"></a>
###logger
Expose logging targets

**Members**

* [logger](#module_logger)
  * [logger.log](#module_logger.log)
  * [logger.error](#module_logger.error)
  * [logger.update](#module_logger.update)
  * [logger.create](#module_logger.create)
  * [logger.remove](#module_logger.remove)

<a name="module_logger.log"></a>
####logger.log
Target for base logging

<a name="module_logger.error"></a>
####logger.error
Target for logging errors

<a name="module_logger.update"></a>
####logger.update
Target for logging updates of file on CQ (CRXDE)

<a name="module_logger.create"></a>
####logger.create
Target for logging uploads of file to CQ (CRXDE)

<a name="module_logger.remove"></a>
####logger.remove
Target for logging removal of file from CQ (CRXDE)

<a name="CRXDE"></a>
###class: CRXDE
**Members**

* [class: CRXDE](#CRXDE)
  * [new CRXDE([options])](#new_CRXDE)
  * [cRXDE.pipe(paths, [options])](#CRXDE#pipe)
  * [cRXDE.add(path, type)](#CRXDE#add)
  * [cRXDE.update(path, resource)](#CRXDE#update)
  * [cRXDE.remove(path)](#CRXDE#remove)

<a name="new_CRXDE"></a>
####new CRXDE([options])
Provides piping of source code to CQ (CRXDE)

**Params**

- \[options\] `Object` - Watching options  
  - match `RegExp` - Matches root path of CQ files. Default: `/jcr_root(.*)$/`  
  - ignore `RegExp` - Matches files which will be ignored from watching. Default: `/\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb__bak___|Thumbs.db$|ehthumbs.db$|Desktop.ini$|\$RECYCLE.BIN/`  
  - interval `number` - Watching interval. Default: `500`  
  - host `string` - Hostname of CRXDE instance. Default: `localhost`  
  - port `number` - Port of CRXDE instance. Default: `4502`  
  - auth `string` - Authentication data for CRXDE instance. Default: `admin:admin`  

<a name="CRXDE#pipe"></a>
####cRXDE.pipe(paths, [options])
Syncs files from source code to CQ (CRXDE)

**Params**

- paths `Array` - Watching paths  
- \[options\] `Object` - Watching options  

**Returns**: [CRXDE](#CRXDE)  
<a name="CRXDE#add"></a>
####cRXDE.add(path, type)
Uploads a new file to CQ (CRXDE)

**Params**

- path `string` - Path to file (relative to root)  
- type `string` - Type of file (nt:file, nt:folder, etc.)  

**Returns**: [CRXDE](#CRXDE)  
<a name="CRXDE#update"></a>
####cRXDE.update(path, resource)
Updates a file on CQ (CRXDE)

**Params**

- path `string` - Path to file (relative to root)  
- resource `string` - Path to file in file system  

**Returns**: [CRXDE](#CRXDE)  
<a name="CRXDE#remove"></a>
####cRXDE.remove(path)
Removes a file from CQ (CRXDE)

**Params**

- path `string` - Path to file (relative to root)  

**Returns**: [CRXDE](#CRXDE)  
*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*.
