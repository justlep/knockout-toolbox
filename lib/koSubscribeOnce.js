import {ko} from './libs.js';

/**
 * Adds a ´subscribeOnce´ method to knockout observables that will fire only once.
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.subscribable.fn.subscribeOnce = function(handler, owner, eventName) {
    let _subscription = this.subscribe(newValue => {
            _subscription.dispose();
            handler(newValue, owner, eventName);
        });

    return _subscription;
};
