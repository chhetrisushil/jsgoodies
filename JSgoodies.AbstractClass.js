(function (window, document, JSgoodies, undefined) {
    var implement = function (/*interfaces*/) {
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
                for (var k = 0; (method = _interface.methods[k]); k++) {
                    if (!proto[method] || typeof proto[method] !== 'function') {
                        throw new Error('This Class does not implement "'+_interface.name+'" interface. Method "'+method+'" was not found.');
                    }
                }
            }
            
            return this;
        },
        internal = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
        
    JSgoodies.AbstractClass = function () {};
    
    JSgoodies.AbstractClass.implement = implement;
    
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
        AbstractClass.implement = implement;
        
        return AbstractClass;
    };
})(this, this.document, (this.JSgoodies || (this.JSgoodies = {})) /*Check for global namespace*/);