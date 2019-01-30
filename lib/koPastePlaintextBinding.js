import {ko} from './libs.js';

/**
 * Extender to be used on `contenteditable` elements, making sure HTML content is pasted as text/plain.
 *
 * Example:
 *    <div conteneditable="true"> anything pasted here will be pasted as plain-text </div>
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.bindingHandlers.pastePlaintext = {
    init: (elem /*, valueAccessor */) => {
        elem.addEventListener('paste', _pasteHandler);
        ko.utils.domNodeDisposal.addDisposeCallback(elem, function() {
            elem.removeEventListener('paste', _pasteHandler, false);
        });
    }
};

function _pasteHandler(e) {
    e.preventDefault();
    let text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
}
