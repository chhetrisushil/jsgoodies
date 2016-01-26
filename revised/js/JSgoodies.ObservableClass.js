/*
 * JSgoodies.ObservableClass.js
 * Copyright (C) 2016 chhetrisushil <chhetrisushil@gmail.com>
 *
 * Distributed under terms of the MIT license.
 */
(function(W, JSgoodies) {
  "use strict";

  var utility = JSgoodies.utility,
    ObservableClass = JSgoodies.CreateClass({
      constructor: function() {
        this.__observers__ = [];
        this.__changed__ = false;
      },

      addObserver: function(observer) {
        utility.assert(observer instanceof JSgoodies.ObserverClass, 'Please provide instance of EU.ObserverClass');
        this.__observers__.push(observer);
      },

      removeObserver: function(observer) {
        utility.assert(observer instanceof JSgoodies.ObserverClass, 'Please provide instance of EU.ObserverClass');
        this.__observers__ = this.__observers__.filter(function(obs) {
          return observer !== obs;
        });
      },

      notifyObservers: function() {
        if (!this.__changed__) {
          return;
        }

        var args = utility.toArray(arguments);

        args.unshift(this);

        this.__observers__.forEach(function(observer) {
          observer.update.apply(observer, args);
        });

        this.__changed__ = false;
      },

      notify: function() {
        this.setChanged();
        this.notifyObservers.apply(this, arguments);
      },

      setChanged: function() {
        this.__changed__ = true;
      },

      clearChanged: function() {
        this.__changed__ = false;
      },

      hasChanged: function() {
        return this.__changed__;
      },

      countObservers: function() {
        return this.__observers__.length;
      }
    });

  JSgoodies.ObservableClass = JSgoodies.ObservableClass || ObservableClass;
})(window, window.JSgoodies);
