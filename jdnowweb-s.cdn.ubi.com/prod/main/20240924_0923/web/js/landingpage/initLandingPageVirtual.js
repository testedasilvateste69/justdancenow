define([
    'jquery',
    'lodash',
    'loc',
    'device',
    'environment',
    'fastdom',
    'utils',
    'landingPageUtils'

], function(
    $,
    _,
    loc,
    device,
    env,
    fastdom,
    utils,
    landingPageUtils
) {
    'use strict';


    var writeRoomNumber = function(room) {

        fastdom.read(function() {
            var roomNumbers = document.querySelectorAll('.room-number');

            fastdom.write(function() {
                // Update room number(s)
                document.querySelector('html').classList.add('room-number');
                for (var i = 0; i < roomNumbers.length; i++) {
                    roomNumbers[i].innerHTML = room;
                }
            });
        });
    };

    var displayQrCode = function(qrCode) {

        /// hide spinner
        $(".dr-landing .init-spinner").hide(0.3);

        $(".dr-landing__wrapper").removeClass("dr-landing--hidden");

        //replace with qrCode
        var qrCodeContainer = document.querySelector('.qr-code');
        if (!!qrCodeContainer) {
            var qrCode = landingPageUtils.scaleQrCode(qrCode, qrCodeContainer.clientWidth);
            qrCodeContainer.appendChild(qrCode);
        }

    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //      Time stamp calculation for tracking room no loading
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var trackRoomNbLoadingTime = function(igs) {
        var roomLoadingTime = utils.diffTimeCalculation();
        igs.jd.webTracker.genericWebTracker('jdnowEvent', 'Home', 'Room No. Loading Time: ' + roomLoadingTime);
    };


    function InitLandingPageVirtual() {
        this.displayRoomNumber = true;
    };

    var _this = InitLandingPageVirtual.prototype;

    //initialize the view and create its container
    _this.init = function(igs) {
        return $.when(!!this.initLandingPage ?
            this.initLandingPage(igs) : null);
    };

    _this.handleTearDown = function() {
        return $.when(!!this.tearDown ?
            this.tearDown() : null);
    };

    _this.initializeGame = function(igs) {

        var $launchGame = $('.launch-game'),
            dfd = $.Deferred(),
            gameInitDfd = igs.getGameInitialized();

        if (this.displayRoomNumber) {
            $launchGame.addClass('visible');
            $launchGame.on('click', function() {
                dfd.resolve.call(igs, true);

                //Tracking calls
                if ($(this).hasClass('dr-landing')) {
                    igs.jd.webTracker.genericWebTracker('clickEvent', 'Home', 'Action - Room Number');
                } else {
                    igs.jd.webTracker.genericWebTracker('clickEvent', 'Home', 'Action - Try It For Free');
                }
            });


            gameInitDfd
                .then(function(roomInfos) {
                    writeRoomNumber(roomInfos.room);
                    displayQrCode(roomInfos.qrCode);
                });


        } else {
            dfd.resolve.call(igs, false);
        }


        if (this.initialize) {
            gameInitDfd
                .then(function() {
                    trackRoomNbLoadingTime(igs);
                    this.initialize(igs);
                }.bind(this));
        }

        return dfd;

    };

    return InitLandingPageVirtual;

});