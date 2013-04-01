(function (window, document, undefined) {
    var JSgoodies = window.JSgoodies;
    if (JSgoodies) {
        // it already exists do not create it again
        return;
    }

    function check(type) {
        var toString = Object.prototype.toString;

        return function (val) {
            return toString.call(val) === type;
        };
    }

    function filter(func) {
        var results, __duplicate, item, i;

        if (Array.prototype.filter) {
            results = Array.prototype.filter.call(this, func);
        } else {
            results = [];
            __duplicate = this.slice();
            item = __duplicate[0];
            i = 0;
            for (; item = __duplicate.shift(); i++) {
                if (func.call(arguments[1] || this, item, i, this)) {
                    results.push(item);
                }
            }
        }

        return results;
    }


    var initializing = false, internal = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/,
        __implements = function (/*interfaces*/) {
            var proto = this.prototype,
                i, j,
                len = arguments.length,
                _interface,
                method;
            if (!len) {
                throw new Error('Class should implement at least one interface');
            }

            for (i =0; (_interface = arguments[i], i < len); i ++) {
                if (!(_interface instanceof Interface)) {
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
                            throw new Error('Minimum no. of expected parameter definition for method "'+method.method+'" is: '+method.argsCount+' instead only: '+method.args.argsCount+' was provided');
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
                            })(method.method, proto[method.method], proto, method.argsCount) :
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

            delete this._implements;

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
        __extends = function (prop) {
            var _super = prop;

            if (typeof prop === 'function') {
                initializing = true;
                _super = new prop();
                initializing = false;
            }

            var prototype = Util.inherit(_super, this.prototype);

            // Enforce the constructor to be what we expect
            this.prototype.constructor = this;
            delete this._extends;

            return this;
        };

    /**
     * Implementatior for 'Class'
     */
    var Class = function (props) {
        var isObject = check('[object Object]'),
            isFunction = check('[object Function]');

        if (!isFunction(props) && !isObject(props)) {
            throw new TypeError('Class expects Object or Function');
        }
        if (isFunction(props)) {
            props = props.prototype;
        }
        var fn = function Class() {
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        };
        fn.prototype = props;
        fn._implements = __implements;
        fn._extends = __extends;
        fn.prototype.constructor = fn;

        return fn;
    };

    /**
     * Implementation for 'AbstractClass'
     */
    var AbstractClass = function (props) {
        var isObject = check('[object Object]'),
            isFunction = check('[object Function]');

        if (!isFunction(props) && !isObject(props)) {
            throw new TypeError('AbstractClass expects Object or Function');
        }
        if (isFunction(props)) {
            props = props.prototype;
        }
        var fn = function AbstractClass() {
                if (!initializing) {
                    this.constructor = new (function () {
                        throw new Error('Trying to instantiate an Abstract Class');
                    })();
                }
            };
            fn.prototype = props;
            fn._implements = __implements;
            fn._extends = __extends;
            fn.prototype.constructor = fn;

            return fn;
    };

    /**
     * Implementation for 'Interface'
     */
    var Interface = function (name, methods) {
        var self = this,
            toString = Object.prototype.toString,
            i = 0,
            method, methodConfig, typeArrayRegExp = /\[(.*?)\]/;

        if (arguments.length !== 2) {
            throw new Error('Interface expects exactly 2 arugments "name" and "method" list');
        }

        if (!(this instanceof arguments.callee)) {
            self = new arguments.callee(name, methods);
        }

        if (toString.call(name) !== '[object String]') {
            throw new TypeError('Interface name is suppose to be of Type String');
        }

        self.name = name;

        if (toString.call(methods) !== '[object Array]') {
            throw new TypeError('Method list is suppose to be of Type Array');
        }

        self.methods = [];

        for (; (method = methods[i]); i++) {
            if (toString.call(method) !== '[object String]') {
                throw new TypeError('Method name is suppose to be of Type String');
            }
            method = method.split(':');
            methodConfig = {
                method: method[0],
                argsCount: 0,
                isTypeCheck: false,
                types: null
            };

            //if its a Number then type check is false and that is our arguments count else it's an array parse it.
            methodConfig.argsCount = !isNaN(parseInt(method[1], 10)) ? parseInt(method[1], 10) :
                method[1] && method[1] !== '[]' ? (methodConfig.isTypeCheck = true, methodConfig.types = typeArrayRegExp.exec(method[1])[1].split(','),
                    (methodConfig.types[0]) ? methodConfig.types.length : 0) : 0;

            self.methods.push(methodConfig);
        }
    };

    /**
     * Implementaion for 'Util'
     */
    Util = {
        override: function (parent, prop) {
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            for (var name in prop) {
                parent[name] = (hasOwnProperty.call(parent, name) && typeof prop[name] === 'function' && typeof parent[name] === 'function') ? (function (p, fn) {
                    var su = parent[p];
                    return function () {
                        var tmp = parent._super;
                        parent._super = su;
                        var ret = fn.apply(parent, arguments);
                        parent._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) : prop[name];
            }
        },

        inherit: function (parent, child) {
            var toString = Object.prototype.toString,
                self = arguments.callee,
                hasOwnProperty = Object.prototype.hasOwnProperty;
            for (var name in parent) {
                child[name] = (hasOwnProperty.call(child, name) && typeof child[name] === 'function' && typeof parent[name] === 'function') ? (function (p, fn) {
                    return function () {
                        var tmp = child._super;
                        child._super = parent[p];
                        var ret = fn.apply(child, arguments);
                        child._super = tmp;
                        return ret;
                    };
                })(name, child[name]) :
                    hasOwnProperty.call(child, name) ? child[name] :
                        (toString.call(parent[name]) === '[object Array]') ? parent[name].concat() :
                            (toString.call(parent[name]) === '[object Object]') ? self(parent[name], {}) : parent[name];
            }

            return child;
        }
    };

    /**
         * Implementation for 'ObservableClass'
         */

        var isString = check('[object String]'),
            isArray = check('[object Array]'),
            isFunction = check('[object Function]'),
            hasOwnProperty = Object.prototype.hasOwnProperty,
            DummyInterface = new Interface('DummyInterface', []);

        /**
         * @class ObservableClass: used to create classes which needs to be observed
         */
        var ObservableClass = Class({
            __listeners__: null,
            __uidPrefix__: 'Observable_UID_',
            __uid__: 1,

            addObserver: function (eventName, handler, identifier) {
                if (!(eventName && isString(eventName))) {
                    throw new TypeError('expected type a non-empty String for eventName');
                }

                if (!(handler && isFunction(handler))) {
                    throw new TypeError('expected type Function for handler')
                }

                var listener = {
                    type: eventName,
                    handler: handler,
                    namespace: null,
                    id: identifier || (this.__uidPrefix__ + this.__uid__++)
                }, list;
                // for events with namespace the format is type.namespace
                ~eventName.indexOf('.') && (list = eventName.split('.'), listener.type = list.shift(), listener.namespace = list.shift());

                !this.__listeners__ && (this.__listeners__ = {});

                !this.__listeners__[listener.type] && (this.__listeners__[listener.type] = []);

                this.__listeners__[listener.type].push(listener);

                return listener.id;
            },

            fireObserver: function (eventName, args) {
                if (!(eventName && isString(eventName))) {
                    throw new TypeError('expected type a non-empty String for eventName');
                }

                // if listeners are not present just return
                if (!this.__listeners__) {
                    return;
                }

                // if args is present and is not an array convert it to array
                if (arguments.length > 2 || !isArray(args)) {
                    args = Array.prototype.slice.call(arguments, 1);
                }

                var namespace, list, listeners;

                // for events with namespace the format is type.namespace
                ~eventName.indexOf('.') && (list = eventName.split('.'), eventName = list.shift(), namespace = list.shift());

                // get the list of listener for the eventName
                listeners = this.__listeners__[eventName] || [];

                if (namespace) {
                    listeners = filter.call(listeners, function (item) {
                        return item.namespace === namespace;
                    });
                }

                listeners && listeners.length && this.__callAllHandlers__(eventName, listeners.slice(), args);

            },
            __callAllHandlers__: function (eventName, listeners, args) {
                var listener = listeners[0];
                for (; listener = listeners.shift();) {
                    try {
                        listener.handler.apply(this, args);
                    } catch (e) {
                        throw new Error('Exception' + e + ' occured in listener call for event ' + eventName + ', listener ' + listener.handler.toString());
                    }
                }
            },

            removeObserver: function (eventName, handler) {
                if (!(eventName && isString(eventName))) {
                    throw new TypeError('expected type a non-empty String for eventName');
                }

                // if listeners are not present just return
                if (!this.__listeners__) {
                    return;
                }

                var namespace, list, identifier, listeners;

                // for events with namespace the format is type.namespace
                ~eventName.indexOf('.') && (list = eventName.split('.'), eventName = list.shift(), namespace = list.shift());

                identifier = (isString(handler)) ? handler : null;
                listeners = this.__listeners__[eventName] || [];

                if (!listeners.length) {
                    return;
                }

                if (namespace) {
                    if (!identifier && !handler) {
                        this.__listeners__[eventName] = filter.call(listeners, function (item) {
                            return item.namespace !== namespace;
                        });
                    } else if (identifier) {
                        this.__listeners__[eventName] = filter.call(listeners, function (item) {
                            return item.namespace !== namespace || item.id !== identifier;
                        });
                    } else if (handler) {
                        this.__listeners__[eventName] = filter.call(listeners, function (item) {
                            return item.namespace !== namespace || item.handler !== handler;
                        });
                    }

                    if (!this.__listeners__[eventName].length) {
                        delete this.__listeners__[eventName];
                    }

                    return;
                }

                if (identifier) {
                    this.__listeners__[eventName] = filter.call(listeners, function (item) {
                        return item.id !== identifier;
                    });

                    if (!this.__listeners__[eventName].length) {
                        delete this.__listeners__[eventName];
                    }

                } else if (handler) {
                    this.__listeners__[eventName] = filter.call(listeners, function (item) {
                        return item.handler !== handler;
                    });

                    if (!this.__listeners__[eventName].length) {
                        delete this.__listeners__[eventName];
                    }

                } else {
                    this.__listeners__[eventName] && this.__listeners__[eventName].length && delete this.__listeners__[eventName];
                }

                return;
            },

            removeObserverByNamespace: function (namespace) {
                var item;

                for (item in this.__listeners__) {
                    if (hasOwnProperty.call(this.__listeners__, item)) {
                        this.__listeners__[item] = filter.call(this.__listeners__[item], function (item) {
                            return item.namespace !== namespace;
                        });

                        if (!this.__listeners__[item].length) {
                            delete this.__listeners__[item];
                        }
                    }
                }
            }
        })._extends({})._implements(DummyInterface);

    //expose JSgoodies
    window.JSgoodies = {
        Class: Class,
        ObservableClass: ObservableClass,
        AbstractClass: AbstractClass,
        Interface: Interface,
        Util: Util
    }
})(this, this.document);