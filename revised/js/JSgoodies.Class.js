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

      var _parent = this,
        Child = function() {
          var ret;

          if (utility.hasProperty(props, 'constructor') && utility.isFunction(props.constructor)) {
            _parent.apply(this, arguments);
            ret = props.constructor.apply(this, arguments);
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

    return Class;
  }

  JSgoodies.CreateClass = JSgoodies.CreateClass || CreateClass;
})(window, window.JSgoodies);
