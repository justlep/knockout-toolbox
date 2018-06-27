import {ko} from './libs.js';

/**
 * Adds a 'blur' binding that will remove focus off a form element whenever the binding-parameter turns truthy.
 * Example:
 *   <input type="text" data-bind="blur: needsBlur">
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.bindingHandlers.blur = {
    update: (elem, valueAccessor) => {
        if (ko.unwrap(valueAccessor())) {
            elem.blur();
        }
    }
};

export default ko;