/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var l20n = __webpack_require__(1);
	window.ReactL20n = {
	  l20n: l20n,
	  Entity: l20n.Entity
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var _extends = __webpack_require__(2)['default'];

	var _Object$keys = __webpack_require__(17)['default'];

	var _Object$create = __webpack_require__(21)['default'];

	(function (window, undefined) {

	  function define(name, payload) {
	    define.modules[name] = payload;
	  };

	  // un-instantiated modules
	  define.modules = {};
	  // instantiated modules
	  define.exports = {};

	  function normalize(path) {
	    var parts = path.split('/');
	    var normalized = [];
	    for (var i = 0; i < parts.length; i++) {
	      if (parts[i] == '.') {
	        // don't add it to `normalized`
	      } else if (parts[i] == '..') {
	          normalized.pop();
	        } else {
	          normalized.push(parts[i]);
	        }
	    }
	    return normalized.join('/');
	  }

	  function join(a, b) {
	    return a ? a.trim().replace(/\/*$/, '/') + b.trim() : b.trim();
	  }

	  function dirname(path) {
	    return path ? path.split('/').slice(0, -1).join('/') : null;
	  }

	  function req(leaf, name) {
	    name = normalize(join(dirname(leaf), name));
	    if (name in define.exports) {
	      return define.exports[name];
	    }
	    if (!(name in define.modules)) {
	      throw new Error("Module not defined: " + name);
	    }

	    var module = define.modules[name];
	    if (typeof module == "function") {
	      var exports = {};
	      var reply = module(req.bind(null, name), exports, { id: name, uri: "" });
	      module = reply !== undefined ? reply : exports;
	    }
	    return define.exports[name] = module;
	  };

	  // for the top-level required modules, leaf is null
	  var require = req.bind(null, null);
	  define('l20n', function (require, exports) {
	    'use strict';

	    var Context = require('./l20n/context').Context;
	    var Parser = require('./l20n/parser').Parser;
	    var Compiler = require('./l20n/compiler').Compiler;

	    exports.Context = Context;
	    exports.Parser = Parser;
	    exports.Compiler = Compiler;
	    exports.getContext = function L20n_getContext(id) {
	      return new Context(id);
	    };
	  });
	  define('l20n/context', function (require, exports) {
	    'use strict';

	    var EventEmitter = require('./events').EventEmitter;
	    var Parser = require('./parser').Parser;
	    var Compiler = require('./compiler').Compiler;
	    var RetranslationManager = require('./retranslation').RetranslationManager;

	    // register globals with RetranslationManager
	    require('./platform/globals');
	    var io = require('./platform/io');

	    function Resource(id, parser) {
	      var self = this;

	      this.id = id;
	      this.resources = [];
	      this.source = null;
	      this.ast = {
	        type: 'LOL',
	        body: []
	      };

	      this.build = build;

	      var _imports_positions = [];
	      // absolute URLs start with a slash or contain a colon (for schema)
	      var reAbsolute = /^\/|:/;

	      function build(nesting, callback, sync) {
	        if (nesting >= 7) {
	          return callback(new ContextError('Too many nested imports.'));
	        }

	        if (self.source) {
	          // Bug 908826 - Don't artificially force asynchronicity when only using
	          // addResource
	          // https://bugzilla.mozilla.org/show_bug.cgi?id=908826
	          return setTimeout(function () {
	            parse();
	          });
	        } else {
	          io.load(self.id, parse, sync);
	        }

	        function parse(err, text) {
	          if (err) {
	            return callback(err);
	          } else if (text !== undefined) {
	            self.source = text;
	          }
	          self.ast = parser.parse(self.source);
	          buildImports();
	        }

	        function buildImports() {
	          var imports = self.ast.body.filter(function (elem, i) {
	            if (elem.type === 'ImportStatement') {
	              _imports_positions.push(i);
	              return true;
	            }
	            return false;
	          });

	          imports.forEach(function (imp) {
	            var uri = relativeToSelf(imp.uri.content);
	            var res = new Resource(uri, parser);
	            self.resources.push(res);
	          });

	          var importsToBuild = self.resources.length;
	          if (importsToBuild === 0) {
	            return callback();
	          }

	          self.resources.forEach(function (res) {
	            res.build(nesting + 1, resourceBuilt, sync);
	          });

	          function resourceBuilt(err) {
	            if (err) {
	              return callback(err);
	            }
	            importsToBuild--;
	            if (importsToBuild === 0) {
	              flatten();
	            }
	          }
	        }

	        function flatten() {
	          for (var i = self.resources.length - 1; i >= 0; i--) {
	            var pos = _imports_positions[i] || 0;
	            Array.prototype.splice.apply(self.ast.body, [pos, 1].concat(self.resources[i].ast.body));
	          }
	          callback();
	        }
	      }

	      function relativeToSelf(url) {
	        if (self.id === null || reAbsolute.test(url)) {
	          return url;
	        }
	        var dirs = self.id.split('/').slice(0, -1).concat(url.split('/')).filter(function (elem) {
	          return elem !== '.';
	        });

	        return dirs.join('/');
	      }
	    }

	    function Locale(id, parser, compiler, emitter) {
	      this.id = id;
	      this.resources = [];
	      this.entries = null;
	      this.ast = {
	        type: 'LOL',
	        body: []
	      };
	      this.isReady = false;

	      this.build = build;
	      this.getEntry = getEntry;
	      this.hasResource = hasResource;

	      var self = this;

	      function build(callback) {
	        if (!callback) {
	          var sync = true;
	        }

	        var resourcesToBuild = self.resources.length;
	        if (resourcesToBuild === 0) {
	          throw new ContextError('Locale has no resources');
	        }

	        var resourcesWithErrors = 0;
	        self.resources.forEach(function (res) {
	          res.build(0, resourceBuilt, sync);
	        });

	        function resourceBuilt(err) {
	          if (err) {
	            resourcesWithErrors++;
	            emitter.emit(err instanceof ContextError ? 'error' : 'warning', err);
	          }
	          resourcesToBuild--;
	          if (resourcesToBuild === 0) {
	            if (resourcesWithErrors === self.resources.length) {
	              // XXX Bug 908780 - Decide what to do when all resources in
	              // a locale are missing or broken
	              // https://bugzilla.mozilla.org/show_bug.cgi?id=908780
	              emitter.emit('error', new ContextError('Locale has no valid resources'));
	            }
	            flatten();
	          }
	        }

	        function flatten() {
	          self.ast.body = self.resources.reduce(function (prev, curr) {
	            return prev.concat(curr.ast.body);
	          }, self.ast.body);
	          compile();
	        }

	        function compile() {
	          self.entries = compiler.compile(self.ast);
	          self.isReady = true;
	          if (callback) {
	            callback();
	          }
	        }
	      }

	      function getEntry(id) {
	        /* jshint validthis: true */
	        if (this.entries.hasOwnProperty(id)) {
	          return this.entries[id];
	        }
	        return undefined;
	      }

	      function hasResource(uri) {
	        /* jshint validthis: true */
	        return this.resources.some(function (res) {
	          return res.id === uri;
	        });
	      }
	    }

	    function Context(id) {

	      this.id = id;

	      this.registerLocales = registerLocales;
	      this.registerLocaleNegotiator = registerLocaleNegotiator;
	      this.requestLocales = requestLocales;
	      this.addResource = addResource;
	      this.linkResource = linkResource;
	      this.updateData = updateData;

	      this.getSync = getSync;
	      this.getEntitySync = getEntitySync;
	      this.localize = localize;
	      this.ready = ready;

	      this.addEventListener = addEvent;
	      this.removeEventListener = removeEvent;

	      Object.defineProperty(this, 'supportedLocales', {
	        get: function get() {
	          return _fallbackChain.slice();
	        },
	        enumerable: true
	      });

	      var _data = {};

	      // language negotiator function
	      var _negotiator;

	      // registered and available languages
	      var _default = 'i-default';
	      var _registered = [_default];
	      var _requested = [];
	      var _fallbackChain = [];
	      // Locale objects corresponding to the registered languages
	      var _locales = {};

	      // URLs or text of resources (with information about the type) added via
	      // linkResource and addResource
	      var _reslinks = [];

	      var _isReady = false;
	      var _isFrozen = false;
	      var _emitter = new EventEmitter();
	      var _parser = new Parser();
	      var _compiler = new Compiler();

	      var _retr = new RetranslationManager();

	      var self = this;

	      _parser.addEventListener('error', error);
	      _compiler.addEventListener('error', warn);
	      _compiler.setGlobals(_retr.globals);

	      function extend(dst, src) {
	        _Object$keys(src).forEach(function (key) {
	          if (src[key] === undefined) {
	            // un-define (remove) the property from dst
	            delete dst[key];
	          } else if (typeof src[key] !== 'object') {
	            // if the source property is a primitive, just copy it overwriting
	            // whatever the destination property is
	            dst[key] = src[key];
	          } else {
	            // if the source property is an object, deep-copy it recursively
	            if (typeof dst[key] !== 'object') {
	              dst[key] = {};
	            }
	            extend(dst[key], src[key]);
	          }
	        });
	      }

	      function updateData(obj) {
	        if (!obj || typeof obj !== 'object') {
	          throw new ContextError('Context data must be a non-null object');
	        }
	        extend(_data, obj);
	      }

	      function getSync(id, data) {
	        if (!_isReady) {
	          throw new ContextError('Context not ready');
	        }
	        return getFromLocale.call(self, 0, id, data).value;
	      }

	      function getEntitySync(id, data) {
	        if (!_isReady) {
	          throw new ContextError('Context not ready');
	        }
	        return getFromLocale.call(self, 0, id, data);
	      }

	      function localize(ids, callback) {
	        if (!callback) {
	          throw new ContextError('No callback passed');
	        }
	        return bindLocalize.call(self, ids, callback);
	      }

	      function ready(callback) {
	        if (_isReady) {
	          setTimeout(callback);
	        }
	        addEvent('ready', callback);
	      }

	      function bindLocalize(ids, callback, reason) {
	        /* jshint validthis: true */

	        var bound = {
	          // stop: fn
	          extend: (function extend(newIds) {
	            for (var i = 0; i < newIds.length; i++) {
	              if (ids.indexOf(newIds[i]) === -1) {
	                ids.push(newIds[i]);
	              }
	            }
	            if (!_isReady) {
	              return;
	            }
	            var newMany = getMany.call(this, newIds);
	            // rebind the callback in `_retr`: append new globals seen used in
	            // `newIds` and overwrite the callback with a new one which has the
	            // updated `ids`
	            _retr.bindGet({
	              id: callback,
	              callback: bindLocalize.bind(this, ids, callback),
	              globals: _Object$keys(newMany.globalsUsed)
	            }, true);
	            return newMany;
	          }).bind(this),
	          stop: (function stop() {
	            _retr.unbindGet(callback);
	          }).bind(this)
	        };

	        // if the ctx isn't ready, bind the callback and return
	        if (!_isReady) {
	          _retr.bindGet({
	            id: callback,
	            callback: bindLocalize.bind(this, ids, callback),
	            globals: []
	          });
	          return bound;
	        }

	        // if the ctx is ready, retrieve the entities
	        var many = getMany.call(this, ids);
	        var l10n = {
	          entities: many.entities,
	          // `reason` might be undefined if context was ready before `localize`
	          // was called;  in that case, we pass `locales` so that this scenario
	          // is transparent for the callback
	          reason: reason || { locales: _fallbackChain.slice() },
	          stop: function stop() {
	            _retr.unbindGet(callback);
	          }
	        };
	        _retr.bindGet({
	          id: callback,
	          callback: bindLocalize.bind(this, ids, callback),
	          globals: _Object$keys(many.globalsUsed)
	        });
	        // callback may call bound.extend which will rebind it if needed;  for
	        // this to work it needs to be called after _retr.bindGet above;
	        // otherwise bindGet would listen to globals passed initially in
	        // many.globalsUsed
	        callback(l10n);
	        return bound;
	      }

	      function getMany(ids) {
	        /* jshint validthis: true */
	        var many = {
	          entities: {},
	          globalsUsed: {}
	        };
	        for (var i = 0, id; id = ids[i]; i++) {
	          many.entities[id] = getEntitySync.call(this, id);
	          for (var global in many.entities[id].globals) {
	            if (many.entities[id].globals.hasOwnProperty(global)) {
	              many.globalsUsed[global] = true;
	            }
	          }
	        }
	        return many;
	      }

	      function getFromLocale(_x, _x2, _x3, _x4) {
	        var _again = true;

	        _function: while (_again) {
	          var cur = _x,
	              id = _x2,
	              data = _x3,
	              prevSource = _x4;
	          loc = locale = entry = value = source = undefined;
	          _again = false;

	          /* jshint validthis: true */
	          var loc = _fallbackChain[cur];
	          if (!loc) {
	            error(new RuntimeError('Unable to get translation', id, _fallbackChain));
	            // imitate the return value of Compiler.Entity.get
	            return {
	              value: prevSource ? prevSource.source : id,
	              attributes: {},
	              globals: {},
	              locale: prevSource ? prevSource.loc : null
	            };
	          }
	          var locale = getLocale(loc);

	          if (!locale.isReady) {
	            // build without a callback, synchronously
	            locale.build(null);
	          }

	          var entry = locale.getEntry(id);

	          // if the entry is missing, just go to the next locale immediately
	          if (entry === undefined) {
	            warn(new TranslationError('Not found', id, _fallbackChain, locale));
	            _x = cur + 1;
	            _x2 = id;
	            _x3 = data;
	            _x4 = prevSource;
	            _again = true;
	            continue _function;
	          }

	          // otherwise, try to get the value of the entry
	          var value;
	          try {
	            value = entry.get(getArgs.call(this, data));
	          } catch (e) {
	            if (e instanceof Compiler.RuntimeError) {
	              error(new TranslationError(e.message, id, _fallbackChain, locale));
	              if (e instanceof Compiler.ValueError) {
	                // salvage the source string which the compiler wasn't able to
	                // evaluate completely;  this is still better than returning the
	                // identifer;  prefer a source string from locales earlier in the
	                // fallback chain, if available
	                var source = prevSource || { source: e.source, loc: locale.id };
	                _x = cur + 1;
	                _x2 = id;
	                _x3 = data;
	                _x4 = source;
	                _again = true;
	                continue _function;
	              }
	              _x = cur + 1;
	              _x2 = id;
	              _x3 = data;
	              _x4 = prevSource;
	              _again = true;
	              continue _function;
	            } else {
	              throw error(e);
	            }
	          }
	          value.locale = locale.id;
	          return value;
	        }
	      }

	      function getArgs(extra) {
	        if (!extra) {
	          return _data;
	        }
	        var args = {};
	        // deep-clone _data first
	        extend(args, _data);
	        // overwrite args with the extra args passed to the `get` call
	        extend(args, extra);
	        return args;
	      }

	      function addResource(text) {
	        if (_isFrozen) {
	          throw new ContextError('Context is frozen');
	        }
	        _reslinks.push(['text', text]);
	      }

	      function add(text, locale) {
	        var res = new Resource(null, _parser);
	        res.source = text;
	        locale.resources.push(res);
	      }

	      function linkResource(uri) {
	        if (_isFrozen) {
	          throw new ContextError('Context is frozen');
	        }
	        _reslinks.push([typeof uri === 'function' ? 'template' : 'uri', uri]);
	      }

	      function link(uri, locale) {
	        if (!locale.hasResource(uri)) {
	          var res = new Resource(uri, _parser);
	          locale.resources.push(res);
	        }
	      }

	      function registerLocales(defLocale, available) {
	        if (_isFrozen) {
	          throw new ContextError('Context is frozen');
	        }

	        if (defLocale === undefined) {
	          return;
	        }

	        _default = defLocale;
	        _registered = [];

	        if (!available) {
	          available = [];
	        }
	        available.push(defLocale);

	        // uniquify `available` into `_registered`
	        available.forEach(function (loc) {
	          if (typeof loc !== 'string') {
	            throw new ContextError('Language codes must be strings');
	          }
	          if (_registered.indexOf(loc) === -1) {
	            _registered.push(loc);
	          }
	        });
	      }

	      function registerLocaleNegotiator(negotiator) {
	        if (_isFrozen) {
	          throw new ContextError('Context is frozen');
	        }
	        _negotiator = negotiator;
	      }

	      function getLocale(loc) {
	        if (_locales[loc]) {
	          return _locales[loc];
	        }
	        var locale = new Locale(loc, _parser, _compiler, _emitter);
	        _locales[loc] = locale;
	        // populate the locale with resources
	        for (var j = 0; j < _reslinks.length; j++) {
	          var res = _reslinks[j];
	          if (res[0] === 'text') {
	            // a resource added via addResource(String)
	            add(res[1], locale);
	          } else if (res[0] === 'uri') {
	            // a resource added via linkResource(String)
	            link(res[1], locale);
	          } else {
	            // a resource added via linkResource(Function);  the function
	            // passed is a URL template and it takes the current locale's code
	            // as an argument
	            link(res[1](locale.id), locale);
	          }
	        }
	        return locale;
	      }

	      function requestLocales() {
	        if (_isFrozen && !_isReady) {
	          throw new ContextError('Context not ready');
	        }

	        if (_reslinks.length === 0) {
	          warn(new ContextError('Context has no resources; not freezing'));
	          return;
	        }

	        _isFrozen = true;
	        _requested = Array.prototype.slice.call(arguments);

	        if (_requested.length) {
	          _requested.forEach(function (loc) {
	            if (typeof loc !== 'string') {
	              throw new ContextError('Language codes must be strings');
	            }
	          });
	        }

	        // the whole language negotiation process can be asynchronous;  for now
	        // we just use _registered as the list of all available locales, but in
	        // the future we might asynchronously try to query a language pack
	        // service of sorts for its own list of locales supported for this
	        // context
	        if (!_negotiator) {
	          var Intl = require('./intl').Intl;
	          _negotiator = Intl.prioritizeLocales;
	        }
	        var fallbackChain = _negotiator(_registered, _requested, _default, freeze);
	        // if the negotiator returned something, freeze synchronously
	        if (fallbackChain) {
	          freeze(fallbackChain);
	        }
	      }

	      function freeze(fallbackChain) {
	        _fallbackChain = fallbackChain;
	        var locale = getLocale(_fallbackChain[0]);
	        if (locale.isReady) {
	          setReady();
	        } else {
	          locale.build(setReady);
	        }
	      }

	      function setReady() {
	        _isReady = true;
	        _retr.all(_fallbackChain.slice());
	        _emitter.emit('ready');
	      }

	      function addEvent(type, listener) {
	        _emitter.addEventListener(type, listener);
	      }

	      function removeEvent(type, listener) {
	        _emitter.removeEventListener(type, listener);
	      }

	      function warn(e) {
	        _emitter.emit('warning', e);
	        return e;
	      }

	      function error(e) {
	        _emitter.emit('error', e);
	        return e;
	      }
	    }

	    Context.Error = ContextError;
	    Context.RuntimeError = RuntimeError;
	    Context.TranslationError = TranslationError;

	    function ContextError(message) {
	      this.name = 'ContextError';
	      this.message = message;
	    }
	    ContextError.prototype = _Object$create(Error.prototype);
	    ContextError.prototype.constructor = ContextError;

	    function RuntimeError(message, id, supported) {
	      ContextError.call(this, message);
	      this.name = 'RuntimeError';
	      this.entity = id;
	      this.supportedLocales = supported.slice();
	      this.message = id + ': ' + message + '; tried ' + supported.join(', ');
	    }
	    RuntimeError.prototype = _Object$create(ContextError.prototype);
	    RuntimeError.prototype.constructor = RuntimeError;

	    function TranslationError(message, id, supported, locale) {
	      RuntimeError.call(this, message, id, supported);
	      this.name = 'TranslationError';
	      this.locale = locale.id;
	      this.message = '[' + this.locale + '] ' + id + ': ' + message;
	    }
	    TranslationError.prototype = _Object$create(RuntimeError.prototype);
	    TranslationError.prototype.constructor = TranslationError;

	    exports.Context = Context;
	  });
	  define('l20n/events', function (require, exports) {
	    'use strict';

	    function EventEmitter() {
	      this._listeners = {};
	    }

	    EventEmitter.prototype.emit = function ee_emit() {
	      var args = Array.prototype.slice.call(arguments);
	      var type = args.shift();
	      if (!this._listeners[type]) {
	        return false;
	      }
	      var typeListeners = this._listeners[type].slice();
	      for (var i = 0; i < typeListeners.length; i++) {
	        typeListeners[i].apply(this, args);
	      }
	      return true;
	    };

	    EventEmitter.prototype.addEventListener = function ee_add(type, listener) {
	      if (!this._listeners[type]) {
	        this._listeners[type] = [];
	      }
	      this._listeners[type].push(listener);
	      return this;
	    };

	    EventEmitter.prototype.removeEventListener = function ee_rm(type, listener) {
	      var typeListeners = this._listeners[type];
	      var pos = typeListeners.indexOf(listener);
	      if (pos === -1) {
	        return this;
	      }
	      typeListeners.splice(pos, 1);
	      return this;
	    };

	    exports.EventEmitter = EventEmitter;
	  });
	  define('l20n/parser', function (require, exports) {
	    'use strict';

	    var EventEmitter = require('./events').EventEmitter;

	    function Parser(throwOnErrors) {

	      /* Public */

	      this.parse = parse;
	      this.addEventListener = addEvent;
	      this.removeEventListener = removeEvent;

	      /* Private */

	      var MAX_PLACEABLES = 100;

	      var _source, _index, _length, _emitter;

	      var getLOL;
	      if (throwOnErrors) {
	        getLOL = getLOLPlain;
	      } else {
	        _emitter = new EventEmitter();
	        getLOL = getLOLWithRecover;
	      }

	      function getComment() {
	        _index += 2;
	        var start = _index;
	        var end = _source.indexOf('*/', start);
	        if (end === -1) {
	          throw error('Comment without closing tag');
	        }
	        _index = end + 2;
	        return {
	          type: 'Comment',
	          content: _source.slice(start, end)
	        };
	      }

	      function getAttributes() {
	        var attrs = [];
	        var attr, ws1, ch;

	        while (true) {
	          attr = getKVPWithIndex('Attribute');
	          attr.local = attr.key.name.charAt(0) === '_';
	          attrs.push(attr);
	          ws1 = getRequiredWS();
	          ch = _source.charAt(_index);
	          if (ch === '>') {
	            break;
	          } else if (!ws1) {
	            throw error('Expected ">"');
	          }
	        }
	        return attrs;
	      }

	      function getKVP(type) {
	        var key = getIdentifier();
	        getWS();
	        if (_source.charAt(_index) !== ':') {
	          throw error('Expected ":"');
	        }
	        ++_index;
	        getWS();
	        return {
	          type: type,
	          key: key,
	          value: getValue()
	        };
	      }

	      function getKVPWithIndex(type) {
	        var key = getIdentifier();
	        var index = [];

	        if (_source.charAt(_index) === '[') {
	          ++_index;
	          getWS();
	          index = getItemList(getExpression, ']');
	        }
	        getWS();
	        if (_source.charAt(_index) !== ':') {
	          throw error('Expected ":"');
	        }
	        ++_index;
	        getWS();
	        return {
	          type: type,
	          key: key,
	          value: getValue(),
	          index: index
	        };
	      }

	      function getHash() {
	        ++_index;
	        getWS();
	        var defItem,
	            hi,
	            comma,
	            hash = [];
	        var hasDefItem = false;
	        while (true) {
	          defItem = false;
	          if (_source.charAt(_index) === '*') {
	            ++_index;
	            if (hasDefItem) {
	              throw error('Default item redefinition forbidden');
	            }
	            defItem = true;
	            hasDefItem = true;
	          }
	          hi = getKVP('HashItem');
	          hi['default'] = defItem;
	          hash.push(hi);
	          getWS();

	          comma = _source.charAt(_index) === ',';
	          if (comma) {
	            ++_index;
	            getWS();
	          }
	          if (_source.charAt(_index) === '}') {
	            ++_index;
	            break;
	          }
	          if (!comma) {
	            throw error('Expected "}"');
	          }
	        }
	        return {
	          type: 'Hash',
	          content: hash
	        };
	      }

	      function _unescapeString() {
	        var ch = _source.charAt(++_index);
	        var cc;
	        if (ch === 'u') {
	          // special case for unicode
	          var ucode = '';
	          for (var i = 0; i < 4; i++) {
	            ch = _source[++_index];
	            cc = ch.charCodeAt(0);
	            if (cc > 96 && cc < 103 || // a-f
	            cc > 64 && cc < 71 || // A-F
	            cc > 47 && cc < 58) {
	              // 0-9
	              ucode += ch;
	            } else {
	              throw error('Illegal unicode escape sequence');
	            }
	          }
	          return String.fromCharCode(parseInt(ucode, 16));
	        }
	        return ch;
	      }

	      function getComplexString(opchar, opcharLen) {
	        var body = null;
	        var buf = '';
	        var placeables = 0;
	        var ch;

	        _index += opcharLen - 1;

	        var start = _index + 1;

	        walkChars: while (true) {
	          ch = _source.charAt(++_index);
	          switch (ch) {
	            case '\\':
	              buf += _unescapeString();
	              break;
	            case '{':
	              /* We want to go to default unless {{ */
	              /* jshint -W086 */
	              if (_source.charAt(_index + 1) === '{') {
	                if (body === null) {
	                  body = [];
	                }
	                if (placeables > MAX_PLACEABLES - 1) {
	                  throw error('Too many placeables, maximum allowed is ' + MAX_PLACEABLES);
	                }
	                if (buf) {
	                  body.push({
	                    type: 'String',
	                    content: buf
	                  });
	                }
	                _index += 2;
	                getWS();
	                body.push(getExpression());
	                getWS();
	                if (_source.charAt(_index) !== '}' || _source.charAt(_index + 1) !== '}') {
	                  throw error('Expected "}}"');
	                }
	                _index += 1;
	                placeables++;

	                buf = '';
	                break;
	              }
	            default:
	              if (opcharLen === 1) {
	                if (ch === opchar) {
	                  _index++;
	                  break walkChars;
	                }
	              } else {
	                if (ch === opchar[0] && _source.charAt(_index + 1) === ch && _source.charAt(_index + 2) === ch) {
	                  _index += 3;
	                  break walkChars;
	                }
	              }
	              buf += ch;
	              if (_index + 1 >= _length) {
	                throw error('Unclosed string literal');
	              }
	          }
	        }
	        if (body === null) {
	          return {
	            type: 'String',
	            content: buf
	          };
	        }
	        if (buf.length) {
	          body.push({
	            type: 'String',
	            content: buf
	          });
	        }
	        return {
	          type: 'ComplexString',
	          content: body,
	          source: _source.slice(start, _index - opcharLen)
	        };
	      }

	      function getString(opchar, opcharLen) {
	        var opcharPos = _source.indexOf(opchar, _index + opcharLen);
	        var placeablePos, escPos, buf;

	        if (opcharPos === -1) {
	          throw error('Unclosed string literal');
	        }
	        buf = _source.slice(_index + opcharLen, opcharPos);

	        placeablePos = buf.indexOf('{{');
	        if (placeablePos !== -1) {
	          return getComplexString(opchar, opcharLen);
	        } else {
	          escPos = buf.indexOf('\\');
	          if (escPos !== -1) {
	            return getComplexString(opchar, opcharLen);
	          }
	        }

	        _index = opcharPos + opcharLen;

	        return {
	          type: 'String',
	          content: buf
	        };
	      }

	      function getValue(optional, ch) {
	        if (ch === undefined) {
	          ch = _source.charAt(_index);
	        }
	        if (ch === '\'' || ch === '"') {
	          if (ch === _source.charAt(_index + 1) && ch === _source.charAt(_index + 2)) {
	            return getString(ch + ch + ch, 3);
	          }
	          return getString(ch, 1);
	        }
	        if (ch === '{') {
	          return getHash();
	        }
	        if (!optional) {
	          throw error('Unknown value type');
	        }
	        return null;
	      }

	      function getRequiredWS() {
	        var pos = _index;
	        var cc = _source.charCodeAt(pos);
	        // space, \n, \t, \r
	        while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
	          cc = _source.charCodeAt(++_index);
	        }
	        return _index !== pos;
	      }

	      function getWS() {
	        var cc = _source.charCodeAt(_index);
	        // space, \n, \t, \r
	        while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
	          cc = _source.charCodeAt(++_index);
	        }
	      }

	      function getVariable() {
	        ++_index;
	        return {
	          type: 'VariableExpression',
	          id: getIdentifier()
	        };
	      }

	      function getIdentifier() {
	        var index = _index;
	        var start = index;
	        var source = _source;
	        var cc = source.charCodeAt(start);

	        // a-zA-Z_
	        if ((cc < 97 || cc > 122) && (cc < 65 || cc > 90) && cc !== 95) {
	          throw error('Identifier has to start with [a-zA-Z_]');
	        }

	        cc = source.charCodeAt(++index);
	        while (cc >= 97 && cc <= 122 || // a-z
	        cc >= 65 && cc <= 90 || // A-Z
	        cc >= 48 && cc <= 57 || // 0-9
	        cc === 95) {
	          // _
	          cc = source.charCodeAt(++index);
	        }
	        _index = index;
	        return {
	          type: 'Identifier',
	          name: source.slice(start, index)
	        };
	      }

	      function getImportStatement() {
	        _index += 6;
	        if (_source.charAt(_index) !== '(') {
	          throw error('Expected "("');
	        }
	        ++_index;
	        getWS();
	        var uri = getString(_source.charAt(_index), 1);
	        getWS();
	        if (_source.charAt(_index) !== ')') {
	          throw error('Expected ")"');
	        }
	        ++_index;
	        return {
	          type: 'ImportStatement',
	          uri: uri
	        };
	      }

	      function getMacro(id) {
	        if (id.name.charAt(0) === '_') {
	          throw error('Macro ID cannot start with "_"');
	        }
	        ++_index;
	        var idlist = getItemList(getVariable, ')');
	        getRequiredWS();

	        if (_source.charAt(_index) !== '{') {
	          throw error('Expected "{"');
	        }
	        ++_index;
	        getWS();
	        var exp = getExpression();
	        getWS();
	        if (_source.charAt(_index) !== '}') {
	          throw error('Expected "}"');
	        }
	        ++_index;
	        getWS();
	        if (_source.charCodeAt(_index) !== 62) {
	          throw error('Expected ">"');
	        }
	        ++_index;
	        return {
	          type: 'Macro',
	          id: id,
	          args: idlist,
	          expression: exp
	        };
	      }

	      function getEntity(id, index) {
	        if (!getRequiredWS()) {
	          throw error('Expected white space');
	        }

	        var ch = _source.charAt(_index);
	        var value = getValue(true, ch);
	        var attrs = null;
	        if (value === null) {
	          if (ch === '>') {
	            throw error('Expected ">"');
	          }
	          attrs = getAttributes();
	        } else {
	          var ws1 = getRequiredWS();
	          if (_source.charAt(_index) !== '>') {
	            if (!ws1) {
	              throw error('Expected ">"');
	            }
	            attrs = getAttributes();
	          }
	        }

	        // skip '>'
	        ++_index;
	        return {
	          type: 'Entity',
	          id: id,
	          value: value,
	          index: index,
	          attrs: attrs,
	          local: id.name.charCodeAt(0) === 95 // _
	        };
	      }

	      function getEntry() {
	        var cc = _source.charCodeAt(_index);

	        // 60 == '<'
	        if (cc === 60) {
	          ++_index;
	          var id = getIdentifier();
	          cc = _source.charCodeAt(_index);
	          // 40 == '('
	          if (cc === 40) {
	            return getMacro(id);
	          }
	          // 91 == '['
	          if (cc === 91) {
	            ++_index;
	            return getEntity(id, getItemList(getExpression, ']'));
	          }
	          return getEntity(id, null);
	        }
	        // 47, 42 == '/*'
	        if (_source.charCodeAt(_index) === 47 && _source.charCodeAt(_index + 1) === 42) {
	          return getComment();
	        }
	        if (_source.slice(_index, _index + 6) === 'import') {
	          return getImportStatement();
	        }
	        throw error('Invalid entry');
	      }

	      function getLOLWithRecover() {
	        var entries = [];

	        getWS();
	        while (_index < _length) {
	          try {
	            entries.push(getEntry());
	          } catch (e) {
	            if (e instanceof ParserError) {
	              _emitter.emit('error', e);
	              entries.push(recover());
	            } else {
	              throw e;
	            }
	          }
	          if (_index < _length) {
	            getWS();
	          }
	        }

	        return {
	          type: 'LOL',
	          body: entries
	        };
	      }

	      function getLOLPlain() {
	        var entries = [];

	        getWS();
	        while (_index < _length) {
	          entries.push(getEntry());
	          if (_index < _length) {
	            getWS();
	          }
	        }

	        return {
	          type: 'LOL',
	          body: entries
	        };
	      }

	      /* Public API functions */

	      function parse(string) {
	        _source = string;
	        _index = 0;
	        _length = _source.length;

	        return getLOL();
	      }

	      function addEvent(type, listener) {
	        if (!_emitter) {
	          throw new Error('Emitter not available');
	        }
	        return _emitter.addEventListener(type, listener);
	      }

	      function removeEvent(type, listener) {
	        if (!_emitter) {
	          throw new Error('Emitter not available');
	        }
	        return _emitter.removeEventListener(type, listener);
	      }

	      /* Expressions */

	      function getExpression() {
	        return getConditionalExpression();
	      }

	      function getPrefixExpression(token, cl, op, nxt) {
	        var exp = nxt();
	        var t, ch;
	        while (true) {
	          t = '';
	          getWS();
	          ch = _source.charAt(_index);
	          if (token[0].indexOf(ch) === -1) {
	            break;
	          }
	          t += ch;
	          ++_index;
	          if (token.length > 1) {
	            ch = _source.charAt(_index);
	            if (token[1] === ch) {
	              ++_index;
	              t += ch;
	            } else if (token[2]) {
	              --_index;
	              return exp;
	            }
	          }
	          getWS();
	          exp = {
	            type: cl,
	            operator: {
	              type: op,
	              token: t
	            },
	            left: exp,
	            right: nxt()
	          };
	        }
	        return exp;
	      }

	      function getPostfixExpression(token, cl, op, nxt) {
	        var cc = _source.charCodeAt(_index);
	        if (token.indexOf(cc) === -1) {
	          return nxt();
	        }
	        ++_index;
	        getWS();
	        return {
	          type: cl,
	          operator: {
	            type: op,
	            token: String.fromCharCode(cc)
	          },
	          argument: getPostfixExpression(token, cl, op, nxt)
	        };
	      }

	      function getConditionalExpression() {
	        var exp = getOrExpression();
	        getWS();
	        if (_source.charCodeAt(_index) !== 63) {
	          // ?
	          return exp;
	        }
	        ++_index;
	        getWS();
	        var consequent = getExpression();
	        getWS();
	        if (_source.charCodeAt(_index) !== 58) {
	          // :
	          throw error('Expected ":"');
	        }
	        ++_index;
	        getWS();
	        return {
	          type: 'ConditionalExpression',
	          test: exp,
	          consequent: consequent,
	          alternate: getExpression()
	        };
	      }

	      function getOrExpression() {
	        return getPrefixExpression([['|'], '|', true], 'LogicalExpression', 'LogicalOperator', getAndExpression);
	      }

	      function getAndExpression() {
	        return getPrefixExpression([['&'], '&', true], 'LogicalExpression', 'Logicalperator', getEqualityExpression);
	      }

	      function getEqualityExpression() {
	        return getPrefixExpression([['=', '!'], '=', true], 'BinaryExpression', 'BinaryOperator', getRelationalExpression);
	      }

	      function getRelationalExpression() {
	        return getPrefixExpression([['<', '>'], '=', false], 'BinaryExpression', 'BinaryOperator', getAdditiveExpression);
	      }

	      function getAdditiveExpression() {
	        return getPrefixExpression([['+', '-']], 'BinaryExpression', 'BinaryOperator', getModuloExpression);
	      }

	      function getModuloExpression() {
	        return getPrefixExpression([['%']], 'BinaryExpression', 'BinaryOperator', getMultiplicativeExpression);
	      }

	      function getMultiplicativeExpression() {
	        return getPrefixExpression([['*']], 'BinaryExpression', 'BinaryOperator', getDividiveExpression);
	      }

	      function getDividiveExpression() {
	        return getPrefixExpression([['/']], 'BinaryExpression', 'BinaryOperator', getUnaryExpression);
	      }

	      function getUnaryExpression() {
	        return getPostfixExpression([43, 45, 33], // + - !
	        'UnaryExpression', 'UnaryOperator', getMemberExpression);
	      }

	      function getCallExpression(callee) {
	        getWS();
	        return {
	          type: 'CallExpression',
	          callee: callee,
	          arguments: getItemList(getExpression, ')')
	        };
	      }

	      function getAttributeExpression(idref, computed) {
	        if (idref.type !== 'ParenthesisExpression' && idref.type !== 'Identifier' && idref.type !== 'ThisExpression') {
	          throw error('AttributeExpression must have Identifier, This or ' + 'Parenthesis as left node');
	        }
	        var exp;
	        if (computed) {
	          getWS();
	          exp = getExpression();
	          getWS();
	          if (_source.charAt(_index) !== ']') {
	            throw error('Expected "]"');
	          }
	          ++_index;
	          return {
	            type: 'AttributeExpression',
	            expression: idref,
	            attribute: exp,
	            computed: true
	          };
	        }
	        exp = getIdentifier();
	        return {
	          type: 'AttributeExpression',
	          expression: idref,
	          attribute: exp,
	          computed: false
	        };
	      }

	      function getPropertyExpression(idref, computed) {
	        var exp;
	        if (computed) {
	          getWS();
	          exp = getExpression();
	          getWS();
	          if (_source.charAt(_index) !== ']') {
	            throw error('Expected "]"');
	          }
	          ++_index;
	          return {
	            type: 'PropertyExpression',
	            expression: idref,
	            property: exp,
	            computed: true
	          };
	        }
	        exp = getIdentifier();
	        return {
	          type: 'PropertyExpression',
	          expression: idref,
	          property: exp,
	          computed: false
	        };
	      }

	      function getMemberExpression() {
	        var exp = getParenthesisExpression();
	        var cc;

	        // 46: '.'
	        // 40: '('
	        // 58: ':'
	        // 91: '['
	        while (true) {
	          cc = _source.charCodeAt(_index);
	          if (cc === 46 || cc === 91) {
	            // . or [
	            ++_index;
	            exp = getPropertyExpression(exp, cc === 91);
	          } else if (cc === 58 && _source.charCodeAt(_index + 1) === 58) {
	            // ::
	            _index += 2;
	            if (_source.charCodeAt(_index) === 91) {
	              // [
	              ++_index;
	              exp = getAttributeExpression(exp, true);
	            } else {
	              exp = getAttributeExpression(exp, false);
	            }
	          } else if (cc === 40) {
	            // (
	            ++_index;
	            exp = getCallExpression(exp);
	          } else {
	            break;
	          }
	        }
	        return exp;
	      }

	      function getParenthesisExpression() {
	        // 40 == (
	        if (_source.charCodeAt(_index) === 40) {
	          ++_index;
	          getWS();
	          var pexp = {
	            type: 'ParenthesisExpression',
	            expression: getExpression()
	          };
	          getWS();
	          if (_source.charCodeAt(_index) !== 41) {
	            throw error('Expected ")"');
	          }
	          ++_index;
	          return pexp;
	        }
	        return getPrimaryExpression();
	      }

	      function getPrimaryExpression() {
	        var pos = _index;
	        var cc = _source.charCodeAt(pos);
	        // number
	        while (cc > 47 && cc < 58) {
	          cc = _source.charCodeAt(++pos);
	        }
	        if (pos > _index) {
	          var start = _index;
	          _index = pos;
	          return {
	            type: 'Number',
	            value: parseInt(_source.slice(start, pos), 10)
	          };
	        }

	        switch (cc) {
	          // value: '"{[
	          case 39:
	          case 34:
	          case 123:
	          case 91:
	            return getValue();

	          // variable: $
	          case 36:
	            return getVariable();

	          // globals: @
	          case 64:
	            ++_index;
	            return {
	              type: 'GlobalsExpression',
	              id: getIdentifier()
	            };

	          // this: ~
	          case 126:
	            ++_index;
	            return {
	              type: 'ThisExpression'
	            };

	          default:
	            return getIdentifier();
	        }
	      }

	      /* helper functions */

	      function getItemList(callback, closeChar) {
	        var ch;
	        getWS();
	        if (_source.charAt(_index) === closeChar) {
	          ++_index;
	          return [];
	        }

	        var items = [];

	        while (true) {
	          items.push(callback());
	          getWS();
	          ch = _source.charAt(_index);
	          if (ch === ',') {
	            ++_index;
	            getWS();
	          } else if (ch === closeChar) {
	            ++_index;
	            break;
	          } else {
	            throw error('Expected "," or "' + closeChar + '"');
	          }
	        }
	        return items;
	      }

	      function error(message, pos) {
	        if (pos === undefined) {
	          pos = _index;
	        }
	        var start = _source.lastIndexOf('<', pos - 1);
	        var lastClose = _source.lastIndexOf('>', pos - 1);
	        start = lastClose > start ? lastClose + 1 : start;
	        var context = _source.slice(start, pos + 10);

	        var msg = message + ' at pos ' + pos + ': "' + context + '"';
	        return new ParserError(msg, pos, context);
	      }

	      // This code is being called whenever we
	      // hit ParserError.
	      //
	      // The strategy here is to find the closest entry opening
	      // and skip forward to it.
	      //
	      // It may happen that the entry opening is in fact part of expression,
	      // but this should just trigger another ParserError on the next char
	      // and we'll have to scan for entry opening again until we're successful
	      // or we run out of entry openings in the code.
	      function recover() {
	        var opening = _source.indexOf('<', _index);
	        var junk;
	        if (opening === -1) {
	          junk = {
	            'type': 'JunkEntry',
	            'content': _source.slice(_index)
	          };
	          _index = _length;
	          return junk;
	        }
	        junk = {
	          'type': 'JunkEntry',
	          'content': _source.slice(_index, opening)
	        };
	        _index = opening;
	        return junk;
	      }
	    }

	    /* ParserError class */

	    Parser.Error = ParserError;

	    function ParserError(message, pos, context) {
	      this.name = 'ParserError';
	      this.message = message;
	      this.pos = pos;
	      this.context = context;
	    }
	    ParserError.prototype = _Object$create(Error.prototype);
	    ParserError.prototype.constructor = ParserError;

	    exports.Parser = Parser;
	  });
	  // This is L20n's on-the-fly compiler.  It takes the AST produced by the parser
	  // and uses it to create a set of JavaScript objects and functions representing
	  // entities and macros and other expressions.
	  //
	  // The module defines a `Compiler` singleton with a single method: `compile`.
	  // The result of the compilation is stored on the `entries` object passed as
	  // the second argument to the `compile` function.  The third argument is
	  // `globals`, an object whose properties provide information about the runtime
	  // environment, e.g., the current hour, operating system etc.
	  //
	  // Main concepts
	  // -------------
	  //
	  // **Entities** and **attributes** are objects which are publicly available.
	  // Their `toString` method is designed to be used by the L20n context to get
	  // a string value of the entity, given the context data passed to the method.
	  //
	  // All other symbols defined by the grammar are implemented as expression
	  // functions.  The naming convention is:
	  //
	  //   - capitalized first letters denote **expressions constructors**, e.g.
	  //   `PropertyExpression`.
	  //   - camel-case denotes **expression functions** returned by the
	  //   constructors, e.g. `propertyExpression`.
	  //
	  // ### Constructors
	  //
	  // The constructor is called for every node in the AST.  It stores the
	  // components of the expression which are constant and do not depend on the
	  // calling context (an example of the latter would be the data passed by the
	  // developer to the `toString` method).
	  //
	  // ### Expression functions
	  //
	  // The constructor, when called, returns an expression function, which, in
	  // turn, is called every time the expression needs to be evaluated.  The
	  // evaluation call is context-dependend.  Every expression function takes two
	  // mandatory arguments and one optional one:
	  //
	  // - `locals`, which stores the information about the currently evaluated
	  // entity (`locals.__this__`).  It also stores the arguments passed to macros.
	  // - `ctxdata`, which is an object with data passed to the context by the
	  // developer.  The developer can define data on the context, or pass it on
	  // a per-call basis.
	  // - `key` (optional), which is a number or a string passed to a `HashLiteral`
	  // expression denoting the member of the hash to return.  The member will be
	  // another expression function which can then be evaluated further.
	  //
	  //
	  // Bubbling up the new _current_ entity
	  // ------------------------------------
	  //
	  // Every expression function returns an array [`newLocals`, `evaluatedValue`].
	  // The reason for this, and in particular for returning `newLocals`, is
	  // important for understanding how the compiler works.
	  //
	  // In most of the cases. `newLocals` will be the same as the original `locals`
	  // passed to the expression function during the evaluation call.  In some
	  // cases, however, `newLocals.__this__` will reference a different entity than
	  // `locals.__this__` did.  On runtime, as the compiler traverses the AST and
	  // goes deeper into individual branches, when it hits an `identifier` and
	  // evaluates it to an entity, it needs to **bubble up** this find back to the
	  // top expressions in the chain.  This is so that the evaluation of the
	  // top-most expressions in the branch (root being at the very top of the tree)
	  // takes into account the new value of `__this__`.
	  //
	  // To illustrate this point, consider the following example.
	  //
	  // Two entities, `brandName` and `about` are defined as such:
	  //
	  //     <brandName {
	  //       short: "Firefox",
	  //       long: "Mozilla {{ ~ }}"
	  //     }>
	  //     <about "About {{ brandName.long }}">
	  //
	  // Notice two `complexString`s: `about` references `brandName.long`, and
	  // `brandName.long` references its own entity via `~`.  This `~` (meaning, the
	  // current entity) must always reference `brandName`, even when called from
	  // `about`.
	  //
	  // The AST for the `about` entity looks like this:
	  //
	  //     [Entity]
	  //       .id[Identifier]
	  //         .name[unicode "about"]
	  //       .index
	  //       .value[ComplexString]                      <1>
	  //         .content
	  //           [String]                               <2>
	  //             .content[unicode "About "]
	  //           [PropertyExpression]                   <3>
	  //             .expression[Identifier]              <4>
	  //               .name[unicode "brandName"]
	  //             .property[Identifier]
	  //               .name[unicode "long"]
	  //             .computed[bool=False]
	  //       .attrs
	  //       .local[bool=False]
	  //
	  // During the compilation the compiler will walk the AST top-down to the
	  // deepest terminal leaves and will use expression constructors to create
	  // expression functions for the components.  For instance, for `about`'s value,
	  // the compiler will call `ComplexString()` to create an expression function
	  // `complexString` <1> which will be assigned to the entity's value. The
	  // `ComplexString` construtor, before it returns the `complexString` <1>, will
	  // in turn call other expression constructors to create `content`:
	  // a `stringLiteral` and a `propertyExpression`.  The `PropertyExpression`
	  // contructor will do the same, etc...
	  //
	  // When `entity.getString(ctxdata)` is called by a third-party code, we need to
	  // resolve the whole `complexString` <1> to return a single string value.  This
	  // is what **resolving** means and it involves some recursion.  On the other
	  // hand, **evaluating** means _to call the expression once and use what it
	  // returns_.
	  //
	  // The identifier expression sets `locals.__this__` to the current entity,
	  // `about`, and tells the `complexString` <1> to _resolve_ itself.
	  //
	  // In order to resolve the `complexString` <1>, we start by resolving its first
	  // member <2> to a string.  As we resolve deeper down, we bubble down `locals`
	  // set by `toString`.  The first member of `content` turns out to simply be
	  // a string that reads `About `.
	  //
	  // On to the second member, the propertyExpression <3>.  We bubble down
	  // `locals` again and proceed to evaluate the `expression` field, which is an
	  // `identifier`.  Note that we don't _resolve_ it to a string; we _evaluate_ it
	  // to something that can be further used in other expressions, in this case, an
	  // **entity** called `brandName`.
	  //
	  // Had we _resolved_ the `propertyExpression`, it would have resolve to
	  // a string, and it would have been impossible to access the `long` member.
	  // This leads us to an important concept:  the compiler _resolves_ expressions
	  // when it expects a primitive value (a string, a number, a bool).  On the
	  // other hand, it _evaluates_ expressions (calls them only once) when it needs
	  // to work with them further, e.g. in order to access a member of the hash.
	  //
	  // This also explains why in the above example, once the compiler hits the
	  // `brandName` identifier and changes the value of `locals.__this__` to the
	  // `brandName` entity, this value doesn't bubble up all the way up to the
	  // `about` entity.  All components of any `complexString` are _resolved_ by the
	  // compiler until a primitive value is returned.  This logic lives in the
	  // `_resolve` function.

	  define('l20n/compiler', function (require, exports) {
	    // TODO change newcap to true?
	    /* jshint strict: false, newcap: false */
	    var EventEmitter = require('./events').EventEmitter;

	    function Compiler() {

	      // Public

	      this.compile = compile;
	      this.setGlobals = setGlobals;
	      this.addEventListener = addEvent;
	      this.removeEventListener = removeEvent;

	      // Private

	      var MAX_PLACEABLE_LENGTH = 2500;

	      var _emitter = new EventEmitter();
	      var _globals = null;
	      var _references = {
	        globals: {}
	      };

	      var _entryTypes = {
	        Entity: Entity,
	        Macro: Macro
	      };

	      // Public API functions

	      function compile(ast, env) {
	        if (!env) {
	          env = {};
	        }
	        for (var i = 0, entry; entry = ast.body[i]; i++) {
	          var Constructor = _entryTypes[entry.type];
	          if (Constructor) {
	            try {
	              env[entry.id.name] = new Constructor(entry, env);
	            } catch (e) {
	              // rethrow non-compiler errors;
	              requireCompilerError(e);
	              // or, just ignore the error;  it's been already emitted
	            }
	          }
	        }
	        return env;
	      }

	      function setGlobals(globals) {
	        _globals = globals;
	        return true;
	      }

	      function addEvent(type, listener) {
	        return _emitter.addEventListener(type, listener);
	      }

	      function removeEvent(type, listener) {
	        return _emitter.removeEventListener(type, listener);
	      }

	      // utils

	      function emit(Ctor, message, entry, source) {
	        var e = new Ctor(message, entry, source);
	        _emitter.emit('error', e);
	        return e;
	      }

	      // The Entity object.
	      function Entity(node, env) {
	        this.id = node.id.name;
	        this.env = env;
	        this.local = node.local || false;
	        this.index = null;
	        this.attributes = null;
	        this.publicAttributes = null;
	        var i;
	        if (node.index) {
	          this.index = [];
	          for (i = 0; i < node.index.length; i++) {
	            this.index.push(IndexExpression(node.index[i], this));
	          }
	        }
	        if (node.attrs) {
	          this.attributes = {};
	          this.publicAttributes = [];
	          for (i = 0; i < node.attrs.length; i++) {
	            var attr = node.attrs[i];
	            this.attributes[attr.key.name] = new Attribute(attr, this);
	            if (!attr.local) {
	              this.publicAttributes.push(attr.key.name);
	            }
	          }
	        }
	        // Bug 817610 - Optimize a fast path for String entities in the Compiler
	        if (node.value && node.value.type === 'String') {
	          this.value = node.value.content;
	        } else {
	          this.value = LazyExpression(node.value, this, this.index);
	        }
	      }

	      Entity.prototype.getString = function E_getString(ctxdata) {
	        try {
	          var locals = {
	            __this__: this,
	            __env__: this.env
	          };
	          return _resolve(this.value, locals, ctxdata);
	        } catch (e) {
	          requireCompilerError(e);
	          // `ValueErrors` are not emitted in `StringLiteral` where they are
	          // created, because if the string in question is being evaluated in an
	          // index, we'll emit an `IndexError` instead.  To avoid duplication,
	          // `ValueErrors` are only be emitted if they actually make it to
	          // here.  See `IndexExpression` for an example of why they wouldn't.
	          if (e instanceof ValueError) {
	            _emitter.emit('error', e);
	          }
	          throw e;
	        }
	      };

	      Entity.prototype.get = function E_get(ctxdata) {
	        // reset `_references` to an empty state
	        _references.globals = {};
	        // evaluate the entity and its attributes;  if any globals are used in
	        // the process, `toString` will populate `_references.globals`
	        // accordingly.
	        var entity = {
	          value: this.getString(ctxdata),
	          attributes: {}
	        };
	        if (this.publicAttributes) {
	          entity.attributes = {};
	          for (var i = 0, attr; attr = this.publicAttributes[i]; i++) {
	            entity.attributes[attr] = this.attributes[attr].getString(ctxdata);
	          }
	        }
	        entity.globals = _references.globals;
	        return entity;
	      };

	      function Attribute(node, entity) {
	        this.key = node.key.name;
	        this.local = node.local || false;
	        this.index = null;
	        if (node.index) {
	          this.index = [];
	          for (var i = 0; i < node.index.length; i++) {
	            this.index.push(IndexExpression(node.index[i], this));
	          }
	        }
	        if (node.value && node.value.type === 'String') {
	          this.value = node.value.content;
	        } else {
	          this.value = LazyExpression(node.value, entity, this.index);
	        }
	        this.entity = entity;
	      }

	      Attribute.prototype.getString = function A_getString(ctxdata) {
	        try {
	          var locals = {
	            __this__: this.entity,
	            __env__: this.entity.env
	          };
	          return _resolve(this.value, locals, ctxdata);
	        } catch (e) {
	          requireCompilerError(e);
	          if (e instanceof ValueError) {
	            _emitter.emit('error', e);
	          }
	          throw e;
	        }
	      };

	      function Macro(node, env) {
	        this.id = node.id.name;
	        this.env = env;
	        this.local = node.local || false;
	        this.expression = LazyExpression(node.expression, this);
	        this.args = node.args;
	      }
	      Macro.prototype._call = function M_call(args, ctxdata) {
	        var locals = {
	          __this__: this,
	          __env__: this.env
	        };
	        // the number of arguments passed must equal the macro's arity
	        if (this.args.length !== args.length) {
	          throw new RuntimeError(this.id + '() takes exactly ' + this.args.length + ' argument(s) (' + args.length + ' given)');
	        }
	        for (var i = 0; i < this.args.length; i++) {
	          locals[this.args[i].id.name] = args[i];
	        }
	        var final = this.expression(locals, ctxdata);
	        locals = final[0];
	        final = final[1];
	        return [locals, _resolve(final, locals, ctxdata)];
	      };

	      var EXPRESSION_TYPES = {
	        // Primary expressions.
	        'Identifier': Identifier,
	        'ThisExpression': ThisExpression,
	        'VariableExpression': VariableExpression,
	        'GlobalsExpression': GlobalsExpression,

	        // Value expressions.
	        'Number': NumberLiteral,
	        'String': StringLiteral,
	        'Hash': HashLiteral,
	        'HashItem': Expression,
	        'ComplexString': ComplexString,

	        // Logical expressions.
	        'UnaryExpression': UnaryExpression,
	        'BinaryExpression': BinaryExpression,
	        'LogicalExpression': LogicalExpression,
	        'ConditionalExpression': ConditionalExpression,

	        // Member expressions.
	        'CallExpression': CallExpression,
	        'PropertyExpression': PropertyExpression,
	        'AttributeExpression': AttributeExpression,
	        'ParenthesisExpression': ParenthesisExpression
	      };

	      // The 'dispatcher' expression constructor.  Other expression constructors
	      // call this to create expression functions for their components.  For
	      // instance, `ConditionalExpression` calls `Expression` to create
	      // expression functions for its `test`, `consequent` and `alternate`
	      // symbols.
	      function Expression(node, entry, index) {
	        // An entity can have no value.  It will be resolved to `null`.
	        if (!node) {
	          return null;
	        }
	        if (!EXPRESSION_TYPES[node.type]) {
	          throw emit('CompilationError', 'Unknown expression type' + node.type);
	        }
	        if (index) {
	          index = index.slice();
	        }
	        return EXPRESSION_TYPES[node.type](node, entry, index);
	      }

	      function LazyExpression(node, entry, index) {
	        // An entity can have no value.  It will be resolved to `null`.
	        if (!node) {
	          return null;
	        }
	        var expr;
	        return function (locals, ctxdata, prop) {
	          if (!expr) {
	            expr = Expression(node, entry, index);
	          }
	          return expr(locals, ctxdata, prop);
	        };
	      }

	      function _resolve(_x5, _x6, _x7) {
	        var _again2 = true;

	        _function2: while (_again2) {
	          var expr = _x5,
	              locals = _x6,
	              ctxdata = _x7;
	          current = undefined;
	          _again2 = false;

	          // Bail out early if it's a primitive value or `null`.  This is exactly
	          // what we want.
	          if (typeof expr === 'string' || typeof expr === 'boolean' || typeof expr === 'number' || !expr) {
	            return expr;
	          }

	          // Check if `expr` is an Entity or an Attribute
	          if (expr.value !== undefined) {
	            _x5 = expr.value;
	            _x6 = locals;
	            _x7 = ctxdata;
	            _again2 = true;
	            continue _function2;
	          }

	          // Check if `expr` is an expression
	          if (typeof expr === 'function') {
	            var current = expr(locals, ctxdata);
	            locals = current[0];
	            current = current[1];
	            _x5 = current;
	            _x6 = locals;
	            _x7 = ctxdata;
	            _again2 = true;
	            continue _function2;
	          }

	          // Throw if `expr` is a macro
	          if (expr.expression) {
	            throw new RuntimeError('Uncalled macro: ' + expr.id);
	          }

	          // Throw if `expr` is a non-primitive from ctxdata or a global
	          throw new RuntimeError('Cannot resolve ctxdata or global of type ' + typeof expr);
	        }
	      }

	      function Identifier(node) {
	        var name = node.name;
	        return function identifier(locals) {
	          if (!locals.__env__.hasOwnProperty(name)) {
	            throw new RuntimeError('Reference to an unknown entry: ' + name);
	          }
	          // The only thing we care about here is the new `__this__` so we
	          // discard any other local variables.  Note that because this is an
	          // assignment to a local variable, the original `locals` passed is not
	          // changed.
	          locals = {
	            __this__: locals.__env__[name],
	            __env__: locals.__env__
	          };
	          return [locals, locals.__this__];
	        };
	      }
	      function ThisExpression() {
	        return function thisExpression(locals) {
	          return [locals, locals.__this__];
	        };
	      }
	      function VariableExpression(node) {
	        var name = node.id.name;
	        return function variableExpression(locals, ctxdata) {
	          if (locals.hasOwnProperty(name)) {
	            // locals[name] is already a [locals, value] tuple on its own
	            return locals[name];
	          }
	          if (!ctxdata || !ctxdata.hasOwnProperty(name)) {
	            throw new RuntimeError('Reference to an unknown variable: ' + name);
	          }
	          return [locals, ctxdata[name]];
	        };
	      }
	      function GlobalsExpression(node) {
	        var name = node.id.name;
	        return function globalsExpression(locals) {
	          if (!_globals) {
	            throw new RuntimeError('No globals set (tried @' + name + ')');
	          }
	          if (!_globals.hasOwnProperty(name)) {
	            throw new RuntimeError('Reference to an unknown global: ' + name);
	          }
	          var value;
	          try {
	            value = _globals[name].get();
	          } catch (e) {
	            throw new RuntimeError('Cannot evaluate global ' + name);
	          }
	          _references.globals[name] = true;
	          return [locals, value];
	        };
	      }
	      function NumberLiteral(node) {
	        return function numberLiteral(locals) {
	          return [locals, node.value];
	        };
	      }
	      function StringLiteral(node) {
	        return function stringLiteral(locals, ctxdata, key) {
	          // if a key was passed, throw;  checking arguments is more reliable
	          // than testing the value of key because if the key comes from context
	          // data it can be any type, also undefined
	          if (key !== undefined) {
	            throw new RuntimeError('Cannot get property of a string: ' + key);
	          }
	          return [locals, node.content];
	        };
	      }

	      function ComplexString(node, entry) {
	        var content = [];
	        for (var i = 0; i < node.content.length; i++) {
	          content.push(Expression(node.content[i], entry));
	        }

	        // Every complexString needs to have its own `dirty` flag whose state
	        // persists across multiple calls to the given complexString.  On the
	        // other hand, `dirty` must not be shared by all complexStrings.  Hence
	        // the need to define `dirty` as a variable available in the closure.
	        // Note that the anonymous function is a self-invoked one and it returns
	        // the closure immediately.
	        return (function () {
	          var dirty = false;
	          return function complexString(locals, ctxdata, key) {
	            if (key !== undefined) {
	              throw new RuntimeError('Cannot get property of a string: ' + key);
	            }
	            if (dirty) {
	              throw new RuntimeError('Cyclic reference detected');
	            }
	            dirty = true;
	            var parts = [];
	            try {
	              for (var i = 0; i < content.length; i++) {
	                var part = _resolve(content[i], locals, ctxdata);
	                if (typeof part !== 'string' && typeof part !== 'number') {
	                  throw new RuntimeError('Placeables must be strings or ' + 'numbers');
	                }
	                if (part.length > MAX_PLACEABLE_LENGTH) {
	                  throw new RuntimeError('Placeable has too many characters, ' + 'maximum allowed is ' + MAX_PLACEABLE_LENGTH);
	                }
	                parts.push(part);
	              }
	            } catch (e) {
	              requireCompilerError(e);
	              // only throw, don't emit yet.  If the `ValueError` makes it to
	              // `getString()` it will be emitted there.  It might, however, be
	              // cought by `IndexExpression` and changed into a `IndexError`.
	              // See `IndexExpression` for more explanation.
	              throw new ValueError(e.message, entry, node.source);
	            } finally {
	              dirty = false;
	            }
	            return [locals, parts.join('')];
	          };
	        })();
	      }

	      function IndexExpression(node, entry) {
	        var expression = Expression(node, entry);

	        // This is analogous to `ComplexString` in that an individual index can
	        // only be visited once during the resolution of an Entity.  `dirty` is
	        // set in a closure context of the returned function.
	        return (function () {
	          var dirty = false;
	          return function indexExpression(locals, ctxdata) {
	            if (dirty) {
	              throw new RuntimeError('Cyclic reference detected');
	            }
	            dirty = true;
	            var retval;
	            try {
	              // We need to resolve `expression` here so that we catch errors
	              // thrown deep within.  Without `_resolve` we might end up with an
	              // unresolved Entity object, and no "Cyclic reference detected"
	              // error would be thown.
	              retval = _resolve(expression, locals, ctxdata);
	            } catch (e) {
	              // If it's an `IndexError` thrown deeper within `expression`, it
	              // has already been emitted by its `indexExpression`.  We can
	              // safely re-throw it here.
	              if (e instanceof IndexError) {
	                throw e;
	              }

	              // Otherwise, make sure it's a `RuntimeError` or a `ValueError` and
	              // throw and emit an `IndexError`.
	              //
	              // If it's a `ValueError` we want to replace it by an `IndexError`
	              // here so that `ValueErrors` from the index don't make their way
	              // up to the context.  The context only cares about ValueErrors
	              // thrown by the value of the entity it has requested, not entities
	              // used in the index.
	              //
	              // To illustrate this point with an example, consider the following
	              // two strings, where `foo` is a missing entity.
	              //
	              //     <prompt1["remove"] {
	              //       remove: "Remove {{ foo }}?",
	              //       keep: "Keep {{ foo }}?"
	              //     }>
	              //
	              // `prompt1` will throw a `ValueError`.  The context can use it to
	              // display the source of the entity, i.e. `Remove {{ foo }}?`.  The
	              // index resolved properly, so at least we know that we're showing
	              // the right variant of the entity.
	              //
	              //     <prompt2["{{ foo }}"] {
	              //       remove: "Remove file?",
	              //       keep: "Keep file?"
	              //     }>
	              //
	              // On the other hand, `prompt2` will throw an `IndexError`.  This
	              // is a more serious scenario for the context.  We should not
	              // assume that we know which variant to show to the user.  In fact,
	              // in the above (much contrived, but still) example, showing the
	              // incorrect variant will likely lead to data loss.  The context
	              // should be more strict in this case and should not try to recover
	              // from this error too hard.
	              requireCompilerError(e);
	              throw emit(IndexError, e.message, entry);
	            } finally {
	              dirty = false;
	            }
	            return [locals, retval];
	          };
	        })();
	      }

	      function HashLiteral(node, entry, index) {
	        var content = {};
	        // if absent, `defaultKey` and `defaultIndex` are undefined
	        var defaultKey;
	        var defaultIndex = index ? index.shift() : undefined;
	        for (var i = 0; i < node.content.length; i++) {
	          var elem = node.content[i];
	          // use `elem.value` to skip `HashItem` and create the value right away
	          content[elem.key.name] = Expression(elem.value, entry, index);
	          if (elem['default']) {
	            defaultKey = elem.key.name;
	          }
	        }
	        return function hashLiteral(locals, ctxdata, prop) {
	          var keysToTry = [prop, defaultIndex, defaultKey];
	          var keysTried = [];
	          for (var i = 0; i < keysToTry.length; i++) {
	            var key = _resolve(keysToTry[i], locals, ctxdata);
	            if (key === undefined) {
	              continue;
	            }
	            if (typeof key !== 'string') {
	              throw emit(IndexError, 'Index must be a string', entry);
	            }
	            keysTried.push(key);
	            if (content.hasOwnProperty(key)) {
	              return [locals, content[key]];
	            }
	          }

	          // If no valid key was found, throw an `IndexError`
	          var message;
	          if (keysTried.length) {
	            message = 'Hash key lookup failed ' + '(tried "' + keysTried.join('", "') + '").';
	          } else {
	            message = 'Hash key lookup failed.';
	          }
	          throw emit(IndexError, message, entry);
	        };
	      }

	      function UnaryOperator(token, entry) {
	        if (token === '-') return function negativeOperator(argument) {
	          if (typeof argument !== 'number') {
	            throw new RuntimeError('The unary - operator takes a number');
	          }
	          return -argument;
	        };
	        if (token === '+') return function positiveOperator(argument) {
	          if (typeof argument !== 'number') {
	            throw new RuntimeError('The unary + operator takes a number');
	          }
	          return +argument;
	        };
	        if (token === '!') return function notOperator(argument) {
	          if (typeof argument !== 'boolean') {
	            throw new RuntimeError('The ! operator takes a boolean');
	          }
	          return !argument;
	        };
	        throw emit(CompilationError, 'Unknown token: ' + token, entry);
	      }
	      function BinaryOperator(token, entry) {
	        if (token === '==') return function equalOperator(left, right) {
	          if ((typeof left !== 'number' || typeof right !== 'number') && (typeof left !== 'string' || typeof right !== 'string')) {
	            throw new RuntimeError('The == operator takes two numbers or ' + 'two strings');
	          }
	          return left === right;
	        };
	        if (token === '!=') return function notEqualOperator(left, right) {
	          if ((typeof left !== 'number' || typeof right !== 'number') && (typeof left !== 'string' || typeof right !== 'string')) {
	            throw new RuntimeError('The != operator takes two numbers or ' + 'two strings');
	          }
	          return left !== right;
	        };
	        if (token === '<') return function lessThanOperator(left, right) {
	          if (typeof left !== 'number' || typeof right !== 'number') {
	            throw new RuntimeError('The < operator takes two numbers');
	          }
	          return left < right;
	        };
	        if (token === '<=') return function lessThanEqualOperator(left, right) {
	          if (typeof left !== 'number' || typeof right !== 'number') {
	            throw new RuntimeError('The <= operator takes two numbers');
	          }
	          return left <= right;
	        };
	        if (token === '>') return function greaterThanOperator(left, right) {
	          if (typeof left !== 'number' || typeof right !== 'number') {
	            throw new RuntimeError('The > operator takes two numbers');
	          }
	          return left > right;
	        };
	        if (token === '>=') {
	          return function greaterThanEqualOperator(left, right) {
	            if (typeof left !== 'number' || typeof right !== 'number') {
	              throw new RuntimeError('The >= operator takes two numbers');
	            }
	            return left >= right;
	          };
	        }
	        if (token === '+') return function addOperator(left, right) {
	          if ((typeof left !== 'number' || typeof right !== 'number') && (typeof left !== 'string' || typeof right !== 'string')) {
	            throw new RuntimeError('The + operator takes two numbers or ' + 'two strings');
	          }
	          return left + right;
	        };
	        if (token === '-') return function substractOperator(left, right) {
	          if (typeof left !== 'number' || typeof right !== 'number') {
	            throw new RuntimeError('The - operator takes two numbers');
	          }
	          return left - right;
	        };
	        if (token === '*') return function multiplyOperator(left, right) {
	          if (typeof left !== 'number' || typeof right !== 'number') {
	            throw new RuntimeError('The * operator takes two numbers');
	          }
	          return left * right;
	        };
	        if (token === '/') return function devideOperator(left, right) {
	          if (typeof left !== 'number' || typeof right !== 'number') {
	            throw new RuntimeError('The / operator takes two numbers');
	          }
	          if (right === 0) {
	            throw new RuntimeError('Division by zero not allowed.');
	          }
	          return left / right;
	        };
	        if (token === '%') return function moduloOperator(left, right) {
	          if (typeof left !== 'number' || typeof right !== 'number') {
	            throw new RuntimeError('The % operator takes two numbers');
	          }
	          if (right === 0) {
	            throw new RuntimeError('Modulo zero not allowed.');
	          }
	          return left % right;
	        };
	        throw emit(CompilationError, 'Unknown token: ' + token, entry);
	      }
	      function LogicalOperator(token, entry) {
	        if (token === '&&') return function andOperator(left, right) {
	          if (typeof left !== 'boolean' || typeof right !== 'boolean') {
	            throw new RuntimeError('The && operator takes two booleans');
	          }
	          return left && right;
	        };
	        if (token === '||') return function orOperator(left, right) {
	          if (typeof left !== 'boolean' || typeof right !== 'boolean') {
	            throw new RuntimeError('The || operator takes two booleans');
	          }
	          return left || right;
	        };
	        throw emit(CompilationError, 'Unknown token: ' + token, entry);
	      }
	      function UnaryExpression(node, entry) {
	        var operator = UnaryOperator(node.operator.token, entry);
	        var argument = Expression(node.argument, entry);
	        return function unaryExpression(locals, ctxdata) {
	          return [locals, operator(_resolve(argument, locals, ctxdata))];
	        };
	      }
	      function BinaryExpression(node, entry) {
	        var left = Expression(node.left, entry);
	        var operator = BinaryOperator(node.operator.token, entry);
	        var right = Expression(node.right, entry);
	        return function binaryExpression(locals, ctxdata) {
	          return [locals, operator(_resolve(left, locals, ctxdata), _resolve(right, locals, ctxdata))];
	        };
	      }
	      function LogicalExpression(node, entry) {
	        var left = Expression(node.left, entry);
	        var operator = LogicalOperator(node.operator.token, entry);
	        var right = Expression(node.right, entry);
	        return function logicalExpression(locals, ctxdata) {
	          return [locals, operator(_resolve(left, locals, ctxdata), _resolve(right, locals, ctxdata))];
	        };
	      }
	      function ConditionalExpression(node, entry) {
	        var test = Expression(node.test, entry);
	        var consequent = Expression(node.consequent, entry);
	        var alternate = Expression(node.alternate, entry);
	        return function conditionalExpression(locals, ctxdata) {
	          var tested = _resolve(test, locals, ctxdata);
	          if (typeof tested !== 'boolean') {
	            throw new RuntimeError('Conditional expressions must test a ' + 'boolean');
	          }
	          if (tested === true) {
	            return consequent(locals, ctxdata);
	          }
	          return alternate(locals, ctxdata);
	        };
	      }

	      function CallExpression(node, entry) {
	        var callee = Expression(node.callee, entry);
	        var args = [];
	        for (var i = 0; i < node.arguments.length; i++) {
	          args.push(Expression(node.arguments[i], entry));
	        }
	        return function callExpression(locals, ctxdata) {
	          var evaluated_args = [];
	          for (var i = 0; i < args.length; i++) {
	            evaluated_args.push(args[i](locals, ctxdata));
	          }
	          // callee is an expression pointing to a macro, e.g. an identifier
	          var macro = callee(locals, ctxdata);
	          locals = macro[0];
	          macro = macro[1];
	          if (!macro.expression) {
	            throw new RuntimeError('Expected a macro, got a non-callable.');
	          }
	          // Rely entirely on the platform implementation to detect recursion.
	          // `Macro::_call` assigns `evaluated_args` to members of `locals`.
	          return macro._call(evaluated_args, ctxdata);
	        };
	      }
	      function PropertyExpression(node, entry) {
	        var expression = Expression(node.expression, entry);
	        var property = node.computed ? Expression(node.property, entry) : node.property.name;
	        return function propertyExpression(locals, ctxdata) {
	          var prop = _resolve(property, locals, ctxdata);
	          if (typeof prop !== 'string') {
	            throw new RuntimeError('Property name must evaluate to a string: ' + prop);
	          }
	          var parent = expression(locals, ctxdata);
	          locals = parent[0];
	          parent = parent[1];

	          // At this point, `parent` can be anything and we need to do some
	          // type-checking to handle erros gracefully (bug 883664) and securely
	          // (bug 815962).

	          // If `parent` is an Entity or an Attribute, `locals` has been
	          // correctly set up by Identifier
	          if (parent && parent.value !== undefined) {
	            if (typeof parent.value !== 'function') {
	              throw new RuntimeError('Cannot get property of a ' + typeof parent.value + ': ' + prop);
	            }
	            return parent.value(locals, ctxdata, prop);
	          }

	          // If it's a hashLiteral or stringLiteral inside a hash, just call it
	          if (typeof parent === 'function') {
	            return parent(locals, ctxdata, prop);
	          }
	          if (parent && parent.expression) {
	            throw new RuntimeError('Cannot get property of a macro: ' + prop);
	          }

	          // If `parent` is an object passed by the developer to the context
	          // (i.e., `expression` was a `VariableExpression`) or a global, return
	          // the member of the object corresponding to `prop`
	          if (typeof parent === 'object') {
	            if (parent === null) {
	              throw new RuntimeError('Cannot get property of a null: ' + prop);
	            }
	            if (Array.isArray(parent)) {
	              throw new RuntimeError('Cannot get property of an array: ' + prop);
	            }
	            if (!parent.hasOwnProperty(prop)) {
	              throw new RuntimeError(prop + ' is not defined on the object.');
	            }
	            return [locals, parent[prop]];
	          }

	          // otherwise it's a primitive
	          throw new RuntimeError('Cannot get property of a ' + typeof parent + ': ' + prop);
	        };
	      }
	      function AttributeExpression(node, entry) {
	        var expression = Expression(node.expression, entry);
	        var attribute = node.computed ? Expression(node.attribute, entry) : node.attribute.name;
	        return function attributeExpression(locals, ctxdata) {
	          var attr = _resolve(attribute, locals, ctxdata);
	          var entity = expression(locals, ctxdata);
	          locals = entity[0];
	          entity = entity[1];
	          if (!entity.attributes) {
	            throw new RuntimeError('Cannot get attribute of a non-entity: ' + attr);
	          }
	          if (!entity.attributes.hasOwnProperty(attr)) {
	            throw new RuntimeError(entity.id + ' has no attribute ' + attr);
	          }
	          return [locals, entity.attributes[attr]];
	        };
	      }
	      function ParenthesisExpression(node, entry) {
	        return Expression(node.expression, entry);
	      }
	    }

	    Compiler.Error = CompilerError;
	    Compiler.CompilationError = CompilationError;
	    Compiler.RuntimeError = RuntimeError;
	    Compiler.ValueError = ValueError;
	    Compiler.IndexError = IndexError;

	    // `CompilerError` is a general class of errors emitted by the Compiler.
	    function CompilerError(message) {
	      this.name = 'CompilerError';
	      this.message = message;
	    }
	    CompilerError.prototype = _Object$create(Error.prototype);
	    CompilerError.prototype.constructor = CompilerError;

	    // `CompilationError` extends `CompilerError`.  It's a class of errors
	    // which happen during compilation of the AST.
	    function CompilationError(message, entry) {
	      CompilerError.call(this, message);
	      this.name = 'CompilationError';
	      this.entry = entry.id;
	    }
	    CompilationError.prototype = _Object$create(CompilerError.prototype);
	    CompilationError.prototype.constructor = CompilationError;

	    // `RuntimeError` extends `CompilerError`.  It's a class of errors which
	    // happen during the evaluation of entries, i.e. when you call
	    // `entity.toString()`.
	    function RuntimeError(message) {
	      CompilerError.call(this, message);
	      this.name = 'RuntimeError';
	    }
	    RuntimeError.prototype = _Object$create(CompilerError.prototype);
	    RuntimeError.prototype.constructor = RuntimeError;

	    // `ValueError` extends `RuntimeError`.  It's a class of errors which
	    // happen during the composition of a ComplexString value.  It's easier to
	    // recover from than an `IndexError` because at least we know that we're
	    // showing the correct member of the hash.
	    function ValueError(message, entry, source) {
	      RuntimeError.call(this, message);
	      this.name = 'ValueError';
	      this.entry = entry.id;
	      this.source = source;
	    }
	    ValueError.prototype = _Object$create(RuntimeError.prototype);
	    ValueError.prototype.constructor = ValueError;

	    // `IndexError` extends `RuntimeError`.  It's a class of errors which
	    // happen during the lookup of a hash member.  It's harder to recover
	    // from than `ValueError` because we en dup not knowing which variant of the
	    // entity value to show and in case the meanings are divergent, the
	    // consequences for the user can be serious.
	    function IndexError(message, entry) {
	      RuntimeError.call(this, message);
	      this.name = 'IndexError';
	      this.entry = entry.id;
	    }
	    IndexError.prototype = _Object$create(RuntimeError.prototype);
	    IndexError.prototype.constructor = IndexError;

	    function requireCompilerError(e) {
	      if (!(e instanceof CompilerError)) {
	        throw e;
	      }
	    }

	    exports.Compiler = Compiler;
	  });
	  define('l20n/retranslation', function (require, exports) {
	    'use strict';

	    function RetranslationManager() {
	      var _usage = [];
	      var _counter = {};
	      var _callbacks = [];

	      this.bindGet = bindGet;
	      this.unbindGet = unbindGet;
	      this.all = all;
	      this.globals = {};

	      RetranslationManager._constructors.forEach(function (ctor) {
	        initGlobal.call(this, ctor);
	      }, this);

	      function initGlobal(GlobalCtor) {
	        /* jshint validthis: true */
	        var global = new GlobalCtor();
	        this.globals[global.id] = global;
	        if (!global.activate) {
	          return;
	        }
	        _counter[global.id] = 0;
	        global.addEventListener('change', function (id) {
	          for (var i = 0; i < _usage.length; i++) {
	            if (_usage[i] && _usage[i].globals.indexOf(id) !== -1) {
	              // invoke the callback with the reason
	              _usage[i].callback({
	                global: global.id
	              });
	            }
	          }
	        });
	      }

	      function bindGet(get, isRebind) {
	        /* jshint validthis: true */
	        var i;
	        // store the callback in case we want to retranslate the whole context
	        var inCallbacks;
	        for (i = 0; i < _callbacks.length; i++) {
	          if (_callbacks[i].id === get.id) {
	            inCallbacks = true;
	            break;
	          }
	        }
	        if (!inCallbacks) {
	          _callbacks.push(get);
	        } else if (isRebind) {
	          _callbacks[i] = get;
	        }

	        // handle the global usage
	        var bound;
	        for (i = 0; i < _usage.length; i++) {
	          if (_usage[i] && _usage[i].id === get.id) {
	            bound = _usage[i];
	            break;
	          }
	        }

	        var added;
	        if (!bound) {
	          // it's the first time we see this get
	          if (get.globals.length !== 0) {
	            _usage.push(get);
	            get.globals.forEach(function (id) {
	              if (!this.globals[id].activate) {
	                return;
	              }
	              _counter[id]++;
	              this.globals[id].activate();
	            }, this);
	          }
	        } else if (isRebind) {
	          // if we rebinding the callback, don't remove globals
	          // because we're just adding new entities to the bind
	          bound.callback = get.callback;
	          added = get.globals.filter(function (id) {
	            return this.globals[id].activate && bound.globals.indexOf(id) === -1;
	          }, this);
	          added.forEach(function (id) {
	            _counter[id]++;
	            this.globals[id].activate();
	          }, this);
	          bound.globals = bound.globals.concat(added);
	        } else if (get.globals.length === 0) {
	          // after a retranslation, no globals were used; remove the callback
	          delete _usage[i];
	        } else {
	          // see which globals were added and which ones were removed
	          added = get.globals.filter(function (id) {
	            return this.globals[id].activate && bound.globals.indexOf(id) === -1;
	          }, this);
	          added.forEach(function (id) {
	            _counter[id]++;
	            this.globals[id].activate();
	          }, this);
	          var removed = bound.globals.filter(function (id) {
	            return this.globals[id].activate && get.globals.indexOf(id) === -1;
	          }, this);
	          removed.forEach(function (id) {
	            _counter[id]--;
	            if (_counter[id] === 0) {
	              this.globals[id].deactivate();
	            }
	          }, this);
	          bound.globals = get.globals;
	        }
	      }

	      function unbindGet(id) {
	        /* jshint validthis: true */
	        var bound;
	        var usagePos = -1;
	        for (var i = 0; i < _usage.length; i++) {
	          if (_usage[i] && _usage[i].id === id) {
	            bound = _usage[i];
	            usagePos = i;
	            break;
	          }
	        }
	        if (bound) {
	          bound.globals.forEach(function (id) {
	            if (this.globals[id].activate) {
	              _counter[id]--;
	              if (_counter[id] === 0) {
	                this.globals[id].deactivate();
	              }
	            }
	          }, this);
	          _usage.splice(usagePos, 1);
	          for (i = 0; i < _callbacks.length; i++) {
	            if (_callbacks[i].id === id) {
	              _callbacks.splice(i, 1);
	              break;
	            }
	          }
	        }
	      }

	      function all(locales) {
	        for (var i = 0; i < _callbacks.length; i++) {
	          // invoke the callback with the reason
	          _callbacks[i].callback({
	            locales: locales
	          });
	        }
	      }
	    }

	    RetranslationManager._constructors = [];

	    RetranslationManager.registerGlobal = function (ctor) {
	      RetranslationManager._constructors.push(ctor);
	    };

	    RetranslationManager.deregisterGlobal = function (ctor) {
	      var pos = RetranslationManager._constructors.indexOf(ctor);
	      if (pos !== -1) {
	        RetranslationManager._constructors.splice(pos, 1);
	      }
	    };

	    exports.RetranslationManager = RetranslationManager;
	  });
	  define('l20n/platform/globals', function (require, exports) {
	    'use strict';

	    var EventEmitter = require('../events').EventEmitter;
	    var RetranslationManager = require('../retranslation').RetranslationManager;

	    function Global() {
	      this.id = null;
	      this._emitter = new EventEmitter();
	      this.value = null;
	      this.isActive = false;
	    }

	    Global.prototype._get = function _get() {
	      throw new Error('Not implemented');
	    };

	    Global.prototype.get = function get() {
	      // invalidate the cached value if the global is not active;  active
	      // globals handle `value` automatically in `onchange()`
	      if (!this.value || !this.isActive) {
	        this.value = this._get();
	      }
	      return this.value;
	    };

	    Global.prototype.addEventListener = function (type, listener) {
	      if (type !== 'change') {
	        throw 'Unknown event type';
	      }
	      this._emitter.addEventListener(type, listener);
	    };

	    // XXX: https://bugzilla.mozilla.org/show_bug.cgi?id=865226
	    // We want to have @screen.width, but since we can't get it from compiler, we
	    // call it @screen and in order to keep API forward-compatible with 1.0 we
	    // return an object with key width to
	    // make it callable as @screen.width
	    function ScreenGlobal() {
	      Global.call(this);
	      this.id = 'screen';
	      this._get = _get;

	      this.activate = function activate() {
	        if (!this.isActive) {
	          window.addEventListener('resize', onchange);
	          this.isActive = true;
	        }
	      };

	      this.deactivate = function deactivate() {
	        window.removeEventListener('resize', onchange);
	        this.value = null;
	        this.isActive = false;
	      };

	      function _get() {
	        return {
	          width: {
	            px: document.body.clientWidth
	          }
	        };
	      }

	      var self = this;

	      function onchange() {
	        self.value = _get();
	        self._emitter.emit('change', self.id);
	      }
	    }

	    ScreenGlobal.prototype = _Object$create(Global.prototype);
	    ScreenGlobal.prototype.constructor = ScreenGlobal;

	    function OSGlobal() {
	      Global.call(this);
	      this.id = 'os';
	      this.get = get;

	      function get() {
	        if (/^MacIntel/.test(navigator.platform)) {
	          return 'mac';
	        }
	        if (/^Linux/.test(navigator.platform)) {
	          return 'linux';
	        }
	        if (/^Win/.test(navigator.platform)) {
	          return 'win';
	        }
	        return 'unknown';
	      }
	    }

	    OSGlobal.prototype = _Object$create(Global.prototype);
	    OSGlobal.prototype.constructor = OSGlobal;

	    function HourGlobal() {
	      Global.call(this);
	      this.id = 'hour';
	      this._get = _get;

	      this.activate = function activate() {
	        if (!this.isActive) {
	          var time = new Date();
	          I = setTimeout(function () {
	            onchange();
	            I = setInterval(onchange, interval);
	          }, interval - time.getTime() % interval);
	          this.isActive = true;
	        }
	      };

	      this.deactivate = function deactivate() {
	        clearInterval(I);
	        this.value = null;
	        this.isActive = false;
	      };

	      function _get() {
	        var time = new Date();
	        return time.getHours();
	      }

	      var self = this;
	      var interval = 60 * 60 * 1000;
	      var I = null;

	      function onchange() {
	        var time = new Date();
	        if (time.getHours() !== self.value) {
	          self.value = time.getHours();
	          self._emitter.emit('change', self.id);
	        }
	      }
	    }

	    HourGlobal.prototype = _Object$create(Global.prototype);
	    HourGlobal.prototype.constructor = HourGlobal;

	    RetranslationManager.registerGlobal(ScreenGlobal);
	    RetranslationManager.registerGlobal(OSGlobal);
	    RetranslationManager.registerGlobal(HourGlobal);

	    exports.Global = Global;
	  });
	  define('l20n/platform/io', function (require, exports) {
	    'use strict';

	    exports.load = function load(url, callback, sync) {
	      var xhr = new XMLHttpRequest();
	      if (xhr.overrideMimeType) {
	        xhr.overrideMimeType('text/plain');
	      }
	      xhr.onreadystatechange = function () {
	        if (xhr.readyState === 4) {
	          if (xhr.status === 200 || xhr.status === 0) {
	            callback(null, xhr.responseText);
	          } else {
	            var ex = new IOError('Not found: ' + url);
	            callback(ex);
	          }
	        }
	      };
	      xhr.open('GET', url, !sync);
	      xhr.send('');
	    };

	    function IOError(message) {
	      this.name = 'IOError';
	      this.message = message;
	    }
	    IOError.prototype = _Object$create(Error.prototype);
	    IOError.prototype.constructor = IOError;

	    exports.Error = IOError;
	  });
	  define('l20n/intl', function (require, exports, module) {
	    'use strict';

	    if (!String.prototype.startsWith) {
	      Object.defineProperty(String.prototype, 'startsWith', {
	        enumerable: false,
	        configurable: false,
	        writable: false,
	        value: function value(searchString, position) {
	          position = position || 0;
	          return this.indexOf(searchString, position) === position;
	        }
	      });
	    }

	    var unicodeLocaleExtensionSequence = "-u(-[a-z0-9]{2,8})+";
	    var unicodeLocaleExtensionSequenceRE = new RegExp(unicodeLocaleExtensionSequence);
	    var unicodeLocaleExtensionSequenceGlobalRE = new RegExp(unicodeLocaleExtensionSequence, "g");
	    var langTagMappings = {};
	    var langSubtagMappings = {};
	    var extlangMappings = {};

	    /**
	     * Regular expression defining BCP 47 language tags.
	     *
	     * Spec: RFC 5646 section 2.1.
	     */
	    var languageTagRE = (function () {
	      // RFC 5234 section B.1
	      // ALPHA          =  %x41-5A / %x61-7A   ; A-Z / a-z
	      var ALPHA = "[a-zA-Z]";
	      // DIGIT          =  %x30-39
	      //                        ; 0-9
	      var DIGIT = "[0-9]";

	      // RFC 5646 section 2.1
	      // alphanum      = (ALPHA / DIGIT)     ; letters and numbers
	      var alphanum = "(?:" + ALPHA + "|" + DIGIT + ")";
	      // regular       = "art-lojban"        ; these tags match the 'langtag'
	      //               / "cel-gaulish"       ; production, but their subtags
	      //               / "no-bok"            ; are not extended language
	      //               / "no-nyn"            ; or variant subtags: their meaning
	      //               / "zh-guoyu"          ; is defined by their registration
	      //               / "zh-hakka"          ; and all of these are deprecated
	      //               / "zh-min"            ; in favor of a more modern
	      //               / "zh-min-nan"        ; subtag or sequence of subtags
	      //               / "zh-xiang"
	      var regular = "(?:art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)";
	      // irregular     = "en-GB-oed"         ; irregular tags do not match
	      //                / "i-ami"             ; the 'langtag' production and
	      //                / "i-bnn"             ; would not otherwise be
	      //                / "i-default"         ; considered 'well-formed'
	      //                / "i-enochian"        ; These tags are all valid,
	      //                / "i-hak"             ; but most are deprecated
	      //                / "i-klingon"         ; in favor of more modern
	      //                / "i-lux"             ; subtags or subtag
	      //                / "i-mingo"           ; combination
	      //                / "i-navajo"
	      //                / "i-pwn"
	      //                / "i-tao"
	      //                / "i-tay"
	      //                / "i-tsu"
	      //                / "sgn-BE-FR"
	      //                / "sgn-BE-NL"
	      //                / "sgn-CH-DE"
	      var irregular = "(?:en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)";
	      // grandfathered = irregular           ; non-redundant tags registered
	      //               / regular             ; during the RFC 3066 era
	      var grandfathered = "(?:" + irregular + "|" + regular + ")";
	      // privateuse    = "x" 1*("-" (1*8alphanum))
	      var privateuse = "(?:x(?:-[a-z0-9]{1,8})+)";
	      // singleton     = DIGIT               ; 0 - 9
	      //               / %x41-57             ; A - W
	      //               / %x59-5A             ; Y - Z
	      //               / %x61-77             ; a - w
	      //               / %x79-7A             ; y - z
	      var singleton = "(?:" + DIGIT + "|[A-WY-Za-wy-z])";
	      // extension     = singleton 1*("-" (2*8alphanum))
	      var extension = "(?:" + singleton + "(?:-" + alphanum + "{2,8})+)";
	      // variant       = 5*8alphanum         ; registered variants
	      //               / (DIGIT 3alphanum)
	      var variant = "(?:" + alphanum + "{5,8}|(?:" + DIGIT + alphanum + "{3}))";
	      // region        = 2ALPHA              ; ISO 3166-1 code
	      //               / 3DIGIT              ; UN M.49 code
	      var region = "(?:" + ALPHA + "{2}|" + DIGIT + "{3})";
	      // script        = 4ALPHA              ; ISO 15924 code
	      var script = "(?:" + ALPHA + "{4})";
	      // extlang       = 3ALPHA              ; selected ISO 639 codes
	      //                 *2("-" 3ALPHA)      ; permanently reserved
	      var extlang = "(?:" + ALPHA + "{3}(?:-" + ALPHA + "{3}){0,2})";
	      // language      = 2*3ALPHA            ; shortest ISO 639 code
	      //                 ["-" extlang]       ; sometimes followed by
	      //                                     ; extended language subtags
	      //               / 4ALPHA              ; or reserved for future use
	      //               / 5*8ALPHA            ; or registered language subtag
	      var language = "(?:" + ALPHA + "{2,3}(?:-" + extlang + ")?|" + ALPHA + "{4}|" + ALPHA + "{5,8})";
	      // langtag       = language
	      //                 ["-" script]
	      //                 ["-" region]
	      //                 *("-" variant)
	      //                 *("-" extension)
	      //                 ["-" privateuse]
	      var langtag = language + "(?:-" + script + ")?(?:-" + region + ")?(?:-" + variant + ")*(?:-" + extension + ")*(?:-" + privateuse + ")?";
	      // Language-Tag  = langtag             ; normal language tags
	      //               / privateuse          ; private use tag
	      //               / grandfathered       ; grandfathered tags
	      var languageTag = "^(?:" + langtag + "|" + privateuse + "|" + grandfathered + ")$";

	      // Language tags are case insensitive (RFC 5646 section 2.1.1).
	      return new RegExp(languageTag, "i");
	    })();

	    var duplicateVariantRE = (function () {
	      // RFC 5234 section B.1
	      // ALPHA          =  %x41-5A / %x61-7A   ; A-Z / a-z
	      var ALPHA = "[a-zA-Z]";
	      // DIGIT          =  %x30-39
	      //                        ; 0-9
	      var DIGIT = "[0-9]";

	      // RFC 5646 section 2.1
	      // alphanum      = (ALPHA / DIGIT)     ; letters and numbers
	      var alphanum = "(?:" + ALPHA + "|" + DIGIT + ")";
	      // variant       = 5*8alphanum         ; registered variants
	      //               / (DIGIT 3alphanum)
	      var variant = "(?:" + alphanum + "{5,8}|(?:" + DIGIT + alphanum + "{3}))";

	      // Match a langtag that contains a duplicate variant.
	      var duplicateVariant =
	      // Match everything in a langtag prior to any variants, and maybe some
	      // of the variants as well (which makes this pattern inefficient but
	      // not wrong, for our purposes);
	      "(?:" + alphanum + "{2,8}-)+" +
	      // a variant, parenthesised so that we can refer back to it later;
	      "(" + variant + ")-" +
	      // zero or more subtags at least two characters long (thus stopping
	      // before extension and privateuse components);
	      "(?:" + alphanum + "{2,8}-)*" +
	      // and the same variant again
	      "\\1" +
	      // ...but not followed by any characters that would turn it into a
	      // different subtag.
	      "(?!" + alphanum + ")";

	      // Language tags are case insensitive (RFC 5646 section 2.1.1), but for
	      // this regular expression that's covered by having its character classes
	      // list both upper- and lower-case characters.
	      return new RegExp(duplicateVariant);
	    })();

	    var duplicateSingletonRE = (function () {
	      // RFC 5234 section B.1
	      // ALPHA          =  %x41-5A / %x61-7A   ; A-Z / a-z
	      var ALPHA = "[a-zA-Z]";
	      // DIGIT          =  %x30-39
	      //                        ; 0-9
	      var DIGIT = "[0-9]";

	      // RFC 5646 section 2.1
	      // alphanum      = (ALPHA / DIGIT)     ; letters and numbers
	      var alphanum = "(?:" + ALPHA + "|" + DIGIT + ")";
	      // singleton     = DIGIT               ; 0 - 9
	      //               / %x41-57             ; A - W
	      //               / %x59-5A             ; Y - Z
	      //               / %x61-77             ; a - w
	      //               / %x79-7A             ; y - z
	      var singleton = "(?:" + DIGIT + "|[A-WY-Za-wy-z])";

	      // Match a langtag that contains a duplicate singleton.
	      var duplicateSingleton =
	      // Match a singleton subtag, parenthesised so that we can refer back to
	      // it later;
	      "-(" + singleton + ")-" +
	      // then zero or more subtags;
	      "(?:" + alphanum + "+-)*" +
	      // and the same singleton again
	      "\\1" +
	      // ...but not followed by any characters that would turn it into a
	      // different subtag.
	      "(?!" + alphanum + ")";

	      // Language tags are case insensitive (RFC 5646 section 2.1.1), but for
	      // this regular expression that's covered by having its character classes
	      // list both upper- and lower-case characters.
	      return new RegExp(duplicateSingleton);
	    })();

	    /**
	     * Verifies that the given string is a well-formed BCP 47 language tag
	     * with no duplicate variant or singleton subtags.
	     *
	     * Spec: ECMAScript Internationalization API Specification, 6.2.2.
	     */
	    function IsStructurallyValidLanguageTag(locale) {
	      if (!languageTagRE.test(locale)) return false;

	      // Before checking for duplicate variant or singleton subtags with
	      // regular expressions, we have to get private use subtag sequences
	      // out of the picture.
	      if (locale.startsWith("x-")) return true;
	      var pos = locale.indexOf("-x-");
	      if (pos !== -1) locale = locale.substring(0, pos);

	      // Check for duplicate variant or singleton subtags.
	      return !duplicateVariantRE.test(locale) && !duplicateSingletonRE.test(locale);
	    }

	    /**
	     * Canonicalizes the given structurally valid BCP 47 language tag, including
	     * regularized case of subtags. For example, the language tag
	     * Zh-NAN-haNS-bu-variant2-Variant1-u-ca-chinese-t-Zh-laTN-x-PRIVATE, where
	     *
	     *     Zh             ; 2*3ALPHA
	     *     -NAN           ; ["-" extlang]
	     *     -haNS          ; ["-" script]
	     *     -bu            ; ["-" region]
	     *     -variant2      ; *("-" variant)
	     *     -Variant1
	     *     -u-ca-chinese  ; *("-" extension)
	     *     -t-Zh-laTN
	     *     -x-PRIVATE     ; ["-" privateuse]
	     *
	     * becomes nan-Hans-mm-variant2-variant1-t-zh-latn-u-ca-chinese-x-private
	     *
	     * Spec: ECMAScript Internationalization API Specification, 6.2.3.
	     * Spec: RFC 5646, section 4.5.
	     */
	    function CanonicalizeLanguageTag(locale) {
	      // The input
	      // "Zh-NAN-haNS-bu-variant2-Variant1-u-ca-chinese-t-Zh-laTN-x-PRIVATE"
	      // will be used throughout this method to illustrate how it works.

	      // Language tags are compared and processed case-insensitively, so
	      // technically it's not necessary to adjust case. But for easier processing,
	      // and because the canonical form for most subtags is lower case, we start
	      // with lower case for all.
	      // "Zh-NAN-haNS-bu-variant2-Variant1-u-ca-chinese-t-Zh-laTN-x-PRIVATE" ->
	      // "zh-nan-hans-bu-variant2-variant1-u-ca-chinese-t-zh-latn-x-private"
	      locale = locale.toLowerCase();

	      // Handle mappings for complete tags.
	      if (langTagMappings && langTagMappings.hasOwnProperty(locale)) return langTagMappings[locale];

	      var subtags = locale.split("-");
	      var i = 0;

	      // Handle the standard part: All subtags before the first singleton or "x".
	      // "zh-nan-hans-bu-variant2-variant1"
	      while (i < subtags.length) {
	        var subtag = subtags[i];

	        // If we reach the start of an extension sequence or private use part,
	        // we're done with this loop. We have to check for i > 0 because for
	        // irregular language tags, such as i-klingon, the single-character
	        // subtag "i" is not the start of an extension sequence.
	        // In the example, we break at "u".
	        if (subtag.length === 1 && (i > 0 || subtag === "x")) break;

	        if (subtag.length === 4) {
	          // 4-character subtags are script codes; their first character
	          // needs to be capitalized. "hans" -> "Hans"
	          subtag = subtag[0].toUpperCase() + subtag.substring(1);
	        } else if (i !== 0 && subtag.length === 2) {
	          // 2-character subtags that are not in initial position are region
	          // codes; they need to be upper case. "bu" -> "BU"
	          subtag = subtag.toUpperCase();
	        }
	        if (langSubtagMappings.hasOwnProperty(subtag)) {
	          // Replace deprecated subtags with their preferred values.
	          // "BU" -> "MM"
	          // This has to come after we capitalize region codes because
	          // otherwise some language and region codes could be confused.
	          // For example, "in" is an obsolete language code for Indonesian,
	          // but "IN" is the country code for India.
	          // Note that the script generating langSubtagMappings makes sure
	          // that no regular subtag mapping will replace an extlang code.
	          subtag = langSubtagMappings[subtag];
	        } else if (extlangMappings.hasOwnProperty(subtag)) {
	          // Replace deprecated extlang subtags with their preferred values,
	          // and remove the preceding subtag if it's a redundant prefix.
	          // "zh-nan" -> "nan"
	          // Note that the script generating extlangMappings makes sure that
	          // no extlang mapping will replace a normal language code.
	          subtag = extlangMappings[subtag].preferred;
	          if (i === 1 && extlangMappings[subtag].prefix === subtags[0]) {
	            subtags.shift();
	            i--;
	          }
	        }
	        subtags[i] = subtag;
	        i++;
	      }
	      var normal = subtags.slice(0, i).join("-");

	      // Extension sequences are sorted by their singleton characters.
	      // "u-ca-chinese-t-zh-latn" -> "t-zh-latn-u-ca-chinese"
	      var extensions = [];
	      while (i < subtags.length && subtags[i] !== "x") {
	        var extensionStart = i;
	        i++;
	        while (i < subtags.length && subtags[i].length > 1) i++;
	        var extension = sybtags.slice(extensionStart, i).join("-");
	        extensions.push(extension);
	      }
	      extensions.sort();

	      // Private use sequences are left as is. "x-private"
	      var privateUse = "";
	      if (i < subtags.length) privateUse = subtags.slice(i).join("-");

	      // Put everything back together.
	      var canonical = normal;
	      if (extensions.length > 0) canonical += "-" + extensions.join("-");
	      if (privateUse.length > 0) {
	        // Be careful of a Language-Tag that is entirely privateuse.
	        if (canonical.length > 0) canonical += "-" + privateUse;else canonical = privateUse;
	      }

	      return canonical;
	    }

	    /**
	     * Canonicalizes a locale list.
	     *
	     * Spec: ECMAScript Internationalization API Specification, 9.2.1.
	     */
	    function CanonicalizeLocaleList(locales) {
	      if (locales === undefined) return [];
	      var seen = [];
	      if (typeof locales === "string") locales = [locales];
	      var O = locales;
	      var len = O.length;
	      var k = 0;
	      while (k < len) {
	        // Don't call ToString(k) - SpiderMonkey is faster with integers.
	        var kPresent = (k in O);
	        if (kPresent) {
	          var kValue = O[k];
	          if (!(typeof kValue === "string" || typeof kValue === "object")) ThrowError(JSMSG_INVALID_LOCALES_ELEMENT);
	          var tag = kValue;
	          if (!IsStructurallyValidLanguageTag(tag)) ThrowError(JSMSG_INVALID_LANGUAGE_TAG, tag);
	          tag = CanonicalizeLanguageTag(tag);
	          if (seen.indexOf(tag) === -1) seen.push(tag);
	        }
	        k++;
	      }
	      return seen;
	    }

	    /**
	     * Compares a BCP 47 language tag against the locales in availableLocales
	     * and returns the best available match. Uses the fallback
	     * mechanism of RFC 4647, section 3.4.
	     *
	     * Spec: ECMAScript Internationalization API Specification, 9.2.2.
	     * Spec: RFC 4647, section 3.4.
	     */
	    function BestAvailableLocale(availableLocales, locale) {
	      var candidate = locale;
	      while (true) {
	        if (availableLocales.indexOf(candidate) !== -1) return candidate;
	        var pos = candidate.lastIndexOf('-');
	        if (pos === -1) return undefined;
	        if (pos >= 2 && candidate[pos - 2] === "-") pos -= 2;
	        candidate = candidate.substring(0, pos);
	      }
	    }

	    /**
	     * Returns the subset of availableLocales for which requestedLocales has a
	     * matching (possibly fallback) locale. Locales appear in the same order in the
	     * returned list as in the input list.
	     *
	     * This function is a slight modification of the LookupSupprtedLocales algorithm
	     * The difference is in step 4d where instead of adding requested locale,
	     * we're adding availableLocale to the subset.
	     *
	     * This allows us to directly use returned subset to pool resources.
	     *
	     * Spec: ECMAScript Internationalization API Specification, 9.2.6.
	     */
	    function LookupAvailableLocales(availableLocales, requestedLocales) {
	      // Steps 1-2.
	      var len = requestedLocales.length;
	      var subset = [];

	      // Steps 3-4.
	      var k = 0;
	      while (k < len) {
	        // Steps 4.a-b.
	        var locale = requestedLocales[k];
	        var noExtensionsLocale = locale.replace(unicodeLocaleExtensionSequenceGlobalRE, "");

	        // Step 4.c-d.
	        var availableLocale = BestAvailableLocale(availableLocales, noExtensionsLocale);
	        if (availableLocale !== undefined)
	          // in LookupSupportedLocales it pushes locale here
	          subset.push(availableLocale);

	        // Step 4.e.
	        k++;
	      }

	      // Steps 5-6.
	      return subset.slice(0);
	    }

	    function PrioritizeLocales(availableLocales, requestedLocales, defaultLocale) {
	      availableLocales = CanonicalizeLocaleList(availableLocales);
	      requestedLocales = CanonicalizeLocaleList(requestedLocales);

	      var result = LookupAvailableLocales(availableLocales, requestedLocales);
	      if (!defaultLocale) {
	        return result;
	      }

	      // if default locale is not present in result,
	      // add it to the end of fallback chain
	      defaultLocale = CanonicalizeLanguageTag(defaultLocale);
	      if (result.indexOf(defaultLocale) === -1) {
	        result.push(defaultLocale);
	      }
	      return result;
	    }

	    exports.Intl = {
	      prioritizeLocales: PrioritizeLocales
	    };
	  });
	  // attach the L20n singleton to the global object
	  window.L20n = require('l20n');

	  // close the function defined in build/prefix/microrequire.js
	})(window);

	var ctx = L20n.getContext();

	var Entities = {
	  ready: false,
	  entities: {},
	  registerEntity: function registerEntity(entity) {
	    if (Entities.hasOwnProperty(entity)) {
	      if (!Entities.ready) return;
	      ReactBootstrap.Dispatcher.emit('ctx:' + entity);
	      return;
	    }
	    ctx.localize([entity], function (l) {
	      ReactBootstrap.Dispatcher.emit('ctx:' + entity);
	    });
	    Entities[entity] = 1;
	  }
	};

	var _initializeLocales = function _initializeLocales(appname, locales, rpath) {
	  rpath = rpath || '';
	  ctx.ready(function () {
	    Entities.ready = true;
	    for (var i in Entities.entities) {
	      Entities.registerEntity(Entities.entities[i]);
	    }
	    ReactBootstrap.Dispatcher.emit('ctx:ready');
	  });
	  ctx.linkResource(function (locale) {
	    return rpath + '/locales/' + appname + '/' + locale + '/strings.l20n';
	  });
	  ctx.registerLocales(locales['default'], locales.locales);
	  ctx.requestLocales(locales['default']);
	};

	global.Entity = React.createClass({
	  displayName: 'Entity',

	  propTypes: {
	    data: React.PropTypes.object,
	    entity: React.PropTypes.string,
	    dangerouslySetInnerHTML: React.PropTypes.bool
	  },
	  getDefaultProps: function getDefaultProps() {
	    return {
	      componentClass: 'span',
	      componentAttribute: ''
	    };
	  },
	  getInitialState: function getInitialState() {
	    return {
	      entity: ''
	    };
	  },
	  handler: function handler() {
	    this.setState({
	      entity: ctx.getSync(this.props.entity, this.props.data)
	    });
	  },
	  componentDidMount: function componentDidMount() {
	    ReactBootstrap.Dispatcher.on('ctx:' + this.props.entity, this.handler);
	    Entities.registerEntity(this.props.entity);
	  },
	  componentWillUnmount: function componentWillUnmount() {
	    ReactBootstrap.Dispatcher.off('ctx:' + this.props.entity, this.handler);
	  },
	  render: function render() {
	    var ComponentClass = this.props.componentClass;
	    var componentAttribute = this.props.componentAttribute;

	    var props = _extends({}, this.props, {
	      data: null,
	      entity: null
	    });

	    if (ComponentClass.length && componentAttribute.length) {
	      props[componentAttribute] = this.state.entity;

	      return React.createElement(ComponentClass, props);
	    }

	    if (ComponentClass === 'input') {
	      return React.createElement(ComponentClass, _extends({}, props, { value: this.state.entity }));
	    }
	    if (this.props.dangerouslySetInnerHTML) {
	      return React.createElement(ComponentClass, _extends({}, props, { dangerouslySetInnerHTML: { __html: this.state.entity } }));
	    }
	    return React.createElement(
	      ComponentClass,
	      props,
	      this.state.entity
	    );
	  }
	});

	module.exports = {
	  ctx: ctx,
	  initializeLocales: function initializeLocales(appname, locales, rpath) {
	    _initializeLocales(appname, locales, rpath);
	  },
	  ready: function ready() {
	    if (Entities.ready) {
	      ReactBootstrap.Dispatcher.emit('ctx:ready');
	      return;
	    }
	  },
	  changeLocale: function changeLocale(locale) {
	    ctx.requestLocales(locale);
	  },
	  Entity: global.Entity
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Object$assign = __webpack_require__(3)["default"];

	exports["default"] = _Object$assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	exports.__esModule = true;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(4), __esModule: true };

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	module.exports = __webpack_require__(8).Object.assign;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $def = __webpack_require__(6);

	$def($def.S + $def.F, 'Object', {assign: __webpack_require__(9)});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(7)
	  , core      = __webpack_require__(8)
	  , PROTOTYPE = 'prototype';
	var ctx = function(fn, that){
	  return function(){
	    return fn.apply(that, arguments);
	  };
	};
	var $def = function(type, name, source){
	  var key, own, out, exp
	    , isGlobal = type & $def.G
	    , isProto  = type & $def.P
	    , target   = isGlobal ? global : type & $def.S
	        ? global[name] : (global[name] || {})[PROTOTYPE]
	    , exports  = isGlobal ? core : core[name] || (core[name] = {});
	  if(isGlobal)source = name;
	  for(key in source){
	    // contains in native
	    own = !(type & $def.F) && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    if(isGlobal && typeof target[key] != 'function')exp = source[key];
	    // bind timers to global for call from export context
	    else if(type & $def.B && own)exp = ctx(out, global);
	    // wrap global constructors for prevent change them in library
	    else if(type & $def.W && target[key] == out)!function(C){
	      exp = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      exp[PROTOTYPE] = C[PROTOTYPE];
	    }(out);
	    else exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export
	    exports[key] = exp;
	    if(isProto)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	// type bitmap
	$def.F = 1;  // forced
	$def.G = 2;  // global
	$def.S = 4;  // static
	$def.P = 8;  // proto
	$def.B = 16; // bind
	$def.W = 32; // wrap
	module.exports = $def;

/***/ },
/* 7 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var UNDEFINED = 'undefined';
	var global = module.exports = typeof window != UNDEFINED && window.Math == Math
	  ? window : typeof self != UNDEFINED && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 8 */
/***/ function(module, exports) {

	var core = module.exports = {};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.1 Object.assign(target, source, ...)
	var toObject = __webpack_require__(10)
	  , IObject  = __webpack_require__(12)
	  , enumKeys = __webpack_require__(14);

	module.exports = __webpack_require__(16)(function(){
	  return Symbol() in Object.assign({}); // Object.assign available and Symbol is native
	}) ? function assign(target, source){   // eslint-disable-line no-unused-vars
	  var T = toObject(target)
	    , l = arguments.length
	    , i = 1;
	  while(l > i){
	    var S      = IObject(arguments[i++])
	      , keys   = enumKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)T[key = keys[j++]] = S[key];
	  }
	  return T;
	} : Object.assign;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(11);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// indexed object, fallback for non-array-like ES3 strings
	var cof = __webpack_require__(13);
	module.exports = 0 in Object('z') ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var $ = __webpack_require__(15);
	module.exports = function(it){
	  var keys       = $.getKeys(it)
	    , getSymbols = $.getSymbols;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = $.isEnum
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))keys.push(key);
	  }
	  return keys;
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(18), __esModule: true };

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(19);
	module.exports = __webpack_require__(8).Object.keys;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(10);

	__webpack_require__(20)('keys', function($keys){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	module.exports = function(KEY, exec){
	  var $def = __webpack_require__(6)
	    , fn   = (__webpack_require__(8).Object || {})[KEY] || Object[KEY]
	    , exp  = {};
	  exp[KEY] = exec(fn);
	  $def($def.S + $def.F * __webpack_require__(16)(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(22), __esModule: true };

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(15);
	module.exports = function create(P, D){
	  return $.create(P, D);
	};

/***/ }
/******/ ]);