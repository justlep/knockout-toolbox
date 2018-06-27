import {ko, $} from './libs.js';

// License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE

function _assertWritableObsOrFn(o) {
    if (!ko.isWriteableObservable(o) && typeof o !== 'function') {
        throw 'Provided object is neither function nor writable observable.';
    }
}

/**
 * Binding for adapting the value of some form element into a ViewModel's observable during ko.applyBindings.
 *
 * Example:
 *     <input type="text" value="${filledOnServerSide}" data-bind="importValueTo: myText, textInput: myText">
 *     <input type="checkbox" checked="{filledServerSided}" data-bind="importCheckStatusTo: myBooleanObs, checked: myBooleanObs">
 *     <input type="textarea"
 */
ko.bindingHandlers.importValueTo = {
    init: function(elem, valueAccessor) {
        let opts = valueAccessor(),
            hasOpts = (typeof opts === 'object'),
            targetObsOrFn = hasOpts ? opts.target : opts,
            rawVal = elem.value || '',
            val = (hasOpts && opts.asNumber) ? (parseInt(''+rawVal, 10) || 0) : rawVal;

        _assertWritableObsOrFn(targetObsOrFn, elem);

        if (ko.isObservable(targetObsOrFn)) {
            if (!targetObsOrFn.push) {
                targetObsOrFn(val);
            } else {
                targetObsOrFn.push(elem.value);
            }
        } else {
            targetObsOrFn(val);
        }
    }
};

/**
 * Binding for adapting the value of some form element into a ViewModel's observable during ko.applyBindings.
 *
 * Example:
 *     <input type="text" value="${filledOnServerSide}" data-bind="importValueTo: myText, textInput: myText">
 *     <input type="checkbox" checked="{filledServerSided}" data-bind="importCheckStatusTo: myBooleanObs, checked: myBooleanObs">
 *     <input type="textarea"
 */
ko.bindingHandlers.importCheckedStatusTo = {
    init: function(elem, valueAccessor) {
        let targetObsOrFn = valueAccessor(),
            jElem = $(elem);
        _assertWritableObsOrFn(targetObsOrFn, elem);

        if (!jElem.is('input[type=checkbox]') && !jElem.is('input[type=radio]')) {
            throw 'Provided elem is no checkbox';
        }
        targetObsOrFn( jElem.is(':checked') );
    }
};

/**
 * Binding for adapting the value of some form element into a ViewModel's observable during ko.applyBindings.
 *
 * Example:
 *     <input type="text" value="${filledOnServerSide}" data-bind="importValueTo: myText, textInput: myText">
 *     <input type="checkbox" checked="{filledServerSided}" data-bind="importCheckStatusTo: myBooleanObs, checked: myBooleanObs">
 *     <input type="textarea"
 */
ko.bindingHandlers.importElementTo = {
    init: function(elem, valueAccessor) {
        let targetObsOrFn = valueAccessor();
        _assertWritableObsOrFn(targetObsOrFn, elem);
        targetObsOrFn(elem);
    }
};
