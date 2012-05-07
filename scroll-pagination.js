/*global YUI, window */
/**
 * A widget that makes a page or a division can dynamically load data
 * by mouse scrolling without clicking any links.
 * It has various namings such as Continuous Scrolling, Infinite Scroll,
 * and the name we use, Scroll Pagination.
 *
 * @module scroll-pagination
 * @requires base
 */
YUI.add("scroll-pagination", function (Y) {

    var MODULE_ID           = "Y.ScrollPagination",
        INDICATOR_CLASSNAME = "yui3-scroll-pagination-indicator",
        LOADING_CLASSNAME   = "yui3-scroll-pagination-loading",
        CLICK_CLASSNAME     = "yui3-scroll-pagination-click",
        FINISH_CLASSNAME    = "yui3-scroll-pagination-end",
        INDICATOR_SELECTOR  = "." + INDICATOR_CLASSNAME;

    /**
     * A widget that makes a page or division can dynamically load data
     * by scrolling mouse wheel without clicking any links.
     * The UI pattern has varied namings such as Continuous Scrolling,
     * Infinite Scroll, and Scroll Pagination.
     *
     * @constructor
     * @class ScrollPagination
     * @param {Object} config attribute object
     */
    function ScrollPagination (config) {
        ScrollPagination.superclass.constructor.apply(this, arguments);
    }

    /**
     * @property NAME
     */
    ScrollPagination.NAME = "scroll-pagination";

    /**
     * @property ATTRS
     */
    ScrollPagination.ATTRS = {
        /**
         * An optional attribute.
         * If this is being set, it will be the ancestor node to append indicator.
         *
         * @attribute container
         */
        "container": {
            value: null
        },
        /**
         * Distance below the fold for which data starts to load.
         * Data doesn't start to load until the indicator is at
         * most this distance away from (or above) the fold.
         *
         * @attribute foldDistance
         * @type {Number}
         * @default 100
         */
        "foldDistance": {
            value: 100,
            validator: Y.Lang.isNumber
        },
        /**
         * The indicator shows loading immediately when user
         * scrolls to the region. However, we delayed this time
         * sending to server to avoid the performance issue
         * that user scrolls too hurry.
         *
         * @attribute delay
         * @type {Number}
         * @default 500
         */
        "delay": {
            value: 500,
            validator: Y.Lang.isNumber
        },
        /**
         * The scrolling region.
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
         * Set the autoLoad attribute to make this control
         * like 'more' link. In our scenario we only want
         * user has scrolling loading for 5 times.
         * To achieve this, set this value during instance level.
         *
         * @attribute autoLoad
         * @type {Boolean}
         * @default true
         */
        "autoLoad": {
            value: true,
            validator: Y.Lang.isBoolean,
            setter: function (value) {
                if (value) {
                    return value;
                }
                Y.log("The setter of autoLoad attribute is invoked.", "info", MODULE_ID);
                var node = Y.one(INDICATOR_SELECTOR);
                node.setContent("<a href=\"javascript:void(0);\" class=\"more-link\">Show more notifications</a>");
                node.addClass(CLICK_CLASSNAME);
                return value;
            }
        },
        /**
         * Set this value if you want stop loading data from server.
         *
         * @attribute isEnd
         * @type {Boolean}
         * @default false
         */
        "isEnd": {
            value: false,
            validator: Y.Lang.isBoolean,
            setter: function (value) {
                if (!value) {
                    return value;
                }
                Y.log("The setter of isEnd attribute is invoked.", "info", MODULE_ID);
                var self = this,
                    node = Y.one(INDICATOR_SELECTOR);
                self._set("autoLoad", false);
                node.removeClass(CLICK_CLASSNAME);
                node.addClass(FINISH_CLASSNAME);
                node.setContent(self.NO_DATA_TEMPLATE);
                return value;
            }
        },
        /**
         * A required attribute which helps this widget to set
         * Y.DataSource.IO instance for you to load data.
         * Currently this widget only support AJAX with JSON data.
         * Check YUI DataSource to get more information.
         *
         *     data: {
         *         source: "ajax.php",
         *         schema: {
         *             metaFields: {
         *                 count: "result.count",
         *                 last_id: "result.last_id",
         *                 last_timestamp: "result.last_timestamp",
         *                 html: "result.html"
         *             }
         *         },
         *         request: "?page=1&r=" + parseInt(new Date().getTime(), 10)
         *     }
         *
         * @attribute isEnd
         * @type {Boolean}
         * @default false
         */
        "data": {
            value: null,
            setter: function (value) {
                var request = value.request || "";
                if (!this._dataSource) {
                    this._dataSource = new Y.DataSource.IO({
                        source: value.source
                    }).plug(Y.Plugin.DataSourceJSONSchema, {schema: value.schema});
                }
                this._request = request;
                return value;
            },
            validator: function (value) {
                if (!Y.Lang.isObject(value)) {
                    return false;
                }
                if (
                    Y.Lang.isUndefined(value.schema) ||
                    Y.Lang.isUndefined(value.source)
                ) {
                    return false;
                }
                return true;
            }
        }
    };

    Y.extend(ScrollPagination, Y.Base, {
        /**
         * @property LOADING_TEMPLATE
         * @public
         */
        LOADING_TEMPLATE : "<p>Loading...</p>",
        /**
         * @property NO_DATA_TEMPLATE
         * @public
         */
        NO_DATA_TEMPLATE  : "<p>No more data</p>",
        /**
         * @property MORE_LINK_TEMPLATE
         * @public
         */
        MORE_LINK_TEMPLATE: "<a href=\"javascript:void(0);\" class=\"more-link\">Show more notifications</a>",
        /**
         * @property INDICATOR_TEMPLATE
         * @public
         */
        INDICATOR_TEMPLATE: [
            "<div class=\"" + INDICATOR_CLASSNAME + "\">",
                "<a href=\"javascript:void(0);\" class=\"more-link\">Show more notifications</a>",
            "</div>"
        ].join(""),
        /**
         * The Y.DataSource.IO instance runs inside.
         *
         * @property _dataSource
         * @private
         */
        _dataSource: null,
        _handlers: [],
        /**
         * The flag to check whether it still processes loading.
         *
         * @property _isLock
         * @private
         */
        _isLock: false,
        /**
         * Handles when user has page scrolling.
         * It decides whether or not to load data from server.
         *
         * @event _scrollHandler
         * @private
         */
        _scrollHandler: function () {
            if (this._isLock || !this.get("autoLoad")) {
                return;
            }
            Y.log("scrollHandler() is executed.", "info", MODULE_ID);
            var self = this,
                node,
                posScroll,
                posLoad,
                needLoad;

            node = Y.one(INDICATOR_SELECTOR);
            if (self.get("node")._node === window) {
                posScroll = node.get("winHeight") + node.get("docScrollY");
            } else {
                posScroll = self.get("node").get("scrollHeight") + self.get("node").get("scrollTop");
            }
            posLoad  = node.get("region").bottom - self.get("foldDistance");
            needLoad = (posScroll > posLoad);
            if (!needLoad) {
                return;
            }
            if (!self.get("data")) {
                Y.log("_scrollHandler() - Oops! You must define the 'data' attribute.");
                return;
            }
            node.removeClass(CLICK_CLASSNAME);
            node.addClass(LOADING_CLASSNAME);
            node.setContent(self.LOADING_TEMPLATE);
            if (self.get("delay")) {
                Y.later(self.get("delay"), self, self._makeRequest);
            } else {
                self._makeRequest();
            }
            self._isLock = true;

        },
        /**
         * Make request to server.
         * It triggers load event when we make request successfully.
         *
         * @method _makeRequest
         * @private
         */
        _makeRequest: function () {
            Y.log("_makeRequest() is executed.", "info", MODULE_ID);
            var self = this;
            self._dataSource.sendRequest({
                request: self._request,
                callback: {
                    success: function (o) {
                        self.fire("load", o.response);
                        self._isLock = false;
                        Y.one(INDICATOR_SELECTOR).removeClass(LOADING_CLASSNAME);
                        if (!self.get("autoLoad") && !self.get("isEnd")) {
                            Y.one(INDICATOR_SELECTOR).setContent(self.MORE_LINK_TEMPLATE);
                            Y.one(INDICATOR_SELECTOR).addClass(CLICK_CLASSNAME);
                        }
                    },
                    failure: function (e) {
                        self.fire("fail", e.error);
                        Y.log("Error - " + e.error.message, "error", MODULE_ID);
                    }
                }
            });
        },
        destructor: function () {
            var self = this;
            Y.each(self._handlers, function (handler) {
                handler.detach();
            });
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
                container,
                node;

            node = config.node || window;
            container = config.container || null;

            if (config.data) {
                self.set("data", config.data);
            }

            // Bind Events.
            if (node === window) {
                self._set("node", Y.one(node));
                self._handlers.push(Y.one(node).on("scroll", self._scrollHandler, self));
                self._handlers.push(Y.on("windowresize", self._scrollHandler, self));
                node = Y.one("body");
            } else {
                node = Y.one(node);
                if (!node) {
                    return;
                }
                self._set("node", Y.one(node));
                self._handlers.push(node.on("scroll", self._scrollHandler, self));
            }

            // Render UI.
            container = container || node;
            if (!container.one(INDICATOR_SELECTOR)) {
                container.append(self.INDICATOR_TEMPLATE);
            }

            // Manually load from server when you set autoLoad = false.
            self._handlers.push(node.one(INDICATOR_SELECTOR).delegate("click", function () {
                var self = this,
                    node;
                node = Y.one(INDICATOR_SELECTOR);
                node.removeClass(CLICK_CLASSNAME);
                node.addClass(LOADING_CLASSNAME);
                node.setContent(self.LOADING_TEMPLATE);
                if (self.get("delay")) {
                    Y.later(self.get("delay"), self, self._makeRequest);
                } else {
                    self._makeRequest();
                }
                self._isLock = true;
            }, "a.more-link", self));

            // Initial checking.
            self._scrollHandler.call(self);

        }
    });

    // Promote to YUI environment.
    Y.ScrollPagination = ScrollPagination;


}, "0.0.1", {"requires": ["base", "node-base", "node-screen", "event-resize", "node-event-delegate", "datasource-io", "datasource-jsonschema"]});
