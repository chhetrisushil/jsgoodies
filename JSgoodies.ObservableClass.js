/**
 * @filename: JSgoodies.ObservableClass.js
 * @author: chhetrisushil
 * @date: 3/28/13
 * @time: 1:38 AM
 */
(function (window, document, undefined) {
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

    /* **Note: The only class which depends on JSgoodies.Class, hence we'll be performing a check for the presence of JSgoodies.Class if not present thorw an error. */
    if (!(window.JSgoodies && JSgoodies.Class && JSgoodies.Class.extend)) {
        throw new Error('To create Observable class JSgoodies.Class is an absolute must. Please include the JSgoodies.Class.js (if already included you may want to put the inclusion tag before this file).');
    }

    var isString = check('[object String]'),
        isArray = check('[object Array]'),
        isFunction = check('[object Function]'),
        hasOwnProperty = Object.prototype.hasOwnProperty;

    /**
     * @class ObservableClass: used to create classes which needs to be observed
     */
    JSgoodies.ObservableClass = JSgoodies.Class.extend({
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
    });
})(this, this.document);
