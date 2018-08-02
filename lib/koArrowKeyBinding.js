import {ko, $} from './libs.js';

/**
 * A knockout binding for arrow-key events, capturing keydown events on the given element,
 * then invoking a given callback with the current context and an object telling which arrow was pressed.
 *
 * Example:
 *   viewModel = {
 *       onArrowKey = (arrow) => {
 *          console.log('You pressed the %s arrow', arrow.up ? 'UP' : arrow.down ? 'DOWN' )
 *       }
 *   }
 *
 *   <input type="text" data-bind="arrowKey: onArrowKey" placeholder="all arrow keys captured">
 *   <input type="text" data-bind="arrowKey: {upDown: onArrowKey}" placeholder="up/down keys captured">
 *   <input type="text" data-bind="arrowKey: {leftRight: onArrowKey}" placeholder="left/right keys captured">
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.bindingHandlers.arrowKey = {
    init: function(elem, valueAccessor) {
        let optsOrFn = valueAccessor(),
            isObj = (typeof optsOrFn === 'object'),
            onUpDown = isObj ? optsOrFn.upDown : optsOrFn ,
            onLeftRight = isObj ? optsOrFn.leftRight : optsOrFn;

        let _keyHandler = function(e) {
            let keyCode = !e.charCode && e.keyCode || 0,
                handler,
                arrowParam;

            switch (keyCode) {
                case 37:
                    handler = onLeftRight;
                    arrowParam = {left: 1};
                    break;
                case 38:
                    handler = onUpDown;
                    arrowParam = {up: 1};
                    break;
                case 39:
                    handler = onLeftRight;
                    arrowParam = {right: 1};
                    break;
                case 40:
                    handler = onUpDown;
                    arrowParam = {down: 1};
                    break;
            }

            if (handler) {
                e.preventDefault();
                handler(arrowParam);
                return false;
            }
        };

        $(elem).on('keydown', _keyHandler);

        ko.utils.domNodeDisposal.addDisposeCallback(elem, function() {
            $(elem).off('keydown', _keyHandler);
        });
    }
};
