/*jshint browser: true */
/*globals jQuery */
;(function (factory) {
    if (typeof exports == 'object') {
        factory(require('jquery'));
    } else if (typeof define == 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    'use strict';
    var counter  = 0;
    var contexts = { };
    /**
     * Throttles the triggered DOM change events for specific elements
     *
     * @private
     * @param   {Object}    element
     */
    function jQueryDOMChangedThrottle (element) {
        var $element = $(element);
        var id       = $element.attr('id');
        if (!id) {
            id = 'jq-id-' + counter++;
            $element.attr('id', id);
        }
        contexts[id] = contexts[id] || { };
        if (!contexts[id].later) {
            contexts[id].later = function () {
                contexts[id].previous = new Date();
                contexts[id].timeout  = null;
                delete contexts[id];
                return $element.trigger('DOMChanged');
            };
        }
        var now       = new Date();
        var previous  = contexts[id].previous || now;
        var remaining = 50 - (now - previous);
        var timeout   = contexts[id].timeout || null;
        if (remaining <= 0) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            delete contexts[id];
            return $element.trigger('DOMChanged');
        } else if (!timeout) {
            timeout = setTimeout(contexts[id].later, remaining);
        }
        contexts[id].previous = previous;
        contexts[id].timeout = timeout;
    }
    /**
     * Wraps a given jQuery method and injects another function to be called
     *
     * @private
     * @param   {String}    method
     * @param   {Function}  caller
     */
    function jQueryHook (method, caller) {
        var definition = $.fn[method];
        if (definition) {
            $.fn[method] = function () {
                var args   = Array.prototype.slice.apply(arguments);
                var result = definition.apply(this, args);
                caller.apply(this, args);
                return result;
            };
        }
    }
    jQueryHook('append', function (element) {
        return jQueryDOMChangedThrottle(element);
    });
    jQueryHook('appendTo', function () {
        return jQueryDOMChangedThrottle(this);
    });
    jQueryHook('before', function (element) {
        return jQueryDOMChangedThrottle(element);
    });
    jQueryHook('after', function (element) {
        return jQueryDOMChangedThrottle(element);
    });
    jQueryHook('insertBefore', function () {
        return jQueryDOMChangedThrottle(this);
    });
    jQueryHook('insertAfter', function () {
        return jQueryDOMChangedThrottle(this);
    });
    jQueryHook('html', function () {
        return jQueryDOMChangedThrottle(this);
    });
}));
