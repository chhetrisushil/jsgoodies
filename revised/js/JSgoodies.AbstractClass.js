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

      var isSuperCalled = /this\._super\(.*\)/g.test((props.constructor || new Function()).toString()); //jshint ignore: line

      var _parent = this,
        Child = function() {
          var ret,
            tmp = this._super;

          if (utility.hasProperty(props, 'constructor') && utility.isFunction(props.constructor)) {
            if (isSuperCalled) {
              this._super = (_parent !== abstractConstructor) ? _parent : undefined; //jshint ignore: line
            } else {
              _parent !== abstractConstructor && _parent.apply(this, arguments); //jshint ignore: line
            }
            ret = props.constructor.apply(this, arguments);

            this._super = tmp;
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
