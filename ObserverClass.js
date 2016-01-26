(function(W, EU) {
    "use strict";

    var ObserverClass = EU.CreateClass({
        update: function() {
            throw new Error('Implement the Update method');
        }
    });

    EU.ObserverClass = EU.ObserverClass || ObserverClass;
})(window, window.EU);
