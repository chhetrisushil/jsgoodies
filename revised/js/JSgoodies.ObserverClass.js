(function(W, JSgoodies) {
    "use strict";

    var ObserverClass = JSgoodies.CreateClass({
        update: function(observable) {
            throw new Error('Implement the Update method');
        }
    }).implements(JSgoodies.ObserverInterface);

    JSgoodies.ObserverClass = JSgoodies.ObserverClass || ObserverClass;
})(window, window.JSgoodies);
