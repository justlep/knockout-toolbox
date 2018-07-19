import {ko} from './libs.js';

/**
 * A minimalistic pair of components for rendering tabbed panels.
 *
 * Example:
 *
 *    <ko-tabs params="keyForRestore: 'my-restorable-tabs--btw-this-is-optional'">
 *        <ko-tab params="label: 'Tab #1'">
 *            This is the first panel's content.
 *        </ko-tab>
 *        <ko-tab params="label: 'Tab #2', preselected: true">
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

let _lastUsedTabLabelByKey = {};

ko.components.register('ko-tabs', {
    viewModel: {
        createViewModel: (p) => ({
            keyForRestore: String(p.keyForRestore || ''),
            labels: ko.observableArray(),
            activeLabel: ko.observable(),
            setActiveLabel(label) {
                this.activeLabel(label);
                if (this.keyForRestore) {
                    _lastUsedTabLabelByKey[p.keyForRestore] = label;
                }
            },
            addLabel(label) {
                if (this.labels.peek().indexOf(label) >= 0) {
                    throw new Error('Duplicate tab label: ' + label);
                }
                return this.labels.push(label);
            },
            tabsComplete() {
                let label = this.activeLabel.peek() || _lastUsedTabLabelByKey[this.keyForRestore];
                if (!label || this.labels.peek().indexOf(label) < 0) {
                    label = this.labels.peek()[0];
                }
                this.setActiveLabel(label);
            }
        })
    },
    template:
        '<div class="tabs__container">' +
            '<ul class="tabs__tabs" role="tablist" data-bind="foreach: labels">' +
                '<li class="tabs__tab" role="tab" ' +
                    'data-bind="css: {\'tabs__tab--active\': $parent.activeLabel()===$data}, text: $data, click: () => $parent.setActiveLabel($data)"></li>' +
            '</ul>' +
            '<div class="tabs__panels" data-bind="template: { nodes: $componentTemplateNodes, afterRender: ((vm) => () => setTimeout(() => vm.tabsComplete(), 0))($data)}"></div>' +
        '</div>'
});

ko.components.register('ko-tab', {
    viewModel: {
        createViewModel: (p) => {
            if (!p.label || typeof p.label !== 'string') {
                throw new Error('Invalid label for tab');
            }
            return {
                label: p.label,
                preselected: p.preselected && ko.unwrap(p.preselected)
            };
        }
    },
    template:
        '<!-- ko if: $parent.addLabel(label) && preselected && $parent.setActiveLabel(label) --><!--/ko -->' +
        '<!-- ko if: $parent.activeLabel() === label -->' +
            '<div class="tabs__panel" role="tabpanel" data-bind="template: {nodes: $componentTemplateNodes, data: $parents[1]}"></div>' +
        '<!-- /ko -->'
});
