import {ko} from './../libs.js';

/**
 * A binding to ensure that a media element's `src` attribute is nulled before the element gets disposed.
 * Without it, the media may still be considered playing in the notification area of Android / Chrome mobile.
 *
 * Example:
 *    <div data-bind="if: enabled">
 *      <audio src="some.mp3" data-bind="cleanMediaDisposal: true">
 *      <video data-bind="cleanMediaDisposal: true">
 *          <source src="video.mp4">
 */
ko.bindingHandlers.cleanMediaDisposal = {
    init: function(mediaElem) {
        ko.utils.domNodeDisposal.addDisposeCallback(mediaElem, function() {
            mediaElem.src = null;
        });
    }
};