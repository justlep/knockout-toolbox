import {ko, $} from './libs.js';

let getValidFilesFromEvent = function(_e, regex, multiple) {
    let e = _e.originalEvent || _e,
        files = (e.dataTransfer || e.target || {}).files || [];

    return regex ? files.filter(f => regex.test(f.name)) : files;
};

/**
 * A binding allows dropping one or multiples file on a label or file-input.
 * The target function (or observable) will be called with an array containing the dropped File objects.
 *
 * Examples:
 *  <form>
 *   <label data-bind="dropFile: {target: droppedFiles, dragOverClass: 'someCssHoverClass'}">
 *    <input type="file" data-bind="dropFile: {target: droppedFiles }">
 *    <input type="file" data-bind="dropFile: {target: droppedFiles, multiple: true, resetFormAfterAdd: true">
 *    <input type="file" data-bind="dropFile: {target: droppedFiles, accept: ['.txt','.doc'] }">
 *    <input type="file" data-bind="dropFile: {target: droppedFiles, accept: /\.(txt|doc)$/i }">
 *   </label>
 *  </form>
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
ko.bindingHandlers.dropFile = {
    init: function(elem, valueAccessor, allBindings, viewModel, bindingContext) {
        let isFileInput = elem.nodeName.toLowerCase() === 'input' && elem.type === 'file',
            opts = valueAccessor(),
            accept = opts.accept || null,
            filenameRegex = !accept ? null :
                (accept instanceof RegExp) ? accept :
                    (accept instanceof Array && accept.length) ? new RegExp('('+ accept.join('|').replace(/\./g,'\\.') + ')$','i') : null,

            onDropOrChange = function(e) {
                e.preventDefault();
                opts.target( getValidFilesFromEvent(e, filenameRegex) );
                let formToReset = opts.resetFormAfterAdd && e.target.form;
                if (formToReset && typeof formToReset.reset === 'function') {
                    setTimeout(function() {
                        // console.log('resetting form');
                        formToReset.reset();
                    }, 1);
                }
                if (dragoverClass) {
                    elem.classList.remove(dragoverClass);
                }
            },
            dragoverClass = opts.dragOverClass || null;

        // console.log('filenameRegex: %o', filenameRegex);

        if (isFileInput) {
            $(elem).prop('multiple', opts.multiple).on('change', onDropOrChange);
            if (accept instanceof Array && accept.length) {
                elem.setAttribute('accept', accept.join(','));
            }
        } else {
            $(elem).on({
                drop: onDropOrChange,
                dragover: (e) => {
                    if (dragoverClass) {
                        elem.classList.add(dragoverClass);
                    }
                    e.preventDefault();
                },
                dragleave: function(e) {
                    if (dragoverClass) {
                        elem.classList.remove(dragoverClass);
                    }
                    e.preventDefault();
                }
            });
        }
    }
};