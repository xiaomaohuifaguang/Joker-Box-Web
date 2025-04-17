// Import your custom property entries.
// The entry is a text input field with logic attached to create,
// update and delete the "spell" property.
import spellProps from './parts/SpellProps';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import extennsion from '../../../extension-moddle/flowable'

const LOW_PRIORITY = 500;


/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function FlowablePropertiesProvider(propertiesPanel, translate) {

    // API ////////

    /**
     * Return the groups provided for the given element.
     *
     * @param {DiagramElement} element
     *
     * @return {(Object[]) => (Object[])} groups middleware
     */
    this.getGroups = function (element) {

        /**
         * We return a middleware that modifies
         * the existing groups.
         *
         * @param {Object[]} groups
         *
         * @return {Object[]} modified groups
         */
        return function (groups) {



            extennsion.types.forEach(item => {
                item.extends.forEach(extend => {
                    if (is(element, extend)) {
                        groups.push(createGroup(element, translate, item));
                    }
                })

            });

            if (is(element, 'bpmn:SequenceFlow')) {
                // console.log(666)
                groups.push({
                    id: 'conditionExpression',
                    label: '张三',
                    entries: spellProps(element, {
                        properties: [
                            { name: 'conditionExpression' }
                        ]
                    }),
                })
            }

            return groups;
        };
    };


    propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

FlowablePropertiesProvider.$inject = ['propertiesPanel', 'translate'];


function createGroup(element, translate, item) {


    const group = {
        id: item.name,
        label: translate(item.name),
        entries: spellProps(element, item),
        // tooltip: translate('Make sure you know what you are doing!')
    };

    return group;
}