import {RelationType, invNamePrefix} from './relation-type';

export var RELATION_TYPES: {[name:string]: RelationType} = {};

addRelationType('is_part_of', 'is included in', 'includes');
addRelationType('is_exemplar_of', 'title of witness', 'witnesses to title');
addRelationType('was_created_by', 'created by', 'works of');
addRelationType('has_subject', 'subject of title', 'titles with subject');
addRelationType('has_role', 'roles of person', 'persons with role');
addRelationType('is_alias_name_of', 'person name for alias', 'alias of person');
addRelationType('is_alias_title_of', 'title name for alias', 'alias of title');
addRelationType('is_commentary_on', 'is commentary on', 'list of commentaries');
addRelationType('has_title_written_as', 'title in witness', 'witness with title as');
addRelationType('has_author_written_as', 'author in witness', 'witness with author as');
addRelationType('lived_in', 'place person lived in', 'persons who lived in');
addRelationType('was_copied_by', 'witness copied by', 'witnesses that were copied by');
addRelationType('was_born_in', 'place person was born in', 'persons who were born in');
addRelationType('owned_by', 'codex owned by', 'persons who owned codex');
addRelationType('was_student_of', 'studied with', 'persons studying with');
addRelationType('died_in', 'place person died in', 'persons who died in');
addRelationType('was_created_in', 'place title was created', 'titles that were created in');
addRelationType('was_copied_in', 'place witness was copied', 'witnesses that were copied in');
addRelationType('misattributed_to', 'title misattributed to', 'misattributions to person');
addRelationType('was_dedicated_to', 'text dedicated to', 'texts that were dedicated to');
addRelationType('is_version_of', 'standard text of different version', 'different version of standard text');
addRelationType('is_translation_of', 'original text of a translation', 'translation of a text');
addRelationType('has_floruit_date', 'floruit date of person', 'persons with floruit date');
addRelationType('was_studied_by', 'persons studying this text', 'text studied by');
//addRelationType('', '', '');

export function getRelationType(relType: string, isOutgoing: boolean): RelationType {
    let name = relType;
    if (isOutgoing === false) {
        // add prefix to name
        name = invNamePrefix + name;
    } 
    let rt = RELATION_TYPES[name];
    if (rt == null) {
        rt = new RelationType(relType, isOutgoing);
    }
    return rt;
}

export function getRelationByName(name: string): RelationType {
    let rt = RELATION_TYPES[name];
    if (rt == null) {
        if (name.indexOf(invNamePrefix) == 0) {
            // inverse relation
            name = name.substr(invNamePrefix.length);
            rt = new RelationType(name, false);
        } else {
            rt = new RelationType(name, true);
        }
    }
    return rt;
}

function addRelationType(name: string, outLabel: string, inLabel: string) {
    // add outgoing relation
    RELATION_TYPES[name] = new RelationType(name, true, outLabel);
    // add inverse relation
    RELATION_TYPES[invNamePrefix + name] = new RelationType(name, false, inLabel);
}