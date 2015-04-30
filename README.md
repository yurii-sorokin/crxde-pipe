# crxde-pipe

## CLI

Install `crxde-pipe` from sources:
```sh
$ git clone https://github.com/fortywinkz/crxde-pipe.git
$ cd crxde-pipe
$ npm install
$ npm link
```

or from npm:
```sh
$ npm install crxde-pipe -g
```

Also it is available as bower package:
```sh
$ bower install crxde-pipe
```

Run:
```bash
$ crxde-pipe path/to/project/src
```

Enable debugging:
```bash
$ DEBUG=* crxde-pipe path/to/project/src
```
or for windows users:
```shell
cmd /C "set DEBUG=* && crxde-pipe path/to/project/src"
```

Also you can specify debugging target:
```bash
$ DEBUG=app:error crxde-pipe path/to/project/src
```
_For more information see [docs](#module_logger) and [debug](https://github.com/visionmedia/debug) project_

Options:
```bash
$ crxde-pipe -h

    Usage: crxde-pipe [options] <dir...>

    Options:

    -h, --help                    output usage information
    -V, --version                 output the version number
    -m, --match [regex]           pattern matching CRX root under your files
    -i, --ignore [regex]          pattern used to exclude files from the watch
    -I, --interval [ms]           indicate how often file system should be polled
    -s, --server [host:port]      locate where CRX repository is running
    -d, --dispatcher [host:port]  locate where Dispatcher is running
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
  * [~~crxdE.update~~](#CRXDE#update)
  * [crxdE.pipe(paths)](#CRXDE#pipe)
  * [crxdE.add(jcrUrl, type)](#CRXDE#add)
  * [crxdE.upload(jcrUrl, resource)](#CRXDE#upload)
  * [crxdE.remove(jcrUrl)](#CRXDE#remove)

**Typedefs**

* [type: Server](#Server)
 
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
`crxde:log` Target for base logging

<a name="module_logger.error"></a>
####logger.error
`crxde:error` Target for logging errors

<a name="module_logger.update"></a>
####logger.update
`crxde:update` Target for logging updates of file on CQ (CRXDE)

<a name="module_logger.create"></a>
####logger.create
`crxde:create` Target for logging uploads of file to CQ (CRXDE)

<a name="module_logger.remove"></a>
####logger.remove
`crxde:remove` Target for logging removal of file from CQ (CRXDE)

<a name="CRXDE"></a>
###class: CRXDE
**Members**

* [class: CRXDE](#CRXDE)
  * [new CRXDE([options])](#new_CRXDE)
  * [~~crxdE.update~~](#CRXDE#update)
  * [crxdE.pipe(paths)](#CRXDE#pipe)
  * [crxdE.add(jcrUrl, type)](#CRXDE#add)
  * [crxdE.upload(jcrUrl, resource)](#CRXDE#upload)
  * [crxdE.remove(jcrUrl)](#CRXDE#remove)

<a name="new_CRXDE"></a>
####new CRXDE([options])
Provides piping of source code to CQ (CRXDE)

**Params**

- \[options\] `Object` - Watching options  
  - match `RegExp` - Matches root path of CQ files. Default: `/jcr_root(.*)$/`  
  - ignore `RegExp` - Matches files which will be ignored from watching. Default: `/\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb.*___$|Thumbs.db$|ehthumbs.db$|Desktop.ini$|\$RECYCLE.BIN|\.content.xml|node_modules/`  
  - interval `number` - Watching interval. Default: `500`  
  - server <code>[Server](#Server)</code> - Server of CRXDE instance. Default: `{ protocol: 'http', hostname: 'localhost': port: 4502 }`  
  - auth `Object` - Authentication data for CRXDE instance. Default: `{ user: 'admin', pass: 'admin' }`  

<a name="CRXDE#update"></a>
####~~crxdE.update~~
Updates a file on CQ (CRXDE)

**Params**

- jcrUrl `string` - Path to file (relative to root)  
- resource `string` - Path to file in file system  

***Deprecated***  
**Returns**: [CRXDE](#CRXDE)  
<a name="CRXDE#pipe"></a>
####crxdE.pipe(paths)
Syncs files from source code to CQ (CRXDE)

**Params**

- paths `Array` - Watching paths  

**Returns**: [CRXDE](#CRXDE)  
<a name="CRXDE#add"></a>
####crxdE.add(jcrUrl, type)
Creates a new node in CQ (CRXDE)

**Params**

- jcrUrl `string` - Path to file (relative to root)  
- type `string` - Type of file (nt:file, nt:folder, etc.)  

**Returns**: [CRXDE](#CRXDE)  
<a name="CRXDE#upload"></a>
####crxdE.upload(jcrUrl, resource)
Uploads a file on CQ (CRXDE)

**Params**

- jcrUrl `string` - Path to file (relative to root)  
- resource `string` - Path to file in file system  

**Returns**: [CRXDE](#CRXDE)  
<a name="CRXDE#remove"></a>
####crxdE.remove(jcrUrl)
Removes a file from CQ (CRXDE)

**Params**

- jcrUrl `string` - Path to file (relative to root)  

**Returns**: [CRXDE](#CRXDE)  
<a name="Server"></a>
###type: Server
**Properties**

- protocol `string` - Server protocol  
- hostname `string` - Hostname portion of server host  
- port `number` - Port number portion of server host  

**Type**: `Object`  


*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*
