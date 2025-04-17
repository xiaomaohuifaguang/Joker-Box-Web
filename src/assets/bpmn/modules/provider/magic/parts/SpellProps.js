import { html } from 'htm/preact';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

// import hooks from the vendored preact package
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

export default function (element) {

    return [
        {
            id: 'spell',
            element,
            component: Spell,
            isEdited: isSelectEntryEdited
        }
    ];
}

function Spell(props) {
    const { element, id } = props;

    const modeling = useService('modeling');
    const translate = useService('translate');
    const debounce = useService('debounceInput');

    const getValue = () => {
        return element.businessObject.spell || '';
    };

    const setValue = value => {
        return modeling.updateProperties(element, {
            spell: value
        });
    };

    const getOptions = () => {
        return [
            { label: '选项一', value: '1' },
            { label: '选项二', value: '2' },
            { label: '选项三', value: '3' },
        ];
    };

    return html`<${SelectEntry}
    id=${id}
    element=${element}
    description=${translate('')}
    label=${translate(id)}
    getValue=${getValue}
    setValue=${setValue}
    getOptions=${getOptions}
    debounce=${debounce}
    tooltip=${translate('')}
  />`;
}