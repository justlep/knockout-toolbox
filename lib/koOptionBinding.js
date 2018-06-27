import {ko} from './libs.js';

/**
 * A binding allowing to build <select>s with <optgroup> grouping, as described in:
 * Source: http://stackoverflow.com/questions/11189660/knockoutjs-binding-value-of-select-with-optgroup-and-javascript-objects
 *
 * Example:
 *   <select data-bind="foreach: groups, value: selectedOption">
 *     <optgroup data-bind="attr: {label: label}, foreach: children">
 *       <option data-bind="text: label, option: $data"></option>
 *     </optgroup>
 *   </select>
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.bindingHandlers.option = {
    update: function(element, valueAccessor) {
        let value = ko.utils.unwrapObservable(valueAccessor());
        ko.selectExtensions.writeValue(element, value);
    }
};