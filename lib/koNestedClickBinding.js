import {ko} from './libs.js';

let _getNestedBinding = function(eventName) {

    let handlerDescriptorsByElemMap = new WeakMap(),
        sharedClickHandler = function(e) {
            let boundElem = e.currentTarget,
                descriptors = handlerDescriptorsByElemMap.get(boundElem);

            if (!descriptors) {
                return;
            }

            descriptors.forEach(desc => {
                let clickedElem = e.target;
                while (clickedElem && clickedElem !== boundElem) {
                    let matches = desc.isClass ? clickedElem.classList.contains(desc.classOrSelector) :
                        clickedElem.matches(desc.classOrSelector);

                    if (matches) {
                        // console.warn('match: %o, data = %o', clickedElem, ko.dataFor(clickedElem));
                        e.preventDefault();
                        return desc.handler(ko.dataFor(clickedElem), e);
                    }
                    clickedElem = clickedElem.parentNode;
                }
            });
        },
        sharedDisposalHandler = function(elem) {
            elem.removeEventListener(eventName, sharedClickHandler, false);
            // console.debug('removed click listener from %o', elem);
            handlerDescriptorsByElemMap.delete(elem);
        };

    return function(elem, valueAccessor /*, allBindings, viewModel, bindingContext */) {
        let handlerMap = valueAccessor() || {};

        let descriptors = handlerDescriptorsByElemMap.get(elem);

        if (!descriptors) {
            descriptors = [];
            handlerDescriptorsByElemMap.set(elem, descriptors);
            elem.addEventListener(eventName, sharedClickHandler, false);
            ko.utils.domNodeDisposal.addDisposeCallback(elem, sharedDisposalHandler);
        }

        Object.entries(handlerMap).forEach(([classOrSelector, handler]) => {
            descriptors.push({
                classOrSelector: classOrSelector.trim(),
                isClass: classOrSelector.indexOf(' ') < 0,
                handler
            });
        });
    };

};


/**
 * Binding to allow more efficient click handlers on large lists by using a common delegate-click-handler
 * on a common parent element instead of individual per-item click bindings.
 *
 * The value is a map of <classOrSelector> -> handler function (e.g. function($koData, event){..}).
 * If classOrSelector contains NO spaces, it is considered a CSS class name to match, otherwise a CSS selector.
 *
 * Example:
 *    <ul data-bind="forEach: items, nestedClick: {itemClass: someClickHandler, '.itemClass span': someOtherHandler}">
 *        <li class="itemClass">...</li>
 *        <li class="">
 *            <span>huhu</span>
 *        </li>
 *    </ul>
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.bindingHandlers.nestedClick = {
    init: _getNestedBinding('click')
};


/**
 * Same as `nestedClick` binding but for `contextmenu` events.
 * (Lazy-creating this binding's `init` handler since it is likely used less frequently at all than nestedClick)
 */
ko.bindingHandlers.nestedContextMenu = {
    get init() {
        if (!this._initFn) {
            this._initFn = _getNestedBinding('contextmenu');
        }
        return this._initFn;
    }
};