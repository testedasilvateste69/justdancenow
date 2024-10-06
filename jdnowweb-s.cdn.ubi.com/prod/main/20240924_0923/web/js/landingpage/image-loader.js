(function() {
    'use strict';

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());

// Responsive images, with lazyload and variable resolution (retina) support
(function(win, doc, body) {
    'use strict';

    var ticking = false;
    var unloadedImages = [];
    var isRetina = win.devicePixelRatio > 1;

    // Poll the browser every 250ms to determine when document is ready
    var intervalId = setInterval(function() {
        runImageLoader();

        if (/^loaded|^i|^c/.test(doc.readyState)) {
            clearInterval(intervalId);
            return;
        }
    }, 250);

    var onScroll = function() {
        var requestTick = function() {
            loadImages();

            ticking = false;
        };

        if (!ticking) {
            win.requestAnimationFrame(requestTick);

            ticking = true;
        }
    };

    var onResize = function() {
        loadImages();
    };

    var addEventListeners = function() {
        win.addEventListener('scroll', onScroll, false);
        win.addEventListener('resize', onResize, false);
    };

    var removeEventListeners = function() {
        win.removeEventListener('scroll', onScroll, false);
        win.removeEventListener('resize', onResize, false);
    };

    // Document scroll value helper function
    var getDocumentScrollTop = function() {
        if (win.pageYOffset === undefined) {
            return (doc.documentElement || doc.body.parentNode || doc.body).scrollTop;
        }
        return win.pageYOffset;
    };

    // Iterator helper
    var forEach = function(array, callback, scope) {
        for (var i = 0, len = array.length; i < len; i++) {
            callback.call(scope, i, array[i]);
        }
    };

    // Determine if an element is visible (even partialy) in the viewport
    var isPartiallyInViewport = function(element, offset) {
        var winTop = getDocumentScrollTop();
        var winHeight = doc.documentElement.clientHeight;
        var winBottom = winTop + winHeight;
        offset = offset || 0;

        var rect = element.getBoundingClientRect();
        var elTop = rect.top + winTop - offset;
        var elBottom = rect.bottom + winTop + offset;

        return elBottom > winTop && elTop < winBottom;
    };

    var loadImage = function(element) {
        // Create <img> tag
        var img = document.createElement('img');
        img.src = isRetina ? element.getAttribute('data-src').replace(/\.(?=[^.]*$)/, '@2x.') : element.getAttribute('data-src');
        img.width = element.getAttribute('data-width');
        img.height = element.getAttribute('data-height');
        img.alt = element.getAttribute('data-alt');
        img.className += element.getAttribute('data-class');

        // Append newly created <img> tag to container
        win.requestAnimationFrame(function() {
            // Remove static dimensions from container element
            element.style.width = '';
            element.style.height = '';

            // Append the newly created img
            var childNode = element.children[0];
            element.replaceChild(img, childNode);
        });
    };

    var loadImages = function() {
        forEach(unloadedImages, function(index, element) {
            if (!element) {
                return;
            }

            // Set dimensions on container element so that it doesn't reflow on fast scrolling
            var width = element.getAttribute('data-width');
            var height = element.getAttribute('data-height');
            element.style.width = width + 'px';
            element.style.height = height + 'px';

            // Lazyload
            if (isPartiallyInViewport(element, 100)) {
                loadImage(element);

                delete unloadedImages[index];
            }
        });
    };

    var runImageLoader = function() {
        // Turn nodeList to regular array
        var nodeList = document.querySelectorAll('[data-picture]');
        unloadedImages = Array.prototype.slice.call(nodeList);

        loadImages();
        addEventListeners();

        // Expose these functions
        win.addImageLoaderEventListeners = addEventListeners;
        win.removeImageLoaderEventListeners = removeEventListeners;
    };

})(window, window.document, document.querySelector("body"));