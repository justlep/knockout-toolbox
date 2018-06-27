import {ko} from './libs.js';

/**
 * Extender for observables holding the file of an <input type=file> input.
 * Adds to the observable a new observable property `fileDataUrl` which
 * will contain the selected file's content as a data-url which can be used as src-attribute for <img> elements
 * in order to show a preview of the selected image file.
 *
 * The observable is expected to contain the File object for the selected file of the <input type=file/>,
 * NOT just the selected filename or names. This can be established by using the `selectedFile` binding on the input -
 * See {@link ko.bindingHandlers.selectedFile} in `koSelectedFileBinding.js`.
 *
 * Example:
 *    viewModel = {
 *      newImageFile: ko.observable().extend({fileDataUrl: true});
 *    }
 *
 *    <input type="file" data-bind="selectedFile: newImageFile">
 *    <div data-bind="with: newImageFile.fileDataUrl()">
 *      <h5>Preview:</h5>
 *      <img data-bind="attr: {src: $data}"/>
 *    </div>
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.extenders.fileDataUrl = function(target, options) {
    if (typeof FileReader === 'undefined') {
        throw new Error('Knockout fileDataUrl-extender unavailable - Browser does not support FileReader');
    }

    let fileDataUrlObservable = ko.observable(null),
        reader = new FileReader();

    reader.onload = function (e) {
        let dataUrl = e.target.result;
        fileDataUrlObservable(dataUrl);
    };

    ko.computed(function () {
        fileDataUrlObservable(null);
        if (target()) {
            reader.readAsDataURL(target());
        }
    });

    target.fileDataUrl = fileDataUrlObservable;

    return target;
};
