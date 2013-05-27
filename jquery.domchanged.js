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
                delete contexts[id];
                return $element.trigger('DOMChanged');
            };
        }
        var now       = (new Date()).getTime();
        var previous  = contexts[id].previous || now;
        var remaining = 50 - (now - previous);
        var timeout   = contexts[id].timeout || null;
        if (remaining <= 0) {
            if (timeout) {
                clearTimeout(timeout);
            }
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
    jQueryHook('prepend', function () {
        return jQueryDOMChangedThrottle(this);
    });
    jQueryHook('append', function () {
        return jQueryDOMChangedThrottle(this);
    });
    jQueryHook('before', function () {
        return jQueryDOMChangedThrottle($(this).parent());
    });
    jQueryHook('after', function () {
        return jQueryDOMChangedThrottle($(this).parent());
    });
    jQueryHook('html', function () {
        return jQueryDOMChangedThrottle(this);
    });
}));
