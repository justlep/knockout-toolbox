import {ko, $} from './libs.js';

/**
 * Knockout-binding allowing elements to be faded in/out based on a given condition/observable.
 * Optionally, the object can remain invisible but at same dimensions in the page.
 *
 * @param visibleIf (mixed) if truthy, the bound element will fade in, otherwise out
 * @param [keepSpace] (mixed) if truthy, the bound element will fade out to slightly above 0, so
 *                            its space is preserved, preventing the page from jumping
 * @param [refadeAfter] (Number) if given, the element will fade out X millis again after the last fade-in
 * @param [fadeInSpeed] (Number) if given, the duration in millis of the fade-in animation
 * @param [fadeOutSpeed] (Number) if given, the duration in millis of the fade-out animation
 * @param [useSlide] (boolean) if true, jQuery's slide effect is used instead of fade (fadeInSpeed etc are used, anyway)
 *
 * Example:
 *   <div data-bind="fadeVisible: someCondition">...</div>
 *   <div data-bind="fadeVisible: {visibleIf: someCondition, keepSpace: true}">..</div>
 *   <div data-bind="fadeVisible: {visibleIf: someCondition, keepSpace: false, refadeAfter: 2000}">..</div>
 *   <div data-bind="fadeVisible: {visibleIf: someCondition, fadeInSpeed: 5000, fadeOutSpeed: 0}">..</div>
 *   <div data-bind="fadeVisible: {visibleIf: someCondition, useSlide: true}">..</div>
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */

const DEFAULT_FADE_SPEED = 300,
    FORCED_FADE_DATA_ATTRIB = 'kfvb-forcefade',
    getOpts = function(valueAccessor) {
        let unwrapped = ko.unwrap(valueAccessor()),
            isObject = (typeof unwrapped === 'object'),
            overrideFadeIn = isObject && (typeof unwrapped.fadeInSpeed === 'number'),
            overrideFadeOut = isObject && (typeof unwrapped.fadeOutSpeed === 'number'),
            useSlide = isObject && (typeof unwrapped.useSlide === 'boolean');

        return {
            showIt: isObject ? ko.unwrap(unwrapped.visibleIf) : !!unwrapped,
            keepSpace: isObject ? !!unwrapped.keepSpace : false,
            refadeAfter: isObject ? (unwrapped.refadeAfter || 0) : 0,
            fadeInSpeed: (isObject && overrideFadeIn) ? unwrapped.fadeInSpeed : DEFAULT_FADE_SPEED,
            fadeOutSpeed: (isObject && overrideFadeOut) ? unwrapped.fadeOutSpeed : DEFAULT_FADE_SPEED,
            fadeInFn: useSlide ? 'slideDown' : 'fadeIn',
            fadeOutFn: useSlide ? 'slideUp' : 'fadeOut'
        };
    },
    doFade = function(element, valueAccessor) {
        let opts = getOpts(valueAccessor),
            jElem = $(element),
            isElementVisible = jElem.is(':visible') && (jElem.css('visibility') !== 'hidden');

        if ($(element).data(FORCED_FADE_DATA_ATTRIB)) {
            $(element).data(FORCED_FADE_DATA_ATTRIB, null);
            opts.showIt = false;
            //console.log('Doing forced refade');
        }

        if (opts.showIt === isElementVisible) {
            // console.log('Skipping fade/unfade as element is already ' + (isElementVisible ? 'visible' : 'hidden'));
            return;
        }

        if (!opts.keepSpace) {
            if (opts.showIt) {
                jElem[opts.fadeInFn](opts.fadeInSpeed);
            } else {
                jElem[opts.fadeOutFn](opts.fadeOutSpeed);
            }
        } else if (opts.showIt) {
            // won't win a beauty price but does the job ;)
            jElem.stop().css( (opts.keepSpace && element.style.visibility === 'hidden') ? {
                opacity: 0.00001,
                visibility: 'visible'
            } : {}).animate({opacity:1}, opts.fadeInSpeed);
        } else {
            jElem.stop().animate({opacity:0.00001}, opts.fadeOutSpeed, function() {
                this.style.visibility = 'hidden';
            });
        }

        if (opts.showIt && opts.refadeAfter) {
            //console.log('Scheduling refade in %s millis', opts.refadeAfter);
            setTimeout(function() {
                $(element).data(FORCED_FADE_DATA_ATTRIB, true);
                doFade(element, valueAccessor);
            }, opts.refadeAfter);
        }
    };

ko.bindingHandlers.fadeVisible = {
    update: doFade
};
