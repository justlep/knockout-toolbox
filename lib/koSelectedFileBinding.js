import {ko, $} from './libs.js';

/**
 * A knockout binding for <input type=file> elements.
 * Puts the input's currently selected file (not the element itself!) into the given observable.
 * The value can then directly be used to populate a FormData object for uploading the file via AJAX.
 * (!) When the input-input is disposed from the DOM, the selectedFile-observable will be reset to {code null}.
 *
 * Example:
 *   viewModel = {
 *       theFile = ko.observable();
 *   }
 *
 *   <input type="file" data-bind="selectedFile: theFile">
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.bindingHandlers.selectedFile = {
    init: function(fileInputElem, valueAccessor) {
        let _selectedFileObservable = valueAccessor();

        if (!ko.isObservable(_selectedFileObservable)) {
            throw 'Invalid argument for koSelectedFileBinding';
        }
        if (!fileInputElem || fileInputElem.nodeName !== 'INPUT' || fileInputElem.type !== 'file') {
            throw 'Invalid element for for koSelectedFileBinding';
        }

        let _changeHandler = function() {
            let file = fileInputElem.files && fileInputElem.files[0];

            if (file) {
                _selectedFileObservable(file);
            } else if (_selectedFileObservable.peek()) {
                _selectedFileObservable(null);
            }
        };

        $(fileInputElem).on('change', _changeHandler);

        ko.utils.domNodeDisposal.addDisposeCallback(fileInputElem, function() {
            $(fileInputElem).off('change', _changeHandler);
            _selectedFileObservable(null);
        });
    }
};
