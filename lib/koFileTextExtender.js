import {ko} from './libs.js';

/**
 * Extender for observables holding the file of an <input type=file> input.
 * Adds to the observable a new observable property `fileText` which
 * will contain the selected file's (text-)content as a string.
 *
 * The observable is expected to contain the File object for the selected file of the <input type=file/>,
 * NOT just the selected filename or names. This can be established by using the `selectedFile` binding on the input -
 * See {@link ko.bindingHandlers.selectedFile} in `koSelectedFileBinding.js`.
 *
 * Example:
 *    viewModel = {
 *      newTextFile: ko.observable().extend({fileText: true})
 *    }
 *
 *    <input type="file" data-bind="selectedFile: newTextFile">
 *    <div data-bind="with: newTextField.fileText()">
 *      <h5>Preview:</h5>
 *      <p data-bind="text: $data"></p>
 *    </div>
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.extenders.fileText = function(target, options) {
    if (typeof FileReader === 'undefined') {
        throw new Error('Knockout fileText-extender unavailable - Browser does not support FileReader');
    }

    let _fileTextObservable = ko.observable(null),
        _reader = new FileReader();

    _reader.onload = function (e) {
        let textContent = e.target.result;
        _fileTextObservable(textContent);
    };

    ko.computed(function () {
        _fileTextObservable(null);
        if (target()) {
            // TODO check if exception-handling is required
            _reader.readAsText(target());
        }
    });

    target.fileText = _fileTextObservable;

    return target;
};
