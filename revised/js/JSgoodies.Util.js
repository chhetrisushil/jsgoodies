/*
 * JSgoodies.Util.js
 * Copyright (C) 2016 chhetrisushil <chhetrisushil@gmail.com>
 *
 * Distributed under terms of the MIT license.
 */
(function(W, JSgoodies) {
  "use strict";

  var toString = Object.prototype.toString,
    slice = Array.prototype.slice,
    hasProp = Object.prototype.hasOwnProperty,
    typeOf = function typeOf(type) {
      var regEx = new RegExp('\\[object ' + type + '\\]', 'i');

      return function(variable) {
        return regEx.test(toString.call(variable));
      };
    },
    noop = function noop() {},
    hasOwnProperty, extend, inherit, isString, isArray, isFunction, isObject,
    isBoolean, isUndefined, isNull, toArray, assert, each, getArgumentsInfo;

  function Utility() {}

  Utility.prototype = {
    constructor: Utility,

    /**
     * @function
     */
    isString: (isString = typeOf('String')),

    /**
     * @function
     */
    isObject: (isObject = typeOf('Object')),

    /**
     * @function
     */
    isFunction: (isFunction = typeOf('Function')),

    /**
     * @function
     */
    isArray: (isArray = typeOf('Array')),

    /**
     * @function
     */
    isBoolean: (isBoolean = typeOf('Boolean')),

    /**
     * @function
     */
    isUndefined: (isUndefined = typeOf('Undefined')),

    /**
     * @function
     */
    isNull: (isNull = typeOf('Null')),

    /**
     * @function
     */
    hasProperty: (hasOwnProperty = function hasOwnProperty(obj, prop) {
      return hasProp.call(obj, prop);
    }),

    /**
     * Converts Array LIKE objects to Array
     *
     * @param obj {Object}: Array LIKE object
     * @return {Array}: Array
     */
    toArray: (toArray = function(obj, index) {
      return slice.call(obj, index || 0);
    }),

    /**
     * Changes first letters of space separated string to capital
     * e.g. utility.toCapital('text to be camel case') //TextToBeCamelCase
     *
     * @param str {String}: to be converted to camel case
     * @return {String}: converted string
     */
    toCapital: function toCapital(str) {
      return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return match.toUpperCase();
      });
    },

    /**
     * Basic implementation of deprecate
     * TODO:Enhance the deprecator
     *
     * @param msg {String}: Warning message
     * @return {undefined}
     */
    deprecate: function deprecate(msg) {
      console.warn(msg);
    },

    /**
     * This method provides a way to access properties of the sub-level using dot separated strings
     *
     * @param obj {Object}: Of which property is to be accessed
     * @param propStr {String}: a hierarchical string to access the property value
     * @return {*} Value of the property hierarchy
     */
    getProperty: function getProperty(obj, propStr) {
      if (!/(\(|\))/ig.test(propStr)) {
        propStr = '["' + propStr.replace(/[.]/g, '"]["') + '"]';

        return new Function('o', 'return o' + propStr)(obj); //jshint ignore: line
      } else {
        console.warn('Please provide a valid property accessor');
      }
    },

    /**
     * This method help compose series of functions
     *
     * @return {undefined}
     */
    compose: function() {
      var funcs = arguments,
        length = funcs.length;
      return function() {
        var idx = length - 1,
          result = funcs[idx].apply(this, arguments);
        while (idx--) {
          result = funcs[idx].call(this, result);
        }
        return result;
      };
    },

    /**
     * This method helps curry a function
     *
     * @param fn {Function}: Function to be curried
     * @return {undefined}
     */
    curry: function(fn) {
      var numargs = fn.length;

      function createRecurser(acc) {
        return function() {
          var args = [].slice.call(arguments);
          return recurse(acc, args);
        };
      }

      function recurse(acc, args) {
        /*jshint validthis: true*/
        var newacc = acc.concat(args);

        if (newacc.length < numargs) {
          return createRecurser(newacc);
        }

        return fn.apply(this, newacc);
      }

      return createRecurser([]);
    },

    /**
     * Uitlity to loop through objects (similar to Array.prototype.forEach)
     *
     * @param obj {Object}: Object to loop through
     * @param callback {Function}: Callback method to be called on every item
     * @return {undefined}
     */
    each: (each = function(obj, callback) {
      var i;

      assert(isObject(obj), 'each Can only be called on Object');
      assert(isFunction(callback), 'Provide a callback');

      for (i in obj) {
        if (hasOwnProperty(obj, i)) {
          callback(obj[i], i, obj);
        }
      }
    }),

    /**
     * Method to assert statements
     *
     * @param test {Function | *}: test to perform to check assertion
     * @param msg {String}: Message if the assertion fails
     * @throws Error
     */
    assert: (assert = function(test, msg) {
      var exception = false;

      if (isFunction(test)) {
        exception = !test();
      } else {
        exception = !test;
      }

      if (exception) {
        throw new Error('Assertion Failed: ' + msg);
      }
    }),

    /**
     * Extends the properties of parent object to child object.
     * If property is already present in child and is of type Function
     * adds an _super accessor to access parent's method (base method).
     *
     * @param child {Object}
     * @param parent {Object}
     * @return {Object} Returns an extended object
     */
    extend: (extend = function(child, parent) {
      var closure = function(p, fn) {
        return function() {
          var tmp = child._super;

          child._super = parent[p];

          var ret = fn.apply(child, arguments);

          child._super = tmp;

          return ret;
        };
      };

      for (var name in parent) {
        child[name] = (hasOwnProperty(child, name) &&
            isFunction(child[name]) &&
            isFunction(parent[name])) ?
          closure(name, child[name]) :
          hasOwnProperty(child, name) ?
          child[name] : isArray(parent[name]) ?
          parent[name].concat() :
          isObject(parent[name]) ?
          extend(parent[name], {}) :
          parent[name];
      }

      return child;
    }),

    /**
     * This method does inheriting of methods and properties
     *
     * @param child {Object}: Generally this is the prototype object
     * @param parent {Object}: New method object
     * @return {child} Child with inherited methods and properties
     */
    inherit: (inherit = function inherit(child, parent) {
      var closure = function(p, fn) {
        return function() {
          var tmp = this._super;

          this._super = fn;

          var ret = parent[p].apply(this, arguments);

          this._super = tmp;

          return ret;
        };
      };

      for (var name in parent) {
        child[name] = (isFunction(child[name]) &&
            isFunction(parent[name])) ?
          closure(name, child[name]) :
          parent[name];
      }

      return child;
    }),

    /**
     * No operations method
     *
     * @return {undefined}
     */
    noop: noop,

    implements: function( /*interfaces*/ ) {
      var proto = this.prototype,
        i, j,
        len = arguments.length,
        _interface,
        method;
      if (!len) {
        throw new Error('Class should implement at least one interface');
      }

      for (i = 0;
        (_interface = arguments[i], i < len); i++) {
        assert(_interface instanceof JSgoodies.Interface, 'Class should implement Type Interface');
      }

      for (j = 0;
        (_interface = arguments[j]); j++) {
        for (var k = 0, args;
          (method = _interface.methods[k]); k++) {
          assert(!!(proto[method.method] || isFunction(proto[method.method])), 'This Class does not implement "' + _interface.name + '" interface. Method "' + method.method + '" was not found.');

          method.args = getArgumentsInfo(proto[method.method]);

          assert(method.args.argsCount >= method.argsCount, 'Minimum no. of expected parameter definition for method "' + method.method + '" is: ' + method.argsCount + ' instead only: ' + method.args.argsCount + ' was provided');

          proto[method.method] = !method.isTypeCheck ? (function(name, fn, count) {
              return function() {
                var ret;

                assert(arguments.length >= count, 'Minimum no. of expected parameter for method "' + name + '" while calling is: ' + count + ' instead only: ' + arguments.length + ' was provided');

                ret = fn.apply(this, arguments);
                return ret;
              };
            })(method.method, proto[method.method], method.argsCount) :
            (function(method, context) {
              var toString = Object.prototype.toString,
                name = method.method,
                fn = context[name],
                count = method.argsCount,
                typeOf = function(val) {
                  if (typeof val === 'undefined') {
                    return 'Undefined';
                  }

                  if (val === null) {
                    return 'Null';
                  }
                  return toString.call(val).match(/^\[object (.*)\]$/)[1];
                };

              return function() {
                var ret, i, type, evaledType;

                assert(arguments.length >= count, 'Minimum no. of expected parameter for method "' + name + '" while calling is: ' + count + ' instead only: ' + arguments.length + ' was provided');

                for (i = 0, len = method.types.length; i < len; i++) {
                  type = method.types[i].replace(/^\s+/, '').replace(/\s+$/, ''); // trim the spaces before and after

                  try {
                    evaledType = window['eval'].call(window, type);
                  } catch (e) {
                    evaledType = undefined;
                  }

                  if (!~type.indexOf('|')) {
                    assert(!(typeOf(arguments[i]).toLowerCase() !== type.toLowerCase() && !((typeOf(arguments[i]).toLowerCase() === 'function') ?
                        arguments[i] === evaledType : arguments[i] && arguments[i].constructor === evaledType)),
                      'While calling Expected type for argument "' + method.args.argsName[i] + '" in method "' + method.method + '" is: "' + type + '" instead type: "' + typeOf(arguments[i]) + '" was provided');
                  } else {
                    // support to provide one alternative e.g. String|Null or String|Number
                    type = type.split('|');
                    type[0] = type[0].replace(/^\s+/, '').replace(/\s+$/, '') || 'undefined';
                    type[1] = type[1].replace(/^\s+/, '').replace(/\s+$/, '') || 'undefined';

                    assert(!((typeOf(arguments[i]).toLowerCase() !== type[0].toLowerCase() && typeOf(arguments[i]).toLowerCase() !== type[1].toLowerCase()) &&
                        !((typeOf(arguments[i]).toLowerCase() === 'function') ? arguments[i] === evaledType :
                          arguments[i] && arguments[i].constructor === evaledType)),
                      'While calling Expected type for argument "' + method.args.argsName[i] + '" in method "' + method.method + '" is: "' + type[0] + '" or "' + type[1] + '" instead type: "' + typeOf(arguments[i]) + '" was provided');
                  }
                }

                ret = fn.apply(this, arguments);
                return ret;
              };
            })(method, proto);
        }
      }

      return this;
    },

    /**
     * Get arguments count and name of the arguments
     *
     * @param fn {Function}: Function whose arguments info is needed
     * @return {Object}: Contains argument count and names
     */
    getArgumentsInfo: (getArgumentsInfo = function(fn) {
      assert(isFunction(fn), 'Expected argument type is Function');

      var fnToString = fn.toString(),
        argsRegExp = /\((.*?)\)/,
        commentRegExp = /(\/\*.*?\*\/)/g,
        match = argsRegExp.exec(fnToString)[1],
        argsCount, argsName;
      match = match.replace(commentRegExp, ''); // this is to remove any comment made for any arguments.
      argsCount = fn.length,
        argsName = (match) ? ~match.indexOf(',') ? (match.replace(/ /g, '').split(',')) : match : null;

      return {
        argsName: argsName,
        argsCount: parseInt(argsCount, 10)
      };
    })
  };

  JSgoodies.utility = JSgoodies.utility || (new Utility());
})(window, window.JSgoodies || (window.JSgoodies = {}));
