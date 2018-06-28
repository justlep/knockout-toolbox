import {ko, $} from './libs.js';

/**
 * Binding to allow more efficient click handlers on large lists, binding a delegate-click-handler to one
 * parent element instead of multiple individual per-item click bindings.
 * Example:
 *    <ul data-bind="forEach: items, nestedClick: {itemClass: someClickHandler}">
 *        <li class="itemClass">...</li>
 *    </ul>
 */
ko.bindingHandlers.nestedClick = {
    init: function(elem, valueAccessor /*, allBindings, viewModel, bindingContext */) {
        let handlerMap = valueAccessor() || {},
            jElem = $(elem);

        Object.keys(handlerMap).forEach(function(classOrSelector) {
            // per default, treat selector strings without spaces as class names
            let handler = handlerMap[classOrSelector],
                selector = (classOrSelector.indexOf(' ') < 0) ? ('.'+classOrSelector) : classOrSelector;
            // console.warn('selected: %s, handler: %o', selector, handler);
            this.on('click', selector, function(e) {
                e.preventDefault();
                // console.warn('delegated click, args = %o', arguments);
                handler(ko.dataFor(e.target), e);
                return false;
            });
        }, jElem);

        ko.utils.domNodeDisposal.addDisposeCallback(elem, function() {
            // console.warn('Removing nestedClick handlers for %o', elem);
            jElem.off('click', '**');
            jElem = null;
        });
    }
};