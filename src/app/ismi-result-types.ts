import {ResultType} from './result-type';


export var ISMI_RESULT_TYPES: {[name:string]: ResultType} = {
    '*': new ResultType('*', 'ismi_id', [
            'ismi_id', 'label'
        ]),
    'PERSON': new ResultType('PERSON', 'ismi_id', [
        'ismi_id', 'name_translit', 'name', 'birth_date', 'death_date'
    ]),
    'TEXT': new ResultType('TEXT', 'ismi_id', [
        'ismi_id', 'full_title_translit', 'full_title', 'creation_date'
    ]),
    'WITNESS': new ResultType('WITNESS', 'ismi_id', [
         'ismi_id', '_label', 'creation_date'
    ])
}
