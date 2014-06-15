(function(global) {
    //-------------------------------------------------------------------------------
    var globalHook = 'logger';
    var defaultGlobalLevel = 'debug';
    //-------------------------------------------------------------------------------

    var globalLevel;
    var enabled = localStorage.getItem('loggerEnabled');
    
    function addHooks() {
        enabled = true;
        Object.defineProperty(window, '__stack', {
            get: function(){
                var orig = Error.prepareStackTrace;
                Error.prepareStackTrace = function(_, stack){ return stack; };
                var err = new Error;
                Error.captureStackTrace(err, arguments.callee);
                var stack = err.stack;
                Error.prepareStackTrace = orig;
                return stack;
            },
            configurable:true
        });

        Object.defineProperty(window, '__line', {
            get: function(){
                var origin = __stack[3];
                var name = '';
                if (origin.fun) {
                    name = origin.fun.name + '|';
                }
                return name + origin.getLineNumber();
            },
            configurable: true
        });

    }

    function removeHooks() {
        enabled = false;
        delete global.__line;
        Object.defineProperty(window, '__line', {
            get: function(){
                return '';
            },
            configurable: true
        });
        delete global.__stack;
    }

    var lastEvent = 0;
    //returns a timestamp in ms without arguments,
    var timeStamp = (function () {
        var bootstart = new Date();
        var lastEvent = bootstart;
        return function () {
            var event = new Date();
            var elapsed = event - lastEvent;
            lastEvent = event;
            if (elapsed < 2000) return '+' + humanize(elapsed);
            return humanize(event - bootstart);
        };
    })();
    
    var levels = ['none', 'error', 'warn', 'info', 'debug'];
    function getMaxLevel(name) {
        return localStorage.getItem('__logger__' + name) || 'none';
    }
        

    function print(name, level, args) {
        var maxLevel = getMaxLevel(name);
        maxLevel = levels.indexOf(maxLevel);
        if (!maxLevel) return;
        args = Array.prototype.slice.call(args);
        var timeStampStr =  loggers._showTimeStamp ? '(' + timeStamp() + ')' : '';
        var out = ['%c' + timeStampStr + name + __line + '>', 'color:grey;'];
        out = out.concat(args);
        var post = '';
        out.push(post);
        if (level <= globalLevel && level <= maxLevel)
            console[levels[level]].apply(console, out);
    }

    function setLevel(name, level) {
        // var l = levels.indexOf(level);
        if (levels.indexOf(level) === -1) {
            console.warn("logger.setLevel: level should be one of 'none', 'error', 'warn', 'info' or 'debug' not:",
                         level);
            return;
        }
        localStorage.setItem('__logger__' + name, level);
    }

    function getLogger(ns, names) {
        var name = ns;
        var logger = loggers[name] || (loggers[name] = getLoggerSingle(name || ''));   
        logger._all = {
            disable: function() {
                logger._disable();
                logger._list().forEach(function(name) {
                    logger[name]._disable();
                });
            },
            enable: function() {
                logger._enable();
                logger._list().forEach(function(name) {
                    logger[name]._enable();
                });
            }
        }
        if (names && names.length){
            names.forEach(function(name) {
                logger[name] = getLoggerSingle(ns + '[' + name + ']');
            });
        }
        return logger;
    }
    
    function disable() { this._setLevel('none'); };
    
    function enable() {
        this._setLevel(levels[globalLevel]);
        loggers._on();
    };
    
    function list() {
        return Object.keys(this).filter(function(k) {
            return k.indexOf('_') !== 0;     
        });
    }
    
    function getLoggerSingle(name) {
        var logger = enabled ?
            function() {print(name,4,arguments);} : function(){};
        logger._e = enabled ?
            function() { print(name,1,arguments);} : function(){};
        logger._w = enabled ?
            function() { print(name,2,arguments);} : function(){};
        logger._i = enabled ?
            function() { print(name,3,arguments);} : function(){};
        logger._d = enabled ? function() { print(name,4,arguments)} : function(){};
        logger._setLevel = function(level) { setLevel(name, level); };
        logger._disable = disable;
        logger._enable = enable;
        logger._list = list;
        return logger;
    } 

    function setGlobalLevel(level) {
        globalLevel = levels.indexOf(level);
        if (globalLevel === -1) {
            console.warn("logger.setLevel: level should be one of 'none', 'error', 'warn', 'info' or 'debug' not:",
                         level);
            console.log("setting level of logger to 'debug'");
            globalLevel = levels.indexOf('debug');
        }
    }


    //executed on load:
    setGlobalLevel(defaultGlobalLevel);
    if (enabled) addHooks();
    
    var loggers = {};
    loggers = getLogger();
    loggers._setGlobalLevel = setGlobalLevel;
    loggers._off = function() {
        this._state = 'off';
        localStorage.removeItem('loggerEnabled');
        removeHooks();   
        console.log('Please refresh the page.');
    }
    loggers._on = function() {
        this._state = 'on'
        localStorage.setItem('loggerEnabled', 'true');
        addHooks();   
        console.log('Please refresh the page.');
    }
    loggers._state = enabled ? 'on' : 'off';
    loggers._create = getLogger;
    loggers._showTimeStamp = true;
    loggers._enum = function() {
        console.log('default' + '(' + getMaxLevel('') + ')');
        this._list().forEach(function(k) {
            console.log(k + ' (' + getMaxLevel(k) + ')',
                        loggers[k]._list().map(function(s) {
                            return s + ' (' + getMaxLevel(k + '[' + s + ']') + ')'
                        }));
        })
    }
    global[globalHook] = loggers;



    //freely copied from https://github.com/visionmedia/debug/blob/master/dist/debug.js
    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;


    /**
     * Parse the given `str` and return milliseconds.
     *
     * @param {String} str
     * @return {Number}
     * @api private
     */

    function parse(str) {
        var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
        if (!match) return;
        var n = parseFloat(match[1]);
        var type = (match[2] || 'ms').toLowerCase();
        switch (type) {
          case 'years':
          case 'year':
          case 'y':
            return n * y;
          case 'days':
          case 'day':
          case 'd':
            return n * d;
          case 'hours':
          case 'hour':
          case 'h':
            return n * h;
          case 'minutes':
          case 'minute':
          case 'm':
            return n * m;
          case 'seconds':
          case 'second':
          case 's':
            return n * s;
          case 'ms':
            return n;
        }
    }

    function humanize (val, options) {
        options = options || {};
        if ('string' == typeof val) return parse(val);
        return options.long
            ? long(val)
            : short(val);
    }

    /**
     * Short format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function short(ms) {
        if (ms >= d) return Math.round(ms / d) + 'd';
        if (ms >= h) return Math.round(ms / h) + 'h';
        if (ms >= m) return Math.round(ms / m) + 'm';
        if (ms >= s) return Math.round(ms / s) + 's';
        return ms + 'ms';
    }

    /**
     * Long format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function long(ms) {
        return plural(ms, d, 'day')
            || plural(ms, h, 'hour')
            || plural(ms, m, 'minute')
            || plural(ms, s, 'second')
            || ms + ' ms';
    }

    /**
     * Pluralization helper.
     */

    function plural(ms, n, name) {
        if (ms < n) return;
        if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
        return Math.ceil(ms / n) + ' ' + name + 's';
    }
    
    //TODO colors:
    var colors = [
        'lightseagreen',
        'forestgreen',
        'goldenrod',
        'dodgerblue',
        'darkorchid',
        'crimson'
    ];

    function useColors() {
        // is webkit? http://stackoverflow.com/a/16459606/376773
        return ('WebkitAppearance' in document.documentElement.style) ||
            // is firebug? http://stackoverflow.com/a/398120/376773
            (window.console && (console.firebug || (console.exception && console.table)));
    }

    var prevColor = 0;

    function selectColor() {
        return exports.colors[prevColor++ % exports.colors.length];
    }


})(this);
