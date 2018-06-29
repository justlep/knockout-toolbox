import {ko} from './libs.js';

/**
 * A minimalistic pair of components for rendering tabbed panels.
 *
 * Example:
 *
 *    <ko-tabs>
 *        <ko-tab params="label: 'Tab #1'">
 *            This is the first panel's content.
 *        </ko-tab>
 *        <ko-tab params="label: 'Tab #2'">
 *            This is the second panel's content.
 *        </ko-tab>
 *
 *
 * For styling, make sure you define respective CSS rules for:
 *      .tabs__container {}
 *      .tabs__tabs {}
 *      .tabs__tab {}
 *      .tabs__tab--active {}
 *      .tabs__panels {}
 *      .tabs__panel {}
 *
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 **/

ko.components.register('ko-tabs', {
    viewModel: {
        createViewModel: (p) => ({
            labels: ko.observableArray(),
            activeLabel: ko.observable(p.activeLabel || null),
            addLabel(label) {
                if (this.labels.peek().indexOf(label) < 0) {
                    this.labels.push(label);
                    if (!this.activeLabel.peek()) {
                        this.activeLabel(label);
                    }
                } else {
                    throw new Error('Duplicate tab label: ' + label);
                }
            }
        })
    },
    template:
        '<div class="tabs__container">' +
            '<ul class="tabs__tabs" role="tablist" data-bind="foreach: labels">' +
                '<li class="tabs__tab" role="tab" ' +
                    'data-bind="css: {\'tabs__tab--active\': $parent.activeLabel()===$data}, text: $data, click: $parent.activeLabel"></li>' +
            '</ul>' +
            '<div class="tabs__panels" data-bind="template: { nodes: $componentTemplateNodes }"></div>' +
        '</div>'
});

ko.components.register('ko-tab', {
    viewModel: {
        createViewModel: (p) => {
            if (!p.label || typeof p.label !== 'string') {
                throw new Error('Invalid label for tab');
            }
            return {
                label: p.label
            };
        }
    },
    template:
        '<!-- ko if: $parent.addLabel(label) --><!--/ko -->' +
        '<!-- ko if: $parent.activeLabel() === label -->' +
            '<div class="tabs__panel" role="tabpanel" data-bind="template: {nodes: $componentTemplateNodes, data: $parents[1]}"></div>' +
        '<!-- /ko -->'
});
