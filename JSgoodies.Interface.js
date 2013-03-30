(function (window, document, JSgoodies, undefined) {
    JSgoodies.Interface = function (name, methods) {
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
})(this, this.document, (this.JSgoodies || (this.JSgoodies = {}))  /*Check for global namespace*/);