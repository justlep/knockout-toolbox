import {ko} from './libs.js';

/**
 * Extender adding a reset() method to an observable.
 * When reset is invoked, the original <value> from the "trimmable: <value>" will be assigned to the observable:
 *
 * Example:
 *    var myObs = ko.observable('huhu').extend({resettable: ''});
 *    myObs('abc');  // myObs() === 'abc'
 *    myObs.reset(); // myObs() === 'huhu'
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.extenders.resettable = function(target, resetVal) {
    target.reset = () => target(resetVal);
    return target;
};