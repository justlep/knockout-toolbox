import {ko} from './libs.js';

/**
 * Extender adding a trim() and trimmed() function to an observable,
 * with trim() replacing the current value with a trimmed version,
 * and trimmed() simply returning the trimmed string version of the current value without changing the observable.
 *
 * Example:
 *    var myObs = ko.observable('   abc   ').extend({trimmable: true});
 *    myObs.trimmed();     // 'abc'
 *    myObs(' xyz ');
 *    myObs.trim();
 *    myObs(); // xyz
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.extenders.trimmable = function(target, options) {
    target.trimmed = function() {
        return String(target() || '').trim();
    };

    target.trim = function() {
        target( target.trimmed() );
    };
};
