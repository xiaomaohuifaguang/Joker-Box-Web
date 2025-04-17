import { html } from 'htm/preact';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function (element, item) {
    var spells = []


    console.log(item)
    item.properties.forEach(prop => {
        spells.push({
            id: prop.name,
            element,
            component: ItemCompent,
            isEdited: isTextFieldEntryEdited
        })
    });

    return spells;
}

function ItemCompent(props) {
    const { element, id } = props;

    const modeling = useService('modeling');
    const translate = useService('translate');
    const debounce = useService('debounceInput');

    const getValue = () => {
        return element.businessObject[id] || '';
    };

    const setValue = value => {
        return modeling.updateProperties(element, {
            [id]: value
        });
    };

    return html`<${TextFieldEntry}
    id=${id}
    element=${element}
    description=${translate('')}
    label=${translate(id)}
    getValue=${getValue}
    setValue=${setValue}
    debounce=${debounce}
    tooltip=${translate('')}
  />`;
}