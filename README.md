
> # This project is not maintained anymore. Use [aemsync](https://github.com/gavoja/aemsync) instead.

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

### Modules

<dl>
<dt><a href="#module_crxde-pipe">crxde-pipe</a></dt>
<dd><p>Expose a single function to pipe source files to CQ (CRXDE)</p>
</dd>
<dt><a href="#module_logger">logger</a></dt>
<dd><p>Expose logging targets</p>
</dd>
</dl>

### Classes

<dl>
<dt><a href="#CRXDE">CRXDE</a></dt>
<dd></dd>
</dl>

### Typedefs

<dl>
<dt><a href="#Server">Server</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="module_crxde-pipe"></a>
### crxde-pipe
Expose a single function to pipe source files to CQ (CRXDE)

<a name="module_crxde-pipe.pipe"></a>
#### crxde-pipe.pipe(paths, options) ⇒ <code>[CRXDE](#CRXDE)</code>
Pipe source files to CQ (CRXDE)

**Kind**: static method of <code>[crxde-pipe](#module_crxde-pipe)</code>  

| Param | Type |
| --- | --- |
| paths | <code>Array</code> | 
| options | <code>Object</code> | 

<a name="module_logger"></a>
### logger
Expose logging targets


* [logger](#module_logger)
    * [.log](#module_logger.log)
    * [.debug](#module_logger.debug)
    * [.error](#module_logger.error)
    * [.update](#module_logger.update)
    * [.create](#module_logger.create)
    * [.remove](#module_logger.remove)

<a name="module_logger.log"></a>
#### logger.log
`app:log` Target for base logging

**Kind**: static property of <code>[logger](#module_logger)</code>  
<a name="module_logger.debug"></a>
#### logger.debug
`app:debug` Target for debugging

**Kind**: static property of <code>[logger](#module_logger)</code>  
<a name="module_logger.error"></a>
#### logger.error
`app:error` Target for logging errors

**Kind**: static property of <code>[logger](#module_logger)</code>  
<a name="module_logger.update"></a>
#### logger.update
`crxde:update` Target for logging updates of file on CQ (CRXDE)

**Kind**: static property of <code>[logger](#module_logger)</code>  
<a name="module_logger.create"></a>
#### logger.create
`crxde:create` Target for logging uploads of file to CQ (CRXDE)

**Kind**: static property of <code>[logger](#module_logger)</code>  
<a name="module_logger.remove"></a>
#### logger.remove
`crxde:remove` Target for logging removal of file from CQ (CRXDE)

**Kind**: static property of <code>[logger](#module_logger)</code>  
<a name="CRXDE"></a>
### CRXDE
**Kind**: global class  

* [CRXDE](#CRXDE)
    * [new CRXDE([options])](#new_CRXDE_new)
    * ~~[.update](#CRXDE+update) ⇒ <code>[CRXDE](#CRXDE)</code>~~
    * [.pipe(paths)](#CRXDE+pipe) ⇒ <code>[CRXDE](#CRXDE)</code>
    * [.add(jcrUrl, type)](#CRXDE+add) ⇒ <code>[CRXDE](#CRXDE)</code>
    * [.upload(jcrUrl, resource)](#CRXDE+upload) ⇒ <code>[CRXDE](#CRXDE)</code>
    * [.remove(jcrUrl)](#CRXDE+remove) ⇒ <code>[CRXDE](#CRXDE)</code>

<a name="new_CRXDE_new"></a>
#### new CRXDE([options])
Provides piping of source code to CQ (CRXDE)


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Watching options |
| options.match | <code>RegExp</code> | Matches root path of CQ files. Default: `/jcr_root(.*)$/` |
| options.ignore | <code>RegExp</code> | Matches files which will be ignored from watching. Default: `/\.git|\.sass-cache|\.hg|\.idea|\.svn|\.cache|\.project|___jb.*___$|Thumbs\.db$|ehthumbs\.db$|Desktop.ini$|\$RECYCLE.BIN|\.xml|node_modules/` |
| options.interval | <code>number</code> | Watching interval. Default: `500` |
| options.server | <code>[Server](#Server)</code> | Server of CRXDE instance. Default: `{ protocol: 'http', hostname: 'localhost': port: 4502 }` |
| options.auth | <code>Object</code> | Authentication data for CRXDE instance. Default: `{ user: 'admin', pass: 'admin' }` |

<a name="CRXDE+update"></a>
#### ~~crxdE.update ⇒ <code>[CRXDE](#CRXDE)</code>~~
***Deprecated***

Updates a file on CQ (CRXDE)

**Kind**: instance property of <code>[CRXDE](#CRXDE)</code>  

| Param | Type | Description |
| --- | --- | --- |
| jcrUrl | <code>string</code> | Path to file (relative to root) |
| resource | <code>string</code> | Path to file in file system |

<a name="CRXDE+pipe"></a>
#### crxdE.pipe(paths) ⇒ <code>[CRXDE](#CRXDE)</code>
Syncs files from source code to CQ (CRXDE)

**Kind**: instance method of <code>[CRXDE](#CRXDE)</code>  

| Param | Type | Description |
| --- | --- | --- |
| paths | <code>Array</code> | Watching paths |

<a name="CRXDE+add"></a>
#### crxdE.add(jcrUrl, type) ⇒ <code>[CRXDE](#CRXDE)</code>
Creates a new node in CQ (CRXDE)

**Kind**: instance method of <code>[CRXDE](#CRXDE)</code>  

| Param | Type | Description |
| --- | --- | --- |
| jcrUrl | <code>string</code> | Path to file (relative to root) |
| type | <code>string</code> | Type of file (nt:file, nt:folder, etc.) |

<a name="CRXDE+upload"></a>
#### crxdE.upload(jcrUrl, resource) ⇒ <code>[CRXDE](#CRXDE)</code>
Uploads a file on CQ (CRXDE)

**Kind**: instance method of <code>[CRXDE](#CRXDE)</code>  

| Param | Type | Description |
| --- | --- | --- |
| jcrUrl | <code>string</code> | Path to file (relative to root) |
| resource | <code>string</code> | Path to file in file system |

<a name="CRXDE+remove"></a>
#### crxdE.remove(jcrUrl) ⇒ <code>[CRXDE](#CRXDE)</code>
Removes a file from CQ (CRXDE)

**Kind**: instance method of <code>[CRXDE](#CRXDE)</code>  

| Param | Type | Description |
| --- | --- | --- |
| jcrUrl | <code>string</code> | Path to file (relative to root) |

<a name="Server"></a>
### Server : <code>Object</code>
**Kind**: global typedef  
**Link**: http://nodejs.org/api/url.html  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| protocol | <code>string</code> | Server protocol |
| hostname | <code>string</code> | Hostname portion of server host |
| port | <code>number</code> | Port number portion of server host |


*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*
