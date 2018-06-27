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
let MAX_UPDATE_FREQUENCY = 100,
    _currentWidth = (function() {
            let obs,
                lastW = null,
                updateWidth = function() {
                    let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                    if (obs && w !== lastW) {
                        obs(w);
                    }
                    lastW = w;
                    return w;
                };

            obs = ko.observable(updateWidth()).extend({rateLimit: MAX_UPDATE_FREQUENCY});
            window.addEventListener('resize', updateWidth);
            console.debug('koResponsiveHelper bound window resize handler.');
            return obs;
        })(),
    observablesMap = {},
    createOrReuseWidthObservable = function(minWidth, maxWidth) {
        let min = (typeof minWidth === 'number' && !isNaN(minWidth)) ? Math.max(0, minWidth) : null,
            useMin = (min !== null),
            max = (typeof maxWidth === 'number' && !isNaN(maxWidth)) ? Math.max(0, maxWidth) : null,
            useMax = (max !== null),
            key = '' + min + '__' + max,
            computed = observablesMap[key];

        if (!useMin && !useMax) {
            throw 'Invalid minWidth and/or maxWidth for koResponsiveHelper.createWidthObservable';
        }

        if (!computed) {
            computed = ko.pureComputed(
                (useMin && useMax) ? function() {
                    let width = _currentWidth();
                    return (width >= min && width <= max);
                } : useMin ? function() {
                    return (_currentWidth() >= min);
                } : function() {
                    return (_currentWidth() <= max);
                }
            );
            observablesMap[key] = computed;
            console.debug('Added width observable [min=%o, max=%o]', min, max);
        }

        return computed;
    },
    getWrappingHandlerForBinding = function(targetBindingMethod) {
        return function(elem, valueAccessor, allBindings, viewModel, bindingContext) {
            let opts = valueAccessor(),
                min = opts && ((parseInt(opts.greaterThan, 10) + 1) || opts.min),
                max = opts && (opts.max || (parseInt(opts.lessThan, 10) - 1)),
                fitsObservable = createOrReuseWidthObservable(min, max);

            return targetBindingMethod(elem, fitsObservable, allBindings, viewModel, bindingContext);
        };
    };

ko.bindingHandlers.ifWindowSize = {
    init: getWrappingHandlerForBinding(ko.bindingHandlers['if'].init)
};
ko.virtualElements.allowedBindings.ifWindowSize = true;

ko.bindingHandlers.visibleIfWindowSize = {
    update: getWrappingHandlerForBinding(ko.bindingHandlers.visible.update)
};

export default {
    currentWidthObservable: _currentWidth,
    getMinWidthObservable: (minWidth) => createOrReuseWidthObservable(minWidth, null),
    getMaxWidthObservable: (maxWidth) => createOrReuseWidthObservable(null, maxWidth),
    getWidthRangeObservable: createOrReuseWidthObservable
};
