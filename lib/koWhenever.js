import {ko} from './libs.js';

/**
 * Adds a ´whenever´ method to knockout observables that will fire whenever the
 * observable value matches the given value or compare function.
 *
 * (!) If the observable's value already matches at the time whenever() is called,
 *     the callback is fired synchronously, otherwise asynchronously.
 *
 * Example:
 *    a = ko.observable(666).whenever(666, () => alert('a is 666'));     // -> alert
 *    a('666'); // -> NO alert due to strict type check
 *    a(666);   // -> alert
 *
 *    b = ko.observable(1).whenever(val => val % 2, () => alert('b is even'));
 *    b(4); // -> alert
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.subscribable.fn.whenever = function (refValueOrCompareFn, callbackOnMatch) {
    if (typeof callbackOnMatch !== 'function') {
        throw 'Invalid type of `callbackOnMatch` for observable.when: ' + typeof callbackOnMatch;
    }

    let compareFn = (typeof refValueOrCompareFn === 'function') ? refValueOrCompareFn :
                                                                 (currentValue => currentValue === refValueOrCompareFn),
        matchesAlready = compareFn(this.peek());

    this.subscribe(newValue => compareFn(newValue) && callbackOnMatch());

    if (matchesAlready) {
        callbackOnMatch();
    }

    return this;
};
