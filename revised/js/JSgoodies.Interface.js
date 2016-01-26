/*
 * JSgoodies.Interface.js
 * Copyright (C) 2016 chhetrisushil <chhetrisushil@gmail.com>
 *
 * Distributed under terms of the MIT license.
 */
(function(W, JSgoodies) {
  "use strict";

  var utility = JSgoodies.utility;

  function Interface(name, methods) {
    var self = this,
      toString = Object.prototype.toString,
      i = 0,
      method, methodConfig, typeArrayRegExp = /\[(.*?)\]/;

    utility.assert(arguments.length === 2, 'Interface expects exactly 2 arguments "name" and "method" list');
    utility.assert(utility.isString(name), 'Interface name is suppose to be of Type String');
    utility.assert(utility.isArray(methods), 'Method list is suppose to be of Type Array');

    if (!(this instanceof Interface)) {
      return (self = new Interface(name, methods));
    }

    self.name = name;
    self.methods = [];

    for (;
      (method = methods[i]); i++) {
      utility.assert(utility.isString(method), 'Method name is suppose to be of Type String');

      method = method.split(':');
      methodConfig = {
        method: method[0],
        argsCount: 0,
        isTypeCheck: false,
        types: null
      };

      //if its a Number then type check is false and that is our arguments count else it's an array parse it.
      methodConfig.argsCount = !isNaN(parseInt(method[1], 10)) ? parseInt(method[1], 10) :
      method[1] && method[1] !== '[]' ? (methodConfig.isTypeCheck = true, methodConfig.types = typeArrayRegExp.exec(method[1])[1].replace(/ /g, '').split(','), (methodConfig.types[0]) ? methodConfig.types.length : 0) : 0;

      self.methods.push(methodConfig);
    }
  }

  JSgoodies.Interface = JSgoodies.Interface || Interface;
})(window, window.JSgoodies);
