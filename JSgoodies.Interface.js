(function (window, document, JSgoodies, undefined) {
    JSgoodies.Interface = function (name, methods) {
        var self = this,
            toString = Object.prototype.toString,
            i = 0,
            method;
        
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
            
            self.methods.push(method);
        }
    };
})(this, this.document, (this.JSgoodies || (this.JSgoodies = {}))  /*Check for global namespace*/);