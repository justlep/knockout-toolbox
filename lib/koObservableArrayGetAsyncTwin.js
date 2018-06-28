import {ko} from './libs.js';

/**
 * Adds a `getAsyncTwin()` method to the prototype of Knockout's ObservableArray
 * returning a new ObservableArray that will be a continuous non-instant copy of the original.
 * Whenever the original ObservableArray changes, the copy will be populated
 * in chunks of a given size and with a given delay between the chunks until it is identical to the original.
 *
 * Intended to allow rendering the first (visible) part of huge lists faster before all the rest.
 *
 * Also adds an 'asyncTwin' extender that will add an `asyncTwin` property directly to an extended observableArray.
 *
 * Example:
 *
 *    var hugeList = ko.observableArray(someHugeArray),
 *        hugeListToRender = hugeList.getAsyncTwin({
 *            chunkSize: 100,
 *            chunkDelay: 1
 *        });
 *
 *    <ul data-bind="foreach: hugeListToRender">..</ul>
 *
 *    // alternatively:
 *    var hugeList = ko.observableArray(someHugeArray).extend({asyncTwin: {chunkSize: 100, chunkDelay: 1}});
 *
 *    <ul data-bind="foreach: hugeList.asyncTwin">..</ul>
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */

/**
 * @param {Object} opts
 * @param {number|Function} opts.chunkSize - number of items to copy per update interval OR a function to determine
 *                                           the number based on the new total size,
 *                                           e.g. function(total){ return (total <= 100) ? 20 : 10 }
 * @param {number|Function} opts.chunkDelay - delay in millis between the chunks OR a function to determine the delay
 *                                            based on the new total size,
 *                                            e.g. function(total){ return (total <= 100) ? 20 : 10 }
 *
 */
ko.observableArray.fn.getAsyncTwin = function(opts) {
    if (!opts || typeof opts !== 'object') {
        throw new Error('Invalid options object for observableArray.getAsyncTwin');
    }

    let _chunkSizeType = typeof opts.chunkSize,
        _chunkDelayType = typeof opts.chunkDelay,
        chunkSizeFn = (_chunkSizeType === 'function') && opts.chunkSize,
        chunkSizeNumber = !chunkSizeFn && _chunkSizeType === 'number' && opts.chunkSize,
        chunkDelayFn = (_chunkDelayType === 'function') && opts.chunkDelay,
        chunkDelayNumber = !chunkDelayFn && _chunkDelayType === 'number' && opts.chunkDelay;

    console.warn(chunkSizeFn, chunkSizeNumber, chunkDelayFn, chunkDelayNumber);

    if (!chunkSizeFn && !(chunkSizeNumber && chunkSizeNumber > 0 && chunkSizeNumber < 50000)) {
        throw new Error('Illegal chunkSize for observableArray.getAsyncTwin');
    }
    if (!chunkDelayFn && !(chunkDelayNumber && chunkDelayNumber > 0 && chunkDelayNumber < 4000)) {
        throw new Error('Illegal chunkDelay for observableArray.getAsyncTwin');
    }

    let sourceObsArray = this,
        twinObsArray = ko.observableArray(),
        chunkSize = -1,  // determined on update start
        chunkDelay = -1, // determined on update start
        timer = null,
        continueUpdate = function(clearArray) {
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }

            if (clearArray) {
                twinObsArray().length = 0;
            }

            let sourceArray = sourceObsArray(),
                twinArray = twinObsArray(),
                firstItemIndex = twinArray.length,
                lastItemIndex = Math.min(firstItemIndex + chunkSize - 1, sourceArray.length - 1);

            if (firstItemIndex <= lastItemIndex) {
                console.debug('Adding items %s to %s', firstItemIndex, lastItemIndex);

                for (let i = firstItemIndex; i<= lastItemIndex; i++) {
                    twinArray[i] = sourceArray[i];
                }
            }

            twinObsArray.isComplete = (twinArray.length === sourceArray.length);

            if (twinObsArray.isComplete) {
                console.debug('asyncTwin complete [total=%s]', twinArray.length);
            } else {
                console.debug('Scheduling next chunk in %s millis', chunkDelay);
                timer = setTimeout(continueUpdate, chunkDelay);
            }

            twinObsArray.valueHasMutated();
        },
        startUpdate = function() {
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }

            let newSize = sourceObsArray().length;

            chunkSize = chunkSizeNumber || chunkSizeFn(newSize);
            chunkDelay = chunkDelayNumber || chunkDelayFn(newSize);

            console.debug('asyncTwin#startUpdate [total=%s|chunkSize=%s|chunkDelay=%s]', newSize, chunkSize, chunkDelay);

            continueUpdate(true);
        };

    sourceObsArray.subscribe(startUpdate);

    startUpdate();

    return twinObsArray;
};

ko.extenders.asyncTwin = function(target, opts) {
    target.asyncTwin = target.getAsyncTwin(opts);
    return target;
};