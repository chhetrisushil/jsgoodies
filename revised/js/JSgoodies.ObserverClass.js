(function(W, JSgoodies) {
    "use strict";

    var ObserverClass = JSgoodies.CreateClass({
        update: function() {
            throw new Error('Implement the Update method');
        }
    });

    JSgoodies.ObserverClass = JSgoodies.ObserverClass || ObserverClass;
})(window, window.JSgoodies);
