(function ($) {
    'use strict';
    function createModule(method, target, selector) {
        module(method);
        asyncTest('event is triggered on selector', 1, function () {
            var $fixture = $('#qunit-fixture');
            $fixture.html('<div id="test2"></div>');
            var $alt = $('<div>Test3</div>');
            $fixture.append($alt);
            $alt.on('DOMChanged', function (event) {
                ok(false, 'DOMChanged event caught on wrong element');
                $alt.off('DOMChanged');
            });
            $fixture.on('DOMChanged', function (event) {
                ok(true, 'DOMchanged event caught on appropriate element');
                $fixture.off('DOMChanged');
                start();
            });
            $(target)[method]($(selector));
        });
        asyncTest('event bubbles up and still matches correct target', 2, function () {
            var $fixture = $('#qunit-fixture');
            $fixture.html('<div id="test2"></div>');
            var $body    = $('body');
            $body.on('DOMChanged', function (event) {
                var $target = $(event.target);
                equal($target.attr('id'), 'qunit-fixture', 'Original target matches selector');
                ok(true, 'DOMChanged event bubbled up to body element');
                $body.off('DOMChanged');
                start();
            });
            $(target)[method]($(selector));
        });
        asyncTest('multiple events caught', 3, function () {
            var $fixture = $('#qunit-fixture');
            var other = document.createElement('div');
            other.id = 'test2';
            document.getElementById('qunit-fixture').appendChild(other);
            //$fixture.html('<div id="test2"></div>');
            var $body = $('body');
            var counter = 0;
            $body.on('DOMChanged', function (event, type) {
                counter += 1;
                console.log(event.target, type);
                ok(true, 'Observed ' + counter);
                if (counter == 3) {
                    setTimeout(function () {
                        $body.off('DOMChanged');
                        start();
                    }, 100);
                }
            });
            $(target)[method]($(selector));
            $(target)[method]($(selector));
            $(target)[method]($(selector));
        });
        switch (method) {
        case 'html':
        case 'append':
        case 'prepend':
        case 'before':
        case 'after':
            asyncTest('string content also triggers', 1, function () {
                var $fixture = $('#qunit-fixture');
                $fixture.html('<div id="test2"></div>');
                $fixture.on('DOMChanged', function (event) {
                    ok(true, 'DOMchanged event caught on appropriate element');
                    $fixture.off('DOMChanged');
                    start();
                });
                $(target)[method](selector);
            });
            break;
        }
    }
    createModule('prepend',      '#qunit-fixture',  '<div>Test</div>');
    createModule('prependTo',    '<div>Test</div>', '#qunit-fixture' );
    createModule('append',       '#qunit-fixture',  '<div>Test</div>');
    createModule('appendTo',     '<div>Test</div>', '#qunit-fixture' );
    createModule('before',       '#test2',          '<div>Test</div>');
    createModule('insertBefore', '<div>Test</div>', '#test2'         );
    createModule('after',        '#test2',          '<div>Test</div>');
    createModule('insertAfter',  '<div>Test</div>', '#test2'         );
    createModule('html',         '#qunit-fixture',  '<div>Test</div>');
    asyncTest('empty call does not trigger', 0, function () {
        var $fixture = $('#qunit-fixture');
        var counter  = 0;
        var done     = function () {
            counter += 1;
            if (counter === 2) {
                start();
            }
        };
        $fixture.on('DOMChanged', function (event) {
            ok(false, 'DOMchanged event fired inappropriately');
            $fixture.off('DOMChanged');
            done();
        });
        $fixture.html();
        done();
        setTimeout(function () {
            done();
        }, 500);
    });
}(jQuery));
