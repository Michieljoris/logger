Logger
------------

A little namespaced logging utility.

The state of loggers gets persisted in localStorage.

Load the script with:

     <script src=pathto/logger.js></script>
	 
A new global is created named logger, this can be changed, see top of source
file.

Turn the logger on for your browser:

	logger._on();
	
The state of the logger gets persisted in localStorage, turn the logger off with:

	logger._off();
	
Check the state with:

	logger._state; //on or off
	
When turned off all log calls in your source code are just noop calls (`function() {}`).

Turning the logger on or off requires a refresh of the browser to have any effect.

When turned on, `logger` itself is a logger already, however it starts of as
disabled as any logger created with `logger`. Enable it:

	logger._enable();
	
Then use it as a default logger:

	logger('Hello');// same as console.log
	
Or use a log level:

	logger._e('error'); //printed with stack trace
	logger._w('warning); //printed with alarm icon
	logger._i('info); //printed with info icon
	logger._d('debug); //standard console.log
	
Set the loglevel for this logger:

	logger._setLevel('warning'); //only warning and errors are printed
	
Levels can be `debug`, `info`, `warning`, `error` or `none`.
	
Enabling a logger is the same as setting the log level to `debug`. Disabling a
logger is the same as setting the level to `none`. 

The state of any logger gets persisted in localStorage. This means that opening
your page in a different browser will show no log output till you turn on and
enable the loggers you're interested in. Or you can do this in your source code,
however then it's a bit cumbersome to disable all the loggers off again.

By default loggers print out a timestamp, disable the timestamp with:

	logger._showTimeStamp = false;//does not get persisted in localStorage
	
Or disable the logger alltogether:

	logger._disable(); //in effect setting a 'none' error level.
	
Make a new logger with:

    var log = logger._create('nameOfLogger'); 
	
If you create a logger with the same name, you get the same logger again.

This logger `log` has the same methods as described above for he default logger,
and can be enabled and disabled separately from any other logger.

Turn on the logger in the browser console with:

	logger['nameOfLogger']._enable();
	
Every logger prints out its name before any output:

	log('And this is the log message.');

	--> (3m)nameOfLogger:108>And this is the log message.
	
And the line number (108) the log call was made.	

The time stamp (3m) is from when the script was first loaded, except when calls are
in quick succession (within 2 seconds), then the time stamp is relative to the first of the batch
(eg: +5ms).

You can namespace further like this:

	var anotherLogger = logger('nameOfLogger', ['foo']);
	
Enable it in the browser:
	
	anotherLogger.foo._enable();
	
Use the logger:

	anotherLogger.foo('hello!');
	
Use this for example to quickly create a logger for some functions, turn the
logger off when you're done, but leave the log calls in place, in case they are
useful again later.	

Enumerate all loggers:

	logger._enum();
	
	--> default (debug) 
	--> nameOfTheLogger (debug) ["foo (debug)"] 
	
Disable or enable all loggers under a namespace:

	logger['anotherLogger']._all.enable();
	logger['anotherLogger']._all.disable();
	
This also works for the default logger:

	logger._all.enable();
	logger._all.disable();
	
However this does only affect the top level loggers.	

Set the minimum global logging level for all loggers:

	logger.setGlobalLevel('warning); //not persisted
	
This sets the minimum levels of all loggers. In this case for example no info or
debug statements will be printed.

To completely remove all log statements from a script, maybe use Douglas Crockford's JSDev
https://github.com/douglascrockford/JSDev

console.debug, console.warn, console.info and
console.error are used under the covers.

* TODO: detect console object, fail gracefully
* TODO: pass through other console properties
* TODO: maybe store messages to output somewhere else
* TODO: implement custom colors and format string
* TODO: find function name where log call occurred!! Not working anymore.
