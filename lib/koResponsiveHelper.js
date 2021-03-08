import {ko} from './libs.js';

/**
 * A helper for creating responsive pages based on Knockout observables (and/or bindings).
 * Generates boolean computed observables indicating whether the window has a specific min and/or max width.
 * All observables are reused on duplicate min/max combinations.
 * Also provides an `ifWindowSize` and `visibleIfWindowSize` binding for use in HTML.
 *
 * Example:
 *    var max300Observable = koResponsiveHelper.getMaxWidthObservable(300);
 *    max300Observable.subscribe(function(doesFit) {
 *        console.log('Window width is %s 300', doesFit ? 'less or equal' : 'greater than');
 *    });
 *
 *    var min1000Observable = koResponsiveHelper.getMinWidthObservable(1000);
 *    min1000Observable.subscribe(function(doesFit) {
 *        console.log('Window width is %s 1000', doesFit ? 'greater or equals' : 'less than');
 *    });
 *
 *    var between300And800Observable = koResponsiveHelper.getWidthRangeObservable(300, 800);
 *    between300And800Observable.subscribe(function(doesFit) {
 *        console.log('Window width %s between 300 and 800', doesFit ? 'is' : 'is NOT');
 *    });
 *
 *   Or as `ifWindowSize` and `visibleIfWindowSize` bindings:
 *
 *   <div data-bind="ifWindowSize: {min:300}"> Rendered if window width is >= 300 pixels </div>
 *   <div data-bind="ifWindowSize: {max:800}"> Rendered if window width is <= 800 pixels </div>
 *   <div data-bind="ifWindowSize: {min: 300, max:800}"> Rendered if window width is between 300 and 800 pixels </div>
 *
 *   <div data-bind="visibleIfWindowSize: {min:300}"> Visible if window width is >= 300 pixels </div>
 *   <div data-bind="visibleIfWindowSize: {max:800}"> Visible if window width is <= 800 pixels </div>
 *   <div data-bind="visibleIfWindowSize: {min: 300, max:800}"> Visible if width between 300 and 800 pixels </div>
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
const MAX_UPDATE_FREQUENCY = 100;

/** @type {KnockoutObservable<number>} */
let _currentWidthObservable;

/** @type {number} */
let _lastW;

/** @type {KnockoutComputed<number>} */
export const currentWidth = ko.pureComputed(() => {
    if (!_currentWidthObservable) {
        const _getOrUpdateWidth = function() {
            let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            if (_currentWidthObservable && w !== _lastW) {
                _currentWidthObservable(w);
            }
            return (_lastW = w);
        };
        _currentWidthObservable = ko.observable(_getOrUpdateWidth()).extend({rateLimit: MAX_UPDATE_FREQUENCY});
        window.addEventListener('resize', _getOrUpdateWidth);
        console.debug('koResponsiveHelper bound window resize handler.');
    }
    return _currentWidthObservable();
});

/**
 * A map of media query strings to respective observables created by {@link getWidthRangeObservable}.
 * @type {Map<string, KnockoutObservable<boolean>>}
 */
let _mq2observableMap;

const _getWrappingHandlerForBinding = (targetBindingMethod) => {
    return function(elem, valueAccessor, allBindings, viewModel, bindingContext) {
        let {min, max} = (valueAccessor() || {});
        return targetBindingMethod(elem, getWidthRangeObservable(min, max), allBindings, viewModel, bindingContext);
    };
};

ko.bindingHandlers.ifWindowSize = {
    init: _getWrappingHandlerForBinding(ko.bindingHandlers['if'].init)
};
ko.virtualElements.allowedBindings.ifWindowSize = true;

ko.bindingHandlers.visibleIfWindowSize = {
    update: _getWrappingHandlerForBinding(ko.bindingHandlers.visible.update)
};

/**
 * @param {?number} minWidth
 * @param {?number} [maxWidth]
 * @return {KnockoutObservable<boolean>}
 */
export const getWidthRangeObservable = (minWidth, maxWidth) => {
    let min = (typeof minWidth === 'number' && !isNaN(minWidth)) ? `(min-width: ${Math.max(0, minWidth)}px)` : '',
        max = (typeof maxWidth === 'number' && !isNaN(maxWidth)) ? `(max-width: ${Math.max(0, maxWidth)}px)` : '';

    if (!min && !max) {
        throw 'Invalid minWidth and/or maxWidth for koResponsiveHelper.createWidthObservable';
    }

    let mediaQueryString = min + (min && max ? ' and ' : '') + max,
        obs = (_mq2observableMap || (_mq2observableMap = new Map())).get(mediaQueryString);

    if (!obs) {
        let mediaQuery = window.matchMedia(mediaQueryString);
        _mq2observableMap.set(mediaQueryString, obs = ko.observable(mediaQuery.matches));
        mediaQuery.onchange = (e) => obs(e.matches);
        console.debug('Added matcher-observable for media query "%s"', mediaQueryString);
    }
    return obs;
};

/**
 * Returns an observable that is true when the window width is greater or equal the given minWidth.
 * @param {number} minWidth
 * @return {KnockoutObservable<boolean>}
 */
export const getMinWidthObservable = (minWidth) => getWidthRangeObservable(minWidth, null);

/**
 * Returns an observable that is true when the window width is less or equal the given maxWidth.
 * @param {number} maxWidth
 * @return {KnockoutObservable<boolean>}
 */
export const getMaxWidthObservable = (maxWidth) => getWidthRangeObservable(null, maxWidth);
