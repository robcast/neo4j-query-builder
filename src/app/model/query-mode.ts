export interface QueryMode {
    id: string;
    label: string;
}

export function getQueryModeById(id: string) {
    return QUERY_MODES.find((elem) => elem.id === id);
}

export var QUERY_MODES: QueryMode[] = [
    {id: 'type_is', label:'Object type is'},
    {id: 'att_contains', label: 'Attribute (contains)'},
    {id: 'att_contains_norm', label: 'Attribute (contains normalized)'},
    {id: 'att_num_range', label: 'Attribute (number range)'},    
    {id: 'relation_is', label: 'Relation type is'},
    {id: 'id_is', label: 'Object ID is'}
];

export var FIRST_QUERY_MODES: QueryMode[] = [
    {id: 'type_is', label:'Object type is'},
    {id: 'id_is', label: 'Object ID is'}
];        
