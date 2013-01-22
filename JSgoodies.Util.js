(function (window, document, JSgoodies, undefined) {
    JSgoodies.Util = {
        override: function (parent, prop) {
            for (var name in prop) {
                parent[name] = (parent.hasOwnProperty(name) && typeof prop[name] === 'function' && typeof parent[name] === 'function') ? (function (p, fn) {
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
                self = arguments.callee;
            for (var name in parent) {
                child[name] = (child.hasOwnProperty(name) && typeof child[name] === 'function' && typeof parent[name] === 'function') ? (function (p, fn) {
                    return function () {
                        var tmp = child._super;
                        child._super = parent[p];
                        var ret = fn.apply(child, arguments);
                        child._super = tmp;
                        return ret;
                    };
                })(name, child[name]) : 
                    child.hasOwnProperty(name) ? child[name] : 
                        (toString.call(parent[name]) === '[object Array]') ? parent[name].concat() : 
                            (toString.call(parent[name]) === '[object Object]') ? self(parent[name], {}) : parent[name];
            }
            
            return child;
        }
    };
})(this, this.document, (this.JSgoodies || (this.JSgoodies = {})) /*Check for global namespace*/);