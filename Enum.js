(function(W, EU) {
    "use strict";

    /*
     * Please define all private variable here
     */
    var toString = Object.prototype.toString,
        slice = Array.prototype.slice,
        hasProp = Object.prototype.hasOwnProperty,
        typeOf = function typeOf(type) {
            var regEx = new RegExp('\\[object ' + type + '\\]', 'i');

            return function(variable) {
                return regEx.test(toString.call(variable));
            };
        },
        console = console || {},
        noop = function noop() {},
        consoleMethodList = ['log', 'warn', 'info', 'error', 'trace', 'clear'],
        hasOwnProperty, extend, isString, isArray, isFunction, isObject,
        isBoolean, ajax, ajaxGet, ajaxPost, toArray, assert, each;

    //populate console with noop methods if method not present from the list already
    consoleMethodList.forEach(function(method) {
        if (!console[method]) {
            console[method] = noop;
        }
    });

    function Utility() {
        this.win = window;
        this.doc = window.document;
        this.windowCtx = window;
    }

    var p = Utility.prototype;

    /**
     * @function
     */
    isString = p.isString = typeOf('String');

    /**
     * @function
     */
    isFunction = p.isFunction = typeOf('Function');

    /**
     * @function
     */
    isObject = p.isObject = typeOf('Object');

    /**
     * @function
     */
    isArray = p.isArray = typeOf('Array');

    /**
     * @function
     */
    isBoolean = p.isBoolean = typeOf('Boolean');

    /**
     * @function
     */
    hasOwnProperty = p.hasProperty = function hasOwnProperty(obj, prop) {
        return hasProp.call(obj, prop);
    };

    /**
     * Converts Array LIKE objects to Array
     *
     * @param obj {Object}: Array LIKE object
     * @return {Array}: Array
     */
    toArray = p.toArray = function(obj) {
        return slice.call(obj, 0);
    };

    /**
     * Changes first letters of space separated string to capital
     * e.g. utility.toCapital('text to be camel case') //TextToBeCamelCase
     *
     * @param str {String}: to be converted to camel case
     * @return {String}: converted string
     */
    p.toCapital = function toCapital(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
            if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
            return match.toUpperCase();
        });
    };

    /**
     * Basic implementation of deprecate
     * TODO:Enhance the deprecator
     *
     * @param msg {String}: Warning message
     * @return {undefined}
     */
    p.deprecate = function deprecate(msg) {
        console.warn(msg);
    };

    /**
     * This method provides a way to access properties of the sub-level using dot separated strings
     *
     * @param obj {Object}: Of which property is to be accessed
     * @param propStr {String}: a hierarchical string to access the property value
     * @return {*} Value of the property hierarchy
     */
    p.getProperty = function getProperty(obj, propStr) {
        if (!/(\(|\))/ig.test(propStr)) {
            return new Function('o', 'return o.' + propStr)(obj); //jshint ignore: line
        } else {
            console.warn('Please provide a valid property accessor');
        }
    };

    /**
     * This method help compose series of functions
     *
     * @return {undefined}
     */
    p.compose = function() {
        var funcs = arguments,
            length = funcs.length;
        return function() {
            var idx = length - 1,
                result = funcs[idx].apply(this, arguments);
            while (idx--) {
                result = funcs[idx].call(this, result);
            }
            return result;
        };
    };

    /**
     * This method helps curry a function
     *
     * @param fn {Function}: Function to be curried
     * @return {undefined}
     */
    p.curry = function(fn) {
        var numargs = fn.length;

        function createRecurser(acc) {
            return function() {
                var args = [].slice.call(arguments);
                return recurse(acc, args);
            };
        }

        function recurse(acc, args) {
            /*jshint validthis: true*/
            var newacc = acc.concat(args);

            if (newacc.length < numargs) {
                return createRecurser(newacc);
            }

            return fn.apply(this, newacc);
        }

        return createRecurser([]);
    };

    /**
     * Uitlity to loop through objects (similar to Array.prototype.forEach)
     *
     * @param obj {Object}: Object to loop through
     * @param callback {Function}: Callback method to be called on every item
     * @return {undefined}
     */
    each = p.each = function (obj, callback) {
        var i;

        assert(isObject(obj), 'each Can only be called on Object');
        assert(isFunction(callback), 'Provide a callback');

        for (i in obj) {
            if (hasOwnProperty(obj, i)) {
                callback(obj[i], i, obj);
            }
        }
    };

    /**
     * query parameter parser
     *
     * @param paramStr {String}: An optional parameter string
     *                         (If not passed `location.search` will be used by
     *                          default)
     * @return {Object}: A map of parsed query parameters
     */
    p.getQueryParamter = function getQueryParamter(paramStr) {
        paramStr = paramStr || W.location.search;
        paramStr = paramStr.indexOf('?') === 0 ? paramStr.substring(1) :
            paramStr;

        var cache = getQueryParamter.cache || (getQueryParamter.cache = {}),
            paramMap = cache[paramStr],
            paramList = paramStr.split('&');

        if (!paramMap) {
            paramMap = {};
            paramList.forEach(function(val) {
                val = val.split('=');
                paramMap[decodeURIComponent(val[0])] = decodeURIComponent(val[1]);
            });

            getQueryParamter.cache[paramStr] = paramMap;
        }

        return getQueryParamter.cache[paramStr];
    };

    /**
     * Method to assert statements
     *
     * @param test {Function | *}: test to perform to check assertion
     * @param msg {String}: Message if the assertion fails
     * @throws Error
     */
    assert = p.assert = function assert(test, msg) {
        var exception = false;

        if (isFunction(test)) {
            exception = !test();
        } else {
            exception = !test;
        }

        if (exception) {
            throw new Error('Assertion Failed: ' + msg);
        }
    };

    p.getRunTimeAdConfig = function(ad_sec_cfg, tag_options, name) {
        var value = tag_options[name] ? tag_options[name] : ad_sec_cfg.teaser[name];
        return value;
    };

    p.setWindowContext = function(win) {
        this.windowCtx = win || window;
        this.doc = this.windowCtx.document;
    };

    p.getElement = function(id, win) {
        if (typeof win !== "undefined") {
            return win.document.getElementById(id);
        }

        return this.doc.getElementById(id);
    };

    /**
     * Extends the properties of parent object to child object.
     * If property is already present in child and is of type Function
     * adds an _super accessor to access parent's method (base method).
     *
     * @param child {Object}
     * @param parent {Object}
     * @return {Object} Returns an extended object
     */
    extend = p.extend = function(child, parent) {
        var closure = function(p, fn) {
            return function() {
                var tmp = child._super;

                child._super = parent[p];

                var ret = fn.apply(child, arguments);

                child._super = tmp;

                return ret;
            };
        };

        for (var name in parent) {
            child[name] = (hasOwnProperty(child, name) &&
                    isFunction(child[name]) &&
                    isFunction(parent[name])) ?
                closure(name, child[name]) :
                hasOwnProperty(child, name) ?
                child[name] : isArray(parent[name]) ?
                parent[name].concat() :
                isObject(parent[name]) ?
                extend(parent[name], {}) :
                parent[name];
        }

        return child;
    };

    /**
     * This method does inheriting of methods and properties
     *
     * @param child {Object}: Generally this is the prototype object
     * @param parent {Object}: New method object
     * @return {child} Child with inherited methods and properties
     */
    p.inherit = function inherit(child, parent) {
        var closure = function(p, fn) {
            return function() {
                var tmp = this._super;

                this._super = fn;

                var ret = parent[p].apply(this, arguments);

                this._super = tmp;

                return ret;
            };
        };

        for (var name in parent) {
            child[name] = (isFunction(child[name]) &&
                    isFunction(parent[name])) ?
                closure(name, child[name]) :
                parent[name];
        }

        return child;
    };

    /**
     * No operations method
     *
     * @return {undefined}
     */
    p.noop = function() {};

    //TODO: Needs enhancement to handle more complex scenarios
    /**
     * Facade for making ajax calls
     *
     * @param url {String}: Valid url of the resource
     * @param method {String}: type of request to the server
     * @param params {*}: data to send to the server
     * @callback cb: Callback to be called after the resource is loaded
     * @return {undefined}
     */
    ajax = p.ajax = function(url, method, params, cb) {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);

        xhr.onreadystatechange = function() {
            //cover status code ranging from 200 to 399
            //which covers cached response, successful response
            //moved permanently or temporarily etc.
            //400 and beyond is error
            if (xhr.status >= 200 && xhr.status < 400 && xhr.readyState === 4) {
                var div = document.createElement('div'), //stub div to write the response data
                    scripts, scriptLen, loadedCount = 0,
                    executeCallback = function executeCallback() {
                        if (loadedCount === scriptLen) {
                            //once done with the script processing call the callback with
                            //response and the xhr object
                            // cb(div.innerHTML, xhr);
                        }
                    };

                // writing the response to the div
                div.innerHTML = xhr.responseText;

                //gather all the script tags that came in response
                scripts = div.getElementsByTagName('script');
                scripts = Array.prototype.slice.call(scripts, 0);

                scriptLen = scripts.length;

                //convert node list to type array
                scripts.forEach(function(item) {
                    //scripts don't execute if appended using innerHTML
                    //hence extract them and append them with a new script tag
                    //for them to get executed and then remove the original one's
                    var sTag = document.createElement('script');

                    sTag.type = 'text/javascript';
                    if (item.src) {
                        sTag.src = item.src;
                        sTag.onload = function scriptLoadedCheck() {
                            ++loadedCount;
                            // executeCallback();
                        };
                    } else {
                        sTag.innerHTML = item.innerHTML;
                        ++loadedCount;
                        // executeCallback();
                    }

                    document.body.appendChild(sTag);

                    item.parentNode.removeChild(item);
                });
                cb(div.innerHTML, xhr);
            }
        };

        xhr.send(params);
    };

    /**
     * Makes an Ajax call with method "GET" always
     *
     * @param url {String}: Valid url of the resource
     * @callback cb: Callback to be called after the resource is loaded
     * @return {undefined}
     */
    ajaxGet = p.ajax.get = function(url, cb, params) {
        this(url, 'GET', params, cb);
    };

    /**
     * Makes an Ajax call with method "POST" always
     *
     * @param url {String}: Valid url of the resource
     * @param params {*}: Data to send to the server
     * @callback cb: Callback to be called after the resource is loaded
     * @return {undefined}
     */
    ajaxPost = p.ajax.post = function(url, params, cb) {
        this(url, 'POST', params, cb);
    };

    p.createSameDomainIframeNode = function(iframeID, width, height, callback) {
        var rnd = (new Date()).getTime() % 20000001 + parseInt(Math.random() * 10000, 10);
        var win = this.windowCtx;
        iframeID += rnd;
        if (win.document.getElementById(iframeID) === undefined) {
            var iframe = document.createElement('iframe');
            iframe.setAttribute("frameBorder", "0");
            iframe.setAttribute("allowtransparency", "true");
            iframe.setAttribute("marginheight", "0");
            iframe.setAttribute("marginwidth", "0");
            iframe.setAttribute("scrolling", "no");
            iframe.setAttribute("width", width);
            iframe.setAttribute("height", height);
            iframe.setAttribute("hspace", "0");
            iframe.setAttribute("vspace", "0");
            iframe.setAttribute("id", iframeID);
            if (width === 0 && height === 0) {
                iframe.setAttribute("style", "position:absolute; top:-15000px; left:-15000px;");
            }
            win.document.body.appendChild(iframe);
        }
        setTimeout(function() {
            var frame = this.windowContext.document.getElementById(iframeID);
            callback(frame);
        }, 10);
    };

    p.writeContentInIframe = function(iframeNode, content) {
        var win = this.windowCtx;
        if (iframeNode) {
            var idoc = iframeNode.contentWindow;

            idoc.contents = content;

            /*jshint scripturl: true*/
            idoc.location.replace('javascript:window["contents"]');
        }
    };

    p.createElement = function(type, attrs, style) {
        var ele = document.createElement(type),
            attr_name;

        for (attr_name in attrs) {
            ele.setAttribute(attr_name, attrs[attr_name]);
        }
        if (style) {
            ele.setAttribute('style', style);
        }
        return ele;
    };

    p.setStyle = function(ele, attrs) {
        var attr_name;

        for (attr_name in attrs) {
            ele.style[attr_name] = attrs[attr_name];
        }
    };

    p.setAttribute = function(ele, attrs) {
        var attr_name;

        for (attr_name in attrs) {
            ele.setAttribute(attr_name, attrs[attr_name]);
        }
    };

    p.insertChild = function(parent, elementObj, afterElement) {
        if (parent || elementObj) {
            return;
        } else if (typeof(elementObj) === "string" && (typeof(afterElement) === "undefined" || typeof(afterElement) === null)) {
            parent.innerHTML = elementObj;
        } else if (typeof(afterElement) === "undefined" || typeof(afterElement) === null) {
            parent.appendChild(elementObj);
        } else if (typeof(afterElement) !== "undefined" && typeof(afterElement) !== null) {
            parent.insertBefore(elementObj, afterElement);
        }
    };

    p.getBody = function() {
        return this.doc.body || this.doc.documentElement;
    };

    p.override = function(target, source) {
        var key;

        for (key in target) {
            if (source[key] && target.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    };

    p.attachEvent = function(ele, event_name, callback) {
        if (window.addEventListener) {
            ele.addEventListener(event_name, callback, false);
        } else if (window.attachEvent) {
            ele.attachEvent("on" + event_name, callback);
        } else if (window.onLoad) {
            ele[event_name] = callback;
        }
    };

    p.detachEvent = function(ele, event_name, callback) {
        if (window.removeEventListener) {
            ele.removeEventListener(event_name, callback, false);
        } else {
            ele.detachEvent("on" + event_name, callback);
        }
    };

    p.createCustomEvent = function(el, eventType) {
        var customEvent;
        if (el.createEvent) {
            customEvent = el.createEvent('HTMLEvents');
            customEvent.initEvent(eventType, true, true);
        } else if (el.createEventObject) { // IE < 9
            customEvent = el.createEventObject();
            customEvent.eventType = eventType;
        }
        customEvent.eventName = eventType;
        return customEvent;
    };

    p.triggerCustomEvent = function(el, event) {
        if (el.dispatchEvent) {
            //                    alert('dipatchEvent defined');
            el.dispatchEvent(event);
        } else if (el.fireEvent && htmlEvents['on' + event.eventType]) { // IE < 9
            el.fireEvent('on' + event.eventType, event); // can trigger only real event (e.g. 'click')
        } else if (el[event]) {
            el[event]();
        } else if (el['on' + event.eventType]) {
            el['on' + event.eventType]();
        }
    };

    p.constructDefaultPath = function() {
        if (arguments.length) {
            var filePath = arguments[0];
            var media = arguments[1] || {};
            var dir = arguments[2] || "l";

            if ((/^http(s)*:\/\//i.test(filePath))) {
                return filePath;
            }
            if (media.dir && media.dir.indexOf("$") >= 0) {
                media.dir = "";
            }
            if (media.manifestDir && media.manifestDir.indexOf("$RICHMEDIA") >= 0) {
                media.manifestDir = "";
            }
            if (dir == "l") {
                return media.dir + filePath;
            }
            if (dir == "c") {
                return media.manifestDir + filePath;
            }

        }
    };

    p.constructMediaPaths = function(manifest, media, rendering_type) {
        if (media.dir == "$LOC$") {
            media.dir = "";
        }

        if (media.parseDir == "$LOCPARSE$") {
            media.parseDir = "";
        }

        if (media.manifestDir.indexOf("$RICHMEDIA") >= 0) {
            media.manifestDir = "";
        }

        manifest = manifest[rendering_type];

        var length = manifest.length;

        for (var i = 0; i < length; i++) {
            if (!(/^http(s)*:\/\//i.test(manifest[i].src)) && (!manifest[i].dir || manifest[i].dir === 'l')) {
                manifest[i].src = media.dir + manifest[i].src;
            } else if (!(/^http(s)*:\/\//i.test(manifest[i].src)) && manifest[i].dir === 'c') {
                manifest[i].src = media.manifestDir + manifest[i].src;
            }
        }
    };

    p.getCssPropertyValue = function(el, property) {
        var value;

        if (this.doc.defaultView) {
            value = this.doc.defaultView.getComputedStyle(el, "").getPropertyValue(property);
        } else {
            value = el.currentStyle.property;
        }

        return value;
    };

    p.isFloatNeeded = function(element) {
        if (typeof(element) == "undefined") {
            return;
        }

        var isFloatNeeded = false;

        while (element.parentNode) {
            if (element.tagName.toString().toLowerCase() === "body") {
                break;
            }

            element = element.parentNode;

            var overflow = this.getCssProperty(element, "overflow");

            if (overflow === undefined || overflow === "" || overflow === null || typeof(overflow) === "undefined") {
                overflow = this.getCssProperty(element, "overflowX");

                if (overflow === undefined || overflow === "" || overflow === null || typeof(overflow) === "undefined") {
                    overflow = this.getCssProperty(element, "overflowY");
                }
            }

            if (overflow === "hidden" || overflow === "scroll" || overflow === "auto") {
                isFloatNeeded = true;
                break;
            } else {
                var position = this.getCssProperty(element, "position");

                if (position !== undefined && position !== "" && position !== null && typeof(position) !== "undefined" && position === "relative") {
                    isFloatNeeded = true;
                    break;
                }
            }
        }

        return isFloatNeeded;
    };

    p.getCssProperty = function(el, prop) {
        if (typeof(el) == "undefined" || typeof(prop) == "undefined") {
            return;
        }
        var value;
        var cssStyle;
        if (this.doc.defaultView) {
            try {
                cssStyle = this.doc.defaultView.getComputedStyle(el, "");
            } catch (e) {}
            if (cssStyle) {
                value = cssStyle[prop];
            }
        } else {
            value = el.currentStyle[prop];
        }
        return value;
    };

    p.getElementWidth = function(element) {
        return element.clientWidth;
    };

    p.getElementHeight = function(element) {
        return element.clientHeight;
    };

    p.getElementPosition = function(element, win) {
        try {
            var elementPosition = {};
            if (typeof(element.getBoundingClientRect) !== "undefined") {
                elementPosition = element.getBoundingClientRect();
            }
            return elementPosition;
        } catch (e) {
            console.log(e);
        }

    };

    //for both Chrome/Mozilla & IE/Opera
    p.getElementOffset = function(element) {
        var elementX = 0;
        var elementY = 0;
        while (element) {
            elementX += element.offsetLeft;
            elementY += element.offsetTop;
            element = element.offsetParent;
        }
        return {
            "x": elementX,
            "y": elementY
        };
    };

    p.getElementCordinate = function(element) {
        var t = {};
        var cordinate = this.getElementOffset(element);
        t.topLeft = {
            "x": cordinate.x,
            "y": cordinate.y
        };
        t.topRight = {
            "x": (cordinate.x + 970),
            "y": cordinate.y
        };
        t.bottomLeft = {
            'x': cordinate.x,
            'y': cordinate.y + 250
        };
        t.bottomRight = {
            'x': cordinate.x + 970,
            'y': cordinate.y + 250
        };
        t.width = 970;
        t.height = 250; // not able to get element height.
        return t;
    };

    p.isInView = function(element) {
        var tfPage = {};
        tfPage.topLeft = this.getViewportTopLeft();
        tfPage.topRight = this.getViewportTopRight();
        tfPage.bottomLeft = this.getViewportBottomLeft();
        var elementCordinate = this.getElementCordinate(element);
        return (tfPage.topLeft.x < elementCordinate.topRight.x &&
            tfPage.topRight.x > elementCordinate.topLeft.x &&
            tfPage.topLeft.y < elementCordinate.bottomLeft.y &&
            tfPage.bottomLeft.y > elementCordinate.topLeft.y);

    };

    p.getViewportTopLeft = function() {
        return {
            "x": this.getScrollX(),
            "y": this.getScrollY()
        };
    };

    p.getViewportTopRight = function() {
        return {
            "x": (this.getScrollX() + this.getViewportwidth()),
            "y": this.getScrollY()
        };
    };

    p.getViewportBottomLeft = function() {
        return {
            "x": this.getScrollX(),
            "y": (this.getScrollY() + this.getViewportHeight())
        };
    };

    p.getViewportBottomRight = function() {
        return {
            "x": (this.getScrollX() + this.getViewportwidth()),
            "y": (this.getScrollY() + this.getViewportHeight())
        };
    };

    p.getScrollX = function() {
        return (this.windowCtx.pageXOffset !== undefined) ?
            this.windowCtx.pageXOffset : (this.doc.documentElement || this.doc.body.parentNode || this.doc.body).scrollLeft;
    };

    p.getScrollY = function() {
        return (this.windowCtx.pageYOffset !== undefined) ? this.windowCtx.pageYOffset : (this.doc.documentElement || this.doc.body.parentNode || this.doc.body).scrollTop;
    };

    p.getViewportHeight = function() {
        return this.windowCtx.innerHeight || this.windowCtx.document.documentElement.clientHeight || this.windowCtx.document.body.clientHeight;
    };

    p.getViewportwidth = function() {
        return this.windowCtx.innerWidth || this.windowCtx.document.documentElement.clientWidth || this.windowCtx.document.body.clientWidth;
    };

    p.getScreenHeight = function() {
        return this.windowCtx.screen.height;
    };

    p.removeProperty = function(element, property) {
        if (element.style.removeProperty) {
            element.style.removeProperty(property);
        } else {
            element.style.removeAttribute(property);
        }
    };

    /**
     * Utility method to move element to center
     * @param element {DOMElement}
     * @return top {String}
     */
    p.moveMainUnitToCenter = function(ele) {
        var top,
            eleHeight,
            vpHeight,
            eleTop;

        if (!ele)
            return;

        this.element = ele;
        this.divTop = this.getCssProperty(ele, 'top');
        if (this.VPMAnimIntervalId) {
            //Clear VPM animation interval
            this.windowCtx.clearInterval(this.VPMAnimIntervalId);
            delete this.VPMAnimIntervalId;
        }

        //store existing location of scroll
        if (this.storeScrollX === undefined)
            this.storeScrollX = this.getScrollX();
        if (this.storeScrollY === undefined)
            this.storeScrollY = this.getScrollY();

        vpHeight = this.getViewportHeight();
        eleHeight = parseInt(this.getCssProperty(ele, 'height').split('px')[0]);
        //    eleTop = ele.getBoundingClientRect().top + this.getScrollY();
        //    top = (vpHeight < eleHeight) ? -eleTop : (vpHeight - eleHeight) / 2 - eleTop;
        top = vpHeight < eleHeight ? 0 : (vpHeight - eleHeight) / 2;
        ele.style.top = top + 'px';
    };

    /**
     * Utility method to disable page scroll
     */
    p.disableScroll = function(ele) {
        //    var containerDiv = this.getElement(id);
        this.divPosition = this.getCssProperty(ele, 'position');
        ele.style.position = 'fixed';
    };

    /**
     * Utility method to enable page scroll
     */
    p.enableScroll = function(ele) {
        //    var containerDiv = this.getElement(id);
        ele.style.position = this.divPosition;
        delete this.divPosition;
    };

    /* p.bringInView = function(element) {
      var adEl = element;
       viewPort = {},
       scrollVerticalBy = 0,
       scrollHorizontalBy = 0;
       viewPort.height = this.getViewportHeight();
            viewPort.width = this.getViewportwidth();
            viewPort.left = this.getScrollX();
            viewPort.top = this.getScrollY();
            var adRect = this.getElementOffset(adEl);
        adRect.top = adRect.y;
        adRect.left = adRect.x;
        adRect.right = adRect.x+this.getElementWidth(adEl);



            if (adRect.top < 0) {
             scrollVerticalBy = adRect.top
            } else if (adRect.bottom > viewPort.height) {
             scrollVerticalBy = adRect.bottom - viewPort.height;
            }
            if (adRect.left < 0) {
             scrollHorizontalBy = adRect.left;
            } else if (adRect.right > (viewPort.width+viewPort.left)) {
               scrollHorizontalBy = (adRect.right) - (viewPort.width) ;
            }// Adding animation effect
            // if (scrollHorizontalBy || scrollVerticalBy)
            //  var scrollDuration = 1000;
            //  var horizontalScrollStep = Math.ceil(scrollHorizontalBy / (scrollDuration / 10));
            //  var verticalScrollStep = Math.ceil(scrollVerticalBy / (scrollDuration / 10));
            //  var count = 0;


            //  scrollInterval = setInterval(function() {
            //   count++;
            //   this.windowCtx .scrollBy(horizontalScrollStep, verticalScrollStep);
            //   if (count == (scrollDuration / 10)) {
            //    clearInterval(scrollInterval);
            //   }
            //  }, 10)
           this.windowCtx .scrollBy(scrollHorizontalBy, scrollVerticalBy);

     };*/

    p.bringInView = function(ele) {
        var adEl = ele,
            viewPort = {},
            scrollVerticalBy = 0,
            scrollHorizontalBy = 0;

        viewPort.height = this.getViewportHeight();
        viewPort.width = this.getViewportwidth();
        viewPort.left = this.getScrollX();
        viewPort.top = this.getScrollY();

        if (this.isVerticalScrollbar) {
            viewPort.width -= 17;
        }

        if (this.isHorizontalScrollbar) {
            viewPort.height -= 17;
        }

        var adRect = this.getElementPosition(adEl);

        if (adRect.top < 0) {
            scrollVerticalBy = adRect.top;
        } else if (adRect.bottom > viewPort.height) {
            scrollVerticalBy = (adRect.bottom - viewPort.height);
        }

        if (adRect.left < 0) {
            scrollHorizontalBy = adRect.left;
        } else if (adRect.right > viewPort.width) {
            scrollHorizontalBy = (adRect.right - viewPort.width);
        }

        // Adding animation effect
        /* if (scrollHorizontalBy || scrollVerticalBy)
          var scrollDuration = 1000;
          var horizontalScrollStep =(scrollHorizontalBy / (scrollDuration / 10));
          var verticalScrollStep = (scrollVerticalBy / (scrollDuration / 10));
          var count = 0;


          scrollInterval = setInterval(function() {
           count++;
           window.scrollBy(horizontalScrollStep, verticalScrollStep);
           if (count == (scrollDuration / 10)) {
            clearInterval(scrollInterval);
           }
          }, 10)*/
        this.windowCtx.scrollBy(scrollHorizontalBy, scrollVerticalBy);
    };

    /***
     *
     * @param url
     */
    p.getOrigin = function(url) {
        var match = url.match(/^(http?):\/\/([A-Z\d\.-]{2,})\.([A-Z]{2,})(:\d{2,4})?/i);
        return match[0];
    };

    /**
     * Utility method to reset the scroll and move page to its actual position
     */
    p.isVerticalScrollbar = function() {
        var root = this.windowCtx.document.compatMode == 'BackCompat' ? this.windowCtx.document.body : this.windowCtx.document.documentElement;
        return root.scrollHeight > root.clientHeight;

    };

    p.isHorizontalScrollbar = function() {
        var root = this.windowCtx.document.compatMode == 'BackCompat' ? this.windowCtx.document.body : this.windowCtx.document.documentElement;

        return root.scrollWidth > root.clientWidth;
    };

    p.resetScroll = function() {
        this.element.style.top = this.divTop;
        this.windowCtx.scrollTo(this.storeScrollX, this.storeScrollY);

        delete this.storeScrollX;
        delete this.storeScrollY;
        delete this.element;
        delete this.divTop;
    };

    p.moveVPMToCenter = function(ele, VPMSpeedPerMs) {
        if (!ele)
            return;

        var top,
            eleHeight,
            vpHeight,
            eleTop,
            scrollTop,
            temp,
            counter = 0,
            that = this;

        this.storeScrollX = this.getScrollX();
        this.storeScrollY = this.getScrollY();

        vpHeight = this.getViewportHeight();
        if (this.getCssProperty(ele, 'clipBottom')) {
            eleHeight = parseInt(this.getCssProperty(ele, 'clipBottom').split('px')[0]);
        } else {
            eleHeight = parseInt(this.getCssProperty(ele, 'clip').split(' ')[2].split('px')[0]);
        }
        eleTop = ele.getBoundingClientRect().top;

        if (vpHeight < eleHeight) {
            top = eleTop;
        } else {
            top = (vpHeight - eleHeight) / 2 - eleTop;
            top = -top;
        }

        temp = top > 0 ? top : -top;

        this.VPMAnimIntervalId = this.windowCtx.setInterval(function() {
            if (counter <= temp) {
                counter += VPMSpeedPerMs;
                that.windowCtx.scrollBy(0, top >= 0 ? VPMSpeedPerMs : -VPMSpeedPerMs);
            } else {
                clearInterval(that.VPMAnimIntervalId);
            }
        }, 1);

    };

    EU.utility = EU.utility || new Utility();
})(window, (window.EU || (window.EU = {})));



(function(W, EU) {
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

    var utility = EU.utility;

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

        values: function () {
            var list = [];

            utility.each(this, function (val) {
                list.push(val);
            });

            return list;
        }
    };

    function EnumProp(eName, _name, cParams, props, position, obj) {
        cParams = cParams || '';

        var args = cParams.indexOf(',') ? cParams.split(',') : cParams ? [cParams] : [],
            copy = utility.extend({}, props);

        delete copy.enumList;
        delete copy.constructor;

        if (utility.isObject(obj)) {
            utility.extend(this, obj);
        }

        utility.extend(this, copy);

        this.getName = function() {
            return _name;
        };

        this.ordinal = function () {
            return position;
        };

        this.constructor = props.constructor || function() {};

        this.constructor.apply(this, args);
        
        if (Object.freeze) {
            Object.freeze(this);
        }

        return this;
    }

    EU.Enum = EU.Enum || Enum;
})(window, window.EU);
