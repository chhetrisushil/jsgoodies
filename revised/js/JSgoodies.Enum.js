(function(W, JSgoodies) {
  "use strict";

  function getKey(key) {
    return checkKey(key) ? key.match(/(.+)\((.+)\)/) : [key, key, undefined];
  }

  function checkKey(key) {
    return (/\((.+)\)/g).test(key);
  }

  function handleObjectEnum(enums) {
    //jshint validthis: true
    var eName;

    enums.enumList.forEach(function(item, i) {
      var keyList;
      if (utility.isObject(item)) {
        utility.each(item, function(val, key) {
          keyList = getKey(key);
          this[keyList[1]] = new EnumProp(key, keyList[1], keyList[2], enums, i, val);
        }.bind(this));
      } else {
        //treat it like string
        keyList = getKey(item);
        this[keyList[1]] = new EnumProp(item, keyList[1], keyList[2], enums, i);
      }
    }.bind(this));

    if (Object.freeze) {
      Object.freeze(this);
    }

    return this;
  }

  var utility = JSgoodies.utility;

  /**
   * e.g. 
   *      1. enums = {
                  enumList: ['NAME(Sushil)', 'LASTNAME(Chhetri)'],
                  name: null,
                  constructor: function (name) {
                      this.name = name;
                  }
               };
   *      2. enums = {
                  enumList: [
                          {'NAME(Sushil)': {test: function () {}},
                          {'LASTNAME(Chhetri)': {test: function () {}}}
            ],
                  name: null,
                  constructor: function (name) {
                      this.name = name;
                  },
                  test: function () {}
               };
   *      3. enums = {
                  enumList: [
                          {'NAME(Sushil)': {test: function () {}},
                          'LASTNAME(Chhetri)'
            ],
                  name: null,
                  constructor: function (name) {
                      this.name = name;
                  },
                  test: function () {}
               };
   */
  function Enum(enums) {
    if (this instanceof Enum) {
      throw new Error('Cannot instantiate Enum');
    }

    return new _Enum(enums); //jshint ignore: line
  }

  function _Enum(enums) {
    /*jshint validthis: true*/
    if (utility.isObject(enums)) {
      return handleObjectEnum.call(this, enums);
    }

    throw new Error('Not a valid type');
  }

  _Enum.prototype = {
    constructor: _Enum,

    values: function() {
      var list = [];

      utility.each(this, function(val) {
        list.push(val);
      });

      return list;
    }
  };

  function EnumProp(eName, _name, cParams, props, position, obj) {
    cParams = cParams || '';

    var args = cParams.indexOf(',') ? cParams.replace(/ /g, '').split(',') : cParams ? [cParams] : [],
      copy = utility.extend({}, props);

    delete copy.enumList;
    delete copy.constructor;

    if (utility.isObject(obj)) {
      utility.extend(this, obj);
    }

    //utility.extend(this, copy);

    this.getName = function() {
      return _name;
    };

    this.ordinal = function() {
      return position;
    };

    this.constructor = props.constructor || function() {};

    utility.each(copy, function(val, key) {
      if (utility.isFunction(val)) {
        copy[key] = val.bind(this);
      }

      if (!utility.hasProperty(this, key)) {
        this[key] = val;
      }
    }.bind(this));

    this._super = copy;

    this.constructor.apply(this, args);

    if (Object.freeze) {
      Object.freeze(this);
    }

    return this;
  }

  JSgoodies.Enum = JSgoodies.Enum || Enum;
})(window, window.JSgoodies);
