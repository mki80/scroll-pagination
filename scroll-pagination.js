/*global YUI */
/**
 * A widget that makes a node's content scroll-pagination.
 *
 * @module scroll-pagination
 * @requires base
 */
YUI.add("scroll-pagination", function (Y) {

    var MODULE_ID = "Y.ScrollPagination",
        INDICATOR_CLASSNAME = "yui3-scroll-pagination-indicator",
        INDICATOR_SELECTOR  = "." + INDICATOR_CLASSNAME;

    function ScrollPagination (config) {
        ScrollPagination.superclass.constructor.apply(this, arguments);
    }

    /**
     * @property NAME
     */
    ScrollPagination.NAME = "editable";

    /**
     * @property ATTRS
     */
    ScrollPagination.ATTRS = {
        /**
         *
         * @attribute foldDistance
         * @type {Number}
         * @default 0
         */
        "foldDistance": {
            value: 0,
            validator: Y.Lang.isNumber
        },
        /**
         *
         * @attribute node
         * @type {Y.Node|String|HTML Element}
         * @default window
         */
        "node": {
            value: window,
            writeOnce: true
        },
        /**
         *
         * @attribute offset
         * @type {Number}
         * @default: 0
         */
        "offset": {
            value: 0,
            validator: Y.Lang.isNumber,
            readOnly: true
        },
        /**
         *
         * @attribute autoLoad
         * @type {Boolean}
         * @default true
         */
        "autoLoad": {
            value: true,
            validator: Y.Lang.isBoolean
        },
        /**
         *
         * @attribute isEnd
         * @type {Boolean}
         * @default false
         */
        "isEnd": {
            value: false,
            validator: Y.Lang.isBoolean
        },
        "handleRequest": {
            value: null,
            validator: Y.Lang.isFunction
        }
    };

    Y.extend(ScrollPagination, Y.Base, {
        /**
         *
         *
         * @method _check
         * @private
         * @return {Boolean} false if it reaches the end.
         */
        _check: function () {
            Y.log("_detect() is executed.", "info", MODULE_ID);
            var self = this,
                node = Y.one(INDICATOR_SELECTOR),
                position,
                needLoad;

            position = node.get("winHeight") + node.get("docScrollY");
            needLoad = (position > node.get("region")["bottom"] - self.get("foldDistance"));
            Y.log("needLoad = " + needLoad, "warn", MODULE_ID);
            return needLoad;

        },
        /**
         * It will be invoked after user instanitate a instance.
         *
         * @method initializer
         * @public
         */
        initializer: function (config) {
            Y.log("initializer() is executed.", "info", MODULE_ID);
            var self = this,
                node;
            config.node = config.node || window;

            if (config.node === window) {
                self._set("node", config.node);
                node = Y.one("body");
            } else {
                node = Y.one(config.node);
                self._set("node", node);
            }
            var el = document.createElement("div");
            var self = this;
            el.className = INDICATOR_CLASSNAME;
            el.innerHTML = "HIHIHIHI";
            node.append(el);
            if (self._check()) {
                self.get("handleRequest")();
            }
            Y.one(window).on("scroll", function () {
                Y.log("scroll");
                if (self._check()) {
                    self.get("handleRequest")();
                }
            });
            Y.on("windowresize", function () {
                if (self._check()) {
                    self.get("handleRequest")();
                }
            });
        }

    });

    // Promote to YUI environment.
    Y.ScrollPagination = ScrollPagination;


}, "0.0.1", {"requires": ["base", "node", "event-resize"]});
