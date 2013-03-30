(function (window, document, JSgoodies, undefined) {
    /* Simple JavaScript Inheritance
     * By John Resig http://ejohn.org/
     * MIT Licensed.
     */
    // Inspired by base2 and Prototype
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/,
        implements = function (/*interfaces*/) {
            var proto = this.prototype,
                i, j,
                len = arguments.length,
                _interface,
                method;
            if (!len) {
                throw new Error('Class should implement at least one interface');
            }

            for (i =0; (_interface = arguments[i]); i ++) {
                if (!(_interface instanceof JSgoodies.Interface)) {
                    throw new TypeError('Class should implement Type Interface');
                }
            }

            for (j = 0; (_interface = arguments[j]); j++) {
                for (var k = 0, args; (method = _interface.methods[k]); k++) {
                    method.args = getArgumentsCount(proto[method.method]);
                    if (!proto[method.method] || typeof proto[method.method] !== 'function') {
                        throw new Error('This Class does not implement "'+_interface.name+'" interface. Method "'+method+'" was not found.');
                    } else {
                        if (method.args.argsCount < method.argsCount) {
                            throw new Error('Minimum no. of expected parameter for method "'+method.method+'" is: '+method.argsCount);
                        } else {
                            proto[method.method] = !method.isTypeCheck ? (function (name, fn, context, count) {
                                return function () {
                                    var ret;
                                    if (arguments.length < count) {
                                        throw new Error('Minimum no. of expected parameter for method "'+name+'" is: '+count);
                                    }
                                    ret = fn.apply(context, arguments);
                                    return ret;
                                };
                            })(method.method, proto[method.method], proto, method.argsCount) :
                                (function (method, context) {
                                    var toString = Object.prototype.toString,
                                        name = method.method,
                                        fn = context[name],
                                        count = method.argsCount,
                                        typeOf = function (val) {
                                            return toString.call(val).match(/^\[object (.*)\]$/)[1];
                                        };
                                    return function () {
                                        var ret, i, type;
                                        if (arguments.length < count) {
                                            throw new Error('Minimum no. of expected parameter for method "'+name+'" is: '+count);
                                        }

                                        for (i = 0, len = method.types.length; i < len; i++) {
                                            type = method.types[i];
                                            if (typeOf(arguments[i]).toLowerCase() !== type.toLowerCase()) {
                                                throw new TypeError('Expected type for argument "'+method.args.argsName[i]+'" is expected to be: '+type);
                                            }
                                        }

                                        ret = fn.apply(context, arguments);
                                        return ret;
                                    };
                                })(method, proto);
                        }
                    }
                }
            }

            return this;
        },
        getArgumentsCount = function (fn) {
            if (typeof fn !== 'function') {
                throw new TypeError('Expected argument type is function');
            }
            var fnToString = fn.toString(),
                argsRegExp = /\((.*?)\)/,
                commentRegExp = /(\/\*.*?\*\/)/g,
                match = argsRegExp.exec(fnToString)[1],
                argsCount, argsName;
            match = match.replace(commentRegExp, ''); // this is to remove any comment made for any arguments.
            argsCount = (match) ? ~match.indexOf(',') ? (argsName = match.split(','), match.split(',').length) : 1 : 0;

            return {argsName: argsName, argsCount: parseInt(argsCount, 10)};
        };

    // The base Class implementation (does nothing)
    JSgoodies.Class = function(){};
    
    //implement method
    JSgoodies.Class.implements = implements;

    // Create a new Class that inherits from this class
    JSgoodies.Class.extend = function(prop) {
        var _super = this.prototype;
        
        if (typeof prop === 'function') {
            prop = prop.prototype;
        }

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
          // Check if we're overwriting an existing function
          prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function(name, fn){
              return function() {
                var tmp = this._super;
                // Add a new ._super() method that is the same method
                // but on the super-class
                this._super = _super[name];
                // The method only need to be bound temporarily, so we
                // remove it when we're done executing
                var ret = fn.apply(this, arguments);       
                this._super = tmp;
                return ret;
              };
            })(name, prop[name]) :
            prop[name];
        }

        // The dummy class constructor
        function Class() {
          // All construction is actually done in the init method
          if ( !initializing && this.init )
            this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;
        Class.implements = implements;
        
        return Class;
    };
})(this, this.document, (this.JSgoodies || (this.JSgoodies = {}))  /*Check for global namespace*/);