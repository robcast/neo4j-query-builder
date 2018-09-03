export interface QueryMode {
    id: string;
    label: string;
}

const QUERY_MODES = [
    { id: 'type_is', label: 'Object type is' },
    { id: 'att_contains', label: 'Attribute (contains)' },
    { id: 'att_num_range', label: 'Attribute (number range)' },
    { id: 'relation_is', label: 'Relation type is' },
    { id: 'att_contains_norm', label: 'Attribute (contains normalized)' },
    { id: 'id_is', label: 'Object ID is' }
]

export function getQueryModeById(id: string) {
    return QUERY_MODES.find((elem) => elem.id === id);
}

export function getQueryModes(first = false, withId = false, withNorm = false): QueryMode[] {
    let modes: QueryMode[] = [];
    if (first) {
        modes.push(getQueryModeById('type_is'));
    } else {
        modes.push(getQueryModeById('type_is'));
        modes.push(getQueryModeById('att_contains'));
        if (withNorm) {
            modes.push(getQueryModeById('att_contains_norm'));
        }
        modes.push(getQueryModeById('att_num_range'));
        modes.push(getQueryModeById('relation_is'));
    }
    if (withId) {
        modes.push(getQueryModeById('id_is'));
    }
    return modes;
}