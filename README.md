jquery-domchanged-plugin
========================
A jQuery plugin to detect when the DOM is modified for specific elements.

Examples
--------
```javascript
$('#test').on('DOMChanged', function (event) {
    // this specific element has been modified, log or include other event observers
})

$('body').on('DOMChanged', function (event) {
    // DOMChanged events bubble to parent elements, so global event observation is possible
    console.log('DOM content modified for', $(event.target).attr('id'));
})
```

Caveats
-------
DOM modifications are detected by hooking into jQuery's native DOM manipulation APIs, not by observing the DOM directly. Support for mutation observers isn't widely available, and there are performance limits with mutation events.

DOM change events are throttled within a 50 millisecond window per modified element. Throttling is determined by the element's DOM ID, and if no ID is available a unique ID will be generated on demand.

DOM change events are written for single target jQuery selectors, not for group selectors.
