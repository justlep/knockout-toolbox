import {ko} from './libs.js';

// License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE

let scrollToElement = function(idOrElem, smooth, blockEnd) {
    let elem = (typeof idOrElem === 'string') ? document.getElementById(idOrElem) : idOrElem,
        opts = (smooth === false) ? {} : {behavior: 'smooth'};

    if (blockEnd) {
        // opts.block = 'end';
    }
    if (elem && elem.scrollIntoView) {
        elem.scrollIntoView(opts);
    }
};


/**
 * Knockout binding that will scroll the bound event into the viewport (once only when rendered),
 * optionally after a given delay in milliseconds.
 *
 * Example:
 *    <div data-bind="scrollIntoView: true">This will be auto-scrolled to after ~100ms</div>
 *    <div data-bind="scrollIntoView: 1000">This will be auto-scrolled to after ~2000ms</div>
 */
ko.bindingHandlers.scrollIntoView = {
    init: (elem, valueAccessor) => {
        let val = valueAccessor(),
            delay = (typeof val === 'number') ? val : 100;

        setTimeout(() => {
            scrollToElement(elem);
        }, delay);
    }
};