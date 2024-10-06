define([
    'jquery',
    'device',
    'utils',
    'loc',
    'fastclick',
    'fastdom',
    'dropdown',
    'anime',

    'landingPageUtils',
    'initLandingPageVirtual',
    'trackerUtils',

    'text!html/initHome/fullScreenButton.html'
], function(
    $,
    device,
    utils,
    loc,
    FastClick,
    fastdom,
    Dropdown,
    anime,

    landingPageUtils,
    InitLandingPageVirtual,
    trackerUtils,

    fullScreenButtonHtml
) {
    'use strict';

    var sectionsTop = [],
        $body = $("body"),
        $main = $(".main"),
        $navBar = $(".side-nav ul"),
        $sections = $('.section'),
        $scrollDown = $('.scroll_down'),
        $scrollUpSection = $(".main").find('.scrollUp-fixed'),
        currentSection = null,
        tempSectionArr = [];


    $(window).on('scroll', function() {
        scrollHandler();
    });
    $scrollDown.on('click', function() {
        var section = document.querySelector('#explore');
        scrollTo(section, 350);
    });
    $scrollUpSection.on('click', function() {
        var section = document.querySelector('#play');
        scrollTo(section, 350);
    });

    // Resize event
    $(window).resize(function() {
        resizeHandler();
        catalogCalc();
    });


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //      HELPERS LANDING PAGE
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //////////////////////
    //      EVENTS      //
    //////////////////////

    var scrollHandler = function() {
        checkNavBar(window.innerHeight, $(window).scrollTop());
    };


    var resizeHandler = function() {
        sectionsTop = computeSectionsTop();
    };

    // Private helper function
    // Block some keys, as we want to have control over the scrolling ourselves
    var onKeyDown = function(e) {
        _.contains([KEYBOARD.SPACE, KEYBOARD.LEFT, KEYBOARD.UP, KEYBOARD.RIGHT, KEYBOARD.DOWN], e.which || e.keyCode) && e.preventDefault();
    };

    ////////////////////////
    //      FUNCTIONS     //
    ////////////////////////


    function scrollTo(element, duration) {
        var from = $(window).scrollTop(),
            elementY = Math.ceil(element.getBoundingClientRect().top + from),
            incValue = 50, // magic number for scrolling
            diffObj = {};

        if (from === elementY) {
            return;
        }

        function diffCalc(large, small) {
            diffObj.diff = (large - small);
            diffObj.diffFrac = Math.floor(diffObj.diff / incValue);

            return diffObj;
        }

        var int = setInterval(function() {
            window.scrollTo(0, from);
            if (elementY > from) {
                diffCalc(elementY, from);
                from += (diffObj.diffFrac > 0) ? incValue : diffObj.diff;

            } else if (elementY < from) {
                diffCalc(from, elementY);
                from -= (diffObj.diffFrac > 0) ? incValue : (diffObj.diff + 5);
            }

            if (elementY === from) {
                clearInterval(int);
            }
        }, 10);
    }


    var computeSectionsTop = function() {

        var sections = $('.section');
        var sectionsTop = sections.map(function(section) {
            return this.offsetTop;
        });

        return sectionsTop;
    };

    // Hash link event listeners
    // Prevent default behaviour of hash links and smooth scroll them to their anchor points
    var preventHashLinks = function() {
        var links = document.getElementsByTagName('a');
        for (var i = 0; i < links.length; ++i) {
            if (links[i].href.indexOf('#') !== -1) {
                links[i].addEventListener('click', function(e) {
                    var href = this.getAttribute('href');
                    var section = document.querySelector(href);
                    scrollTo(section, 350);
                    e.preventDefault();
                });
            }
        }
    };


    var checkNavBar = function(innerHeight, lastScrollY) {
        var topThreshold = innerHeight * 0.5;
        var bottomThreshold = innerHeight * 0.2;
        var lastSection = null;

        var documentHeight = $main.height();
        // Add class to fix the room no.
        if (lastScrollY > 100 && !($scrollUpSection.hasClass('scrollUpSection'))) {
            $scrollUpSection.addClass('visible');
        } else if (lastScrollY == 0) {
            $scrollUpSection.removeClass('visible');
        }


        for (var i = 0, sectionLength = sectionsTop.length; i < sectionLength; i++) {
            var section = $sections[i];

            // That last conditional checks if we're close to the bottom of the document and then adds a visibility class to the lower sections a bit earlier
            // This is because they're not always at 50% of the viewport height
            if (lastScrollY > (sectionsTop[i] - topThreshold) || (lastScrollY + innerHeight) > (documentHeight - bottomThreshold)) {
                lastSection = i;
                section.classList.add('is-focused');
            } else {
                section.classList.remove('is-focused');
            }
        }


        !!currentSection && $navBar.children()[currentSection].removeAttribute('data-active');
        !!lastSection && $navBar.children()[lastSection].setAttribute('data-active', 'true');

        //Tracking 2nd screen scoll events
        initTrackingSection($navBar.find('li[data-active] a').attr('data-attr'));

        currentSection = lastSection;
    };

    var initNavBar = function() {
        sectionsTop = computeSectionsTop();

        checkNavBar(window.innerHeight, window.pageYOffset);
    };


    // Insert fullscreen button (if supported)
    var initFullScreenButton = function() {
        if (document.fullscreenEnabled) {
            var fullscreenBtn = document.createElement('button');
            fullscreenBtn.className = 'toggle-fullscreen';
            fullscreenBtn.innerHTML = fullScreenButtonHtml;

            document.querySelector('.header').appendChild(fullscreenBtn);

            $(fullscreenBtn).on('click', function() {
                utils.toggleFullscreen();
                $(this).trigger('blur'); // Unfocus btn
            });
        }
    };


    var finalizeGamePage = function() {
        window.removeEventListener('resize', resizeHandler, false);
        $(window).off('resize.fittext orientationchange.fittext');
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //      TRACKING SCROLL EVENTS landing page
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var initTrackingSection = function(sectionName) {
        if (tempSectionArr.indexOf(sectionName) < 0 && sectionName !== 'Play') {
            tempSectionArr.push(sectionName);
            var lastElement = tempSectionArr[tempSectionArr.length - 1];

            lastElement = (!!lastElement ? lastElement : 'Play')
            trackerUtils.prototype.tempEvents('jdnowEvent', 'Home', lastElement);
        }
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //      TRACKING CLICK EVENTS landing page
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var trackClickEvents = function() {
        var $trailerVideo = $('#toggle-video'),
            $compatibility = $('.compatibilityChart'),
            $googleLink = $('.platforms__link--android'),
            $iosLink = $('.platforms__link--ios'),
            $playNow = $('.trackPlay'),
            $explore = $('.trackExplore'),
            $catalog = $('.trackCatalog'),
            $features = $('.trackFeatures'),
            $howItWorks = $('.trackHowItWorks'),
            $download = $('.trackDownload'),
            $faq = $('.trackFaq'),
            $howToPlay = $('.trackHowToPlay'),
            $agreement = $('.trackAgree'),
            $licence = $('.trackLicence'),
            $credits = $('.trackCredits'),
            $officialWeb = $('.trackWeb'),
            $esrbPrivacyLink = $('.trackEsrbPrivacy'),
            $esrbLink = $('.img__esrb'),
            $facebook = $('.facebook'),
            $twitter = $('.twitter'),
            $youtube = $('.youtube'),
            $instagram = $('.instagram');

        function executeClick(elem, textVal) {
            elem.on('click', function() {
                trackerUtils.prototype.tempEvents('clickEvent', 'Home', textVal);
            });
        }

        executeClick($trailerVideo, 'Watch the trailer');
        executeClick($compatibility, 'Navigation - Compatible devices');
        executeClick($googleLink, 'Offsite Links - Google Play DLL');
        executeClick($iosLink, 'Offsite Links - App Store DLL');
        executeClick($playNow, 'Footer - Play Now');
        executeClick($explore, 'Footer - Explore');
        executeClick($catalog, 'Footer - Catalog');
        executeClick($features, 'Footer - Features');
        executeClick($howItWorks, 'Footer - How It Works');
        executeClick($download, 'Footer - Download');
        executeClick($faq, 'Navigation - Footer - FAQ');
        executeClick($howToPlay, 'Navigation - Footer - HowToPlay');
        executeClick($agreement, 'Navigation - Footer - Terms Agreement');
        executeClick($licence, 'Navigation - Footer - Licences');
        executeClick($credits, 'Navigation - Footer - Game Credits');
        executeClick($officialWeb, 'Navigation - Footer - JD Official Website');
        executeClick($esrbPrivacyLink, 'Navigation - Footer - ESRB Privacy Compliance Data');
        executeClick($esrbLink, 'Navigation - Footer - ESRB Compliance');
        executeClick($facebook, 'Navigation - Footer - Facebook');
        executeClick($twitter, 'Navigation - Footer - Twitter');
        executeClick($youtube, 'Navigation - Footer - Youtube');
        executeClick($instagram, 'Navigation - Footer - Instagram');

    };

    // Initialize the click events for tracking
    trackClickEvents();

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //      CATALOG animation
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var catalogCalc = function() {
        var remUnit = parseFloat($("body").css("font-size")),
            wd_width = $(window).width(),
            sw_height = $('.screen__icon-wrapper').outerHeight(true) / remUnit,
            ratio = (wd_width > 350 ? (sw_height * 0.70) : (sw_height * 0.58)); // 70% & 58% of the screen size

        $(".screenshots").css('height', ratio + 'rem');
        if (wd_width >= 401) {
            $(".screenshots").removeAttr('style');
        }
    }

    var initCatalogAnimation = function() {

        var $screenshots = $(".screenshots");
        var children = $screenshots.children();

        var i = 0;

        var anim = anime({
            targets: ".screenshot",
            translateX: [
                0,
                {
                    value: function(el, i, l) {
                        return "-" + (100 * (i + 1)) + "%";
                    },

                    duration: function(el, i, l) {
                        return 7000 * (i + 1);
                    },
                }, {
                    value: function(el, i, l) {
                        return (100 * (l - i - 1)) + "%";
                    },

                    duration: 0,
                }, {
                    value: 0,

                    duration: function(el, i, l) {
                        return 7000 * (l - i - 1);
                    }
                }
            ],
            easing: 'linear',
            loop: true
        });
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //      INIT LANDING PAGE
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function InitLandingPage() {
        InitLandingPageVirtual.call(this);
    };

    InitLandingPage.prototype = Object.create(InitLandingPageVirtual.prototype);
    InitLandingPage.prototype.constructor = InitLandingPage;

    var self = InitLandingPage.prototype;

    self.initLandingPage = function() {

        self.dropdown = new Dropdown();
        self.dropdown.init();

        preventHashLinks();
        initNavBar();

        catalogCalc();
        initCatalogAnimation();

        landingPageUtils.addVideoPreviewEventListener();
        landingPageUtils.cookieNotice();
        landingPageUtils.appendStoreLinks();

    };

    self.destroyUnusedDom = function() {
        $navBar = $sections = $scrollDown = $main = null;
        currentSection = tempSectionArr = sectionsTop = null; // for garbage collection in js

        self.dropdown.destroy();
    };

    self.tearDown = function() {

        $(window).off('scroll');
        window.removeEventListener('keydown', onKeyDown, false);
        window.removeImageLoaderEventListeners();

        finalizeGamePage();
        self.destroyUnusedDom();

        return landingPageUtils.tearDownLandingPage();
    };


    self.initialize = function(igs) {

        var qrCodeContainer = document.querySelector('.qr-code');

        window.addEventListener('resize', function() {
            var qrCode = landingPageUtils.scaleQrCode(igs.jd.qrCode, qrCodeContainer.clientWidth);
            qrCodeContainer.removeChild(qrCodeContainer.firstChild);
            qrCodeContainer.appendChild(qrCode);
        }, false);

    };

    return InitLandingPage;

});