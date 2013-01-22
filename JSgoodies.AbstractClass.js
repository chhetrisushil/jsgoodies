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
        internal = true;
        
    JSgoodies.AbstractClass = function () {
        if (!internal) {
            this.constructor = new (function () {
                throw new Error('Trying to instantiate an Abstract Class');
            })();
        }
        console.log('Abstract Class');
    };
    
    JSgoodies.AbstractClass.implement = implement;
    new JSgoodies.AbstractClass();
    internal = false;
    
})(this, this.document, (this.JSgoodies || (this.JSgoodies = {})) /*Check for global namespace*/);