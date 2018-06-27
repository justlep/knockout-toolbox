import {ko} from './libs.js';

/**
 * Binding for focusing a form element as soon as it gets rendered.
 *
 * Example:
 *   <input type="text" data-bind="autoFocus: true">
 *   <input type="text" data-bind="textinput: value, autofocus: true">
 *
 *   <!-- autofocus only if the field is currently empty -->
 *   <input type="text" data-bind="textinput: value, autofocus: value">
 *
 *   <!-- focus + select the text of the textfield -->
 *   <input type="text" data-bind="autoFocus: {select: true}">
 *
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.bindingHandlers.autoFocus = {
    init: (elem, valueAccessor) => {
        let val = ko.unwrap(valueAccessor()),
            skip = !val || ko.unwrap(val.skipIf) || (typeof elem.focus !== 'function'),
            select = !skip && ko.unwrap(val.select) && typeof elem.select === 'function';

        if (!skip) {
            setTimeout(() => {
                elem.focus();
                if (select) {
                    elem.select();
                }
            }, 50);
        }
    }
};