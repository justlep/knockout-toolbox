import {ko} from './libs.js';

let _getNestedBinding = function(eventName) {

    let descriptorsByElemMap = new WeakMap(),
        sharedClickHandler = function(e) {
            let boundElem = e.currentTarget,
                targetElem = e.target,
                descriptors = targetElem && descriptorsByElemMap.get(boundElem),
                eventNeedsStop = true;

            if (!descriptors) {
                return;
            }

            for (let {classNameFragment, selector, handler} of descriptors) {
                let testedElem = targetElem;

                while (testedElem && testedElem !== boundElem) {
                    let matches = classNameFragment ? (' ' + testedElem.className + ' ').indexOf(classNameFragment) >= 0 :
                        testedElem.matches(selector);
                    if (matches) {
                        if (eventNeedsStop) {
                            e.preventDefault();
                            e.stopPropagation();
                            eventNeedsStop = false;
                        }

                        handler(ko.dataFor(testedElem), e);
                        testedElem = null;
                    } else {
                        testedElem = testedElem.parentNode;
                    }
                }
            }
        },
        sharedDisposalHandler = function(elem) {
            elem.removeEventListener(eventName, sharedClickHandler, false);
            // console.debug('removed click listener from %o', elem);
            descriptorsByElemMap.delete(elem);
        };

    return function(elem, valueAccessor /*, allBindings, viewModel, bindingContext */) {
        let handlerBySelector = valueAccessor() || {},
            descriptors = descriptorsByElemMap.get(elem);

        if (!descriptors) {
            descriptors = [];
            descriptorsByElemMap.set(elem, descriptors);
            elem.addEventListener(eventName, sharedClickHandler, false);
            ko.utils.domNodeDisposal.addDisposeCallback(elem, sharedDisposalHandler);
        }

        for (let classOrSelector of Object.keys(handlerBySelector)) {
            let handler = handlerBySelector[classOrSelector],
                isClass = classOrSelector.indexOf(' ') < 0,
                descriptor = isClass ? {handler, classNameFragment: ' ' + classOrSelector + ' '} :
                    {handler, selector: classOrSelector.trim()};

            descriptors.push(descriptor);
        }
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
 * (Lazy-creating the `init` handler since nestedContextMenu is less likely to be used at all than nestedClick)
 */
ko.bindingHandlers.nestedContextMenu = {
    get init() {
        if (!this._initFn) {
            this._initFn = _getNestedBinding('contextmenu');
        }
        return this._initFn;
    }
};
