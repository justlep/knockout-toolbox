import {ko} from './libs.js';

/**
 * Adds a ´when´ method to knockout observables that will fire *once* when the
 * observable value matches the given value or compare function.
 *
 * (!) If the observable's value already matches at the time when() is called,
 *     the callback is fired synchronously, otherwise asynchronously.
 *
 * Example:
 *    a = ko.observable(666);
 *    a.when(666, () => alert('a is 666'));  // -> alert
 *    a(0);
 *    a(666); // -> NO alert, since already fired once
 *
 *    b = ko.observable(1).when(val => val % 2, () => alert('b is now even')); // -> no alert
 *    b(2); // -> alert
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.subscribable.fn.when = function (refValueOrCompareFn, callbackOnMatch) {
    if (typeof callbackOnMatch !== 'function') {
        throw 'Invalid type of `callbackOnMatch` for observable.when: ' + typeof callbackOnMatch;
    }

    let compareFn = (typeof refValueOrCompareFn === 'function') ? refValueOrCompareFn : function(currentValue) {
            return currentValue === refValueOrCompareFn;
        },
        matchesAlready = compareFn(this.peek()),
        subscription;

    if (matchesAlready) {
        callbackOnMatch();
    } else {
        subscription = this.subscribe(function(newValue) {
            if (compareFn(newValue)) {
                subscription.dispose();
                callbackOnMatch();
            }
        });
    }
};
