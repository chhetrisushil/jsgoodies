/*
 * JSgoodies.Class.js
 * Copyright (C) 2016 chhetrisushil <chhetrisushil@gmail.com>
 *
 * Distributed under terms of the MIT license.
 */
(function(W, JSgoodies) {
  "use strict";

  var utility = JSgoodies.utility,
    extend = function extend(props) {
      props = props || {};

      var isSuperCalled = /this\._super\(.*\)/g.test((props.constructor || new Function()).toString()); //jshint ignore: line

      var _parent = this,
        Child = function() {
          var ret,
            tmp = this._super;

          if (utility.hasProperty(props, 'constructor') && utility.isFunction(props.constructor)) {
            if (isSuperCalled) {
              this._super = _parent;
            } else {
              _parent.apply(this, arguments);
            }

            ret = props.constructor.apply(this, arguments);

            this._super = tmp;
          } else {
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

  function CreateClass(props) {
    props = props || {};

    var Class;

    if (utility.hasProperty(props, 'constructor') && utility.isFunction(props.constructor)) {
      Class = props.constructor;
    } else {
      Class = function() {
        if (this.init) {
          this.init.apply(this, arguments);
        }
      };
    }

    Class.prototype = utility.extend({}, props);

    Class.prototype.constructor = Class;

    Class.extend = extend;
    Class.implements = utility.implements;

    return Class;
  }

  JSgoodies.CreateClass = JSgoodies.CreateClass || CreateClass;
})(window, window.JSgoodies);
