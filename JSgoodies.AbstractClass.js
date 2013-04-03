(function (window, document, JSgoodies, undefined) {
    /*
     // type list
     TYPE = {
         number: typeOf(1),
         string: typeOf('s'),
         math: typeOf(Math),
         regexp: typeOf(/s/)
         function: typeOf(function () {}),
         array: typeOf([]),
         object: typeOf({}),
         boolean: typeOf(true),
         date: typeOf(new Date())
     }
    */
    var implements = function (/*interfaces*/) {
            var proto = this.prototype,
                i, j,
                len = arguments.length,
                _interface,
                method;
            if (!len) {
                throw new Error('Class should implement at least one interface');
            }

            for (i =0; (_interface = arguments[i], i < len); i ++) {
                if (!(_interface instanceof JSgoodies.Interface)) {
                    throw new TypeError('Class should implement Type Interface');
                }
            }

            for (j = 0; (_interface = arguments[j]); j++) {
                for (var k = 0, args; (method = _interface.methods[k]); k++) {
                    if (!proto[method.method] || typeof proto[method.method] !== 'function') {
                        throw new Error('This Class does not implement "'+_interface.name+'" interface. Method "'+method.method+'" was not found.');
                    } else {
                        method.args = getArgumentsCount(proto[method.method]);
                        if (method.args.argsCount < method.argsCount) {
                            throw new Error('Minimum no. of expected parameter definition for method "'+method.method+'" is: '+method.argsCount+' instead only: '+arguments.length+' was provided');
                        } else {
                            proto[method.method] = !method.isTypeCheck ? (function (name, fn, count) {
                                return function () {
                                    var ret;
                                    if (arguments.length < count) {
                                        throw new Error('Minimum no. of expected parameter for method "'+name+'" while calling is: '+count+' instead only: '+arguments.length+' was provided');
                                    }
                                    ret = fn.apply(this, arguments);
                                    return ret;
                                };
                            })(method.method, proto[method.method], method.argsCount) :
                                (function (method, context) {
                                    var toString = Object.prototype.toString,
                                        name = method.method,
                                        fn = context[name],
                                        count = method.argsCount,
                                        typeOf = function (val) {
                                            if (typeof val === 'undefined') {
                                                return 'Undefined';
                                            }

                                            if (val === null) {
                                                return 'Null';
                                            }
                                            return toString.call(val).match(/^\[object (.*)\]$/)[1];
                                        };
                                    return function () {
                                        var ret, i, type,evaledType;
                                        if (arguments.length < count) {
                                            throw new Error('Minimum no. of expected parameter for method "'+name+'" while calling is: '+count+' instead only: '+arguments.length+' was provided');
                                        }

                                        for (i = 0, len = method.types.length; i < len; i++) {
                                            type = method.types[i].replace(/^\s+/, '').replace(/\s+$/, ''); // trim the spaces before and after
                                            try {
                                                evaledType = window['eval'].call(window, type);
                                            } catch(e) {
                                                evaledType = undefined;
                                            }
                                            if (!~type.indexOf('|')) {
                                                if (typeOf(arguments[i]).toLowerCase() !== type.toLowerCase()
                                                    && !((typeOf(arguments[i]).toLowerCase() === 'function') ?
                                                    arguments[i] === evaledType :
                                                    arguments[i] && arguments[i].constructor === evaledType)) {

                                                    throw new TypeError('While calling Expected type for argument "'+method.args.argsName[i]+'" in method "'+method.method+'" is: "'+type+'" instead type: "'+typeOf(arguments[i])+'" was provided');
                                                }
                                            } else {
                                                // support to provide one alternative e.g. String|Null or String|Number
                                                type = type.split('|');
                                                type[0] = type[0].replace(/^\s+/, '').replace(/\s+$/, '') || 'undefined';
                                                type[1] = type[1].replace(/^\s+/, '').replace(/\s+$/, '') || 'undefined';
                                                if ((typeOf(arguments[i]).toLowerCase() !== type[0].toLowerCase() && typeOf(arguments[i]).toLowerCase() !== type[1].toLowerCase())
                                                    && !((typeOf(arguments[i]).toLowerCase() === 'function') ?
                                                    arguments[i] === evaledType :
                                                    arguments[i] && arguments[i].constructor === evaledType)) {

                                                    throw new TypeError('While calling Expected type for argument "'+method.args.argsName[i]+'" in method "'+method.method+'" is: "'+type[0]+'" or "'+type[1]+'" instead type: "'+typeOf(arguments[i])+'" was provided');
                                                }
                                            }
                                        }

                                        ret = fn.apply(this, arguments);
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
            argsCount = (match) ? ~match.indexOf(',') ? (argsName = match.split(','), match.split(',').length) : (argsName = match, 1) : 0;

            return {argsName: argsName, argsCount: parseInt(argsCount, 10)};
        },
        internal = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
        
    JSgoodies.AbstractClass = function () {
        if (!internal) {
            this.constructor = new (function () {
                throw new Error('Trying to instantiate an Abstract Class');
            })();
        }
    };
    
    JSgoodies.AbstractClass.implements = implements;
    
    JSgoodies.AbstractClass.extend = function (prop) {
        var _super = this.prototype;
        
        if (typeof prop === 'function') {
            prop = prop.prototype;
        }

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        internal = true;
        var prototype = new this();
        internal = false;

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
        
        function AbstractClass() {
            if (!internal) {
                this.constructor = new (function () {
                    throw new Error('Trying to instantiate an Abstract Class');
                })();
            }
        }
        AbstractClass.prototype = prototype;
        AbstractClass.extend = arguments.callee;
        AbstractClass.implements = implements;
        
        return AbstractClass;
    };
})(this, this.document, (this.JSgoodies || (this.JSgoodies = {})) /*Check for global namespace*/);