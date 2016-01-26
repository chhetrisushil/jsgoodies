/*
 * JSgoodies.AbstractClass.js
 * Copyright (C) 2016 chhetrisushil <chhetrisushil@gmail.com>
 *
 * Distributed under terms of the MIT license.
 */
(function(W, JSgoodies) {
  "use strict";
  var utility = JSgoodies.utility,
    abstractConstructor = function() {
      throw new Error('Trying to instantiate an Abstract Class');
    },
    extend = function extend(props) {
      props = props || {};

      var _parent = this,
        Child = function() {
          var ret;

          if (utility.hasProperty(props, 'constructor') && utility.isFunction(props.constructor)) {
            _parent !== abstractConstructor && _parent.apply(this, arguments); //jshint ignore: line
            ret = props.constructor.apply(this, arguments);
          } else if (_parent !== abstractConstructor) {
            ret = _parent.apply(this, arguments);
          }

          return ret;
        },
        Surrogate = function() {
          this.constructor = Child;
        };

      Surrogate.prototype = _parent.prototype;

      Child.prototype = new Surrogate();

      utility.inherit(Child.prototype, props);

      Child.extend = extend;
      Child.implements = utility.implements;

      return Child;
    };

  var AbstractClass = JSgoodies.CreateClass({
    constructor: abstractConstructor
  });

  AbstractClass.extend = extend;

  JSgoodies.AbstractClass = JSgoodies.AbstractClass || AbstractClass;
})(window, window.JSgoodies);
