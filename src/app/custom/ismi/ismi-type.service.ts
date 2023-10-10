import { Injectable } from '@angular/core';
import { ResultType } from '../../model/result-type';
import { RelationType, invNamePrefix } from '../../model/relation-type';
import { TypeService } from '../../services/type.service';

/**
 * Type service.
 */
@Injectable({
    providedIn: 'root'
})
export class IsmiTypeService extends TypeService {

    /**
     * Name of the attribute that contains the type of the object.
     */
    public typeAttribute: string = '_type';

    /**
     * Name of the attribute that contains the id of the object.
     */
    public idAttribute: string = 'ismi_id';

    /**
     * Prefix of the attribute that contains the normalized value.
     */
    public normPrefix: string = null; // '_n_';

    protected RESULT_TYPES: { [name: string]: ResultType } = {
        '*': new ResultType('*', 'ismi_id', [
            'ismi_id', '_label'
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

    protected RELATION_TYPES: { [name: string]: RelationType } = {
        // no default relation type
    }

    constructor() {
        super();
        this.addRelationType('is_part_of', 'is included in', 'includes');
        this.addRelationType('is_exemplar_of', 'title of witness', 'witnesses to title');
        this.addRelationType('was_created_by', 'created by', 'works of');
        this.addRelationType('has_subject', 'subject of title', 'titles with subject');
        this.addRelationType('has_role', 'roles of person', 'persons with role');
        this.addRelationType('is_alias_name_of', 'person name for alias', 'alias of person');
        this.addRelationType('is_alias_title_of', 'title name for alias', 'alias of title');
        this.addRelationType('is_commentary_on', 'is commentary on', 'list of commentaries');
        this.addRelationType('has_title_written_as', 'title in witness', 'witness with title as');
        this.addRelationType('has_author_written_as', 'author in witness', 'witness with author as');
        this.addRelationType('lived_in', 'place person lived in', 'persons who lived in');
        this.addRelationType('was_copied_by', 'witness copied by', 'witnesses that were copied by');
        this.addRelationType('was_born_in', 'place person was born in', 'persons who were born in');
        this.addRelationType('owned_by', 'codex owned by', 'persons who owned codex');
        this.addRelationType('was_student_of', 'studied with', 'persons studying with');
        this.addRelationType('died_in', 'place person died in', 'persons who died in');
        this.addRelationType('was_created_in', 'place title was created', 'titles that were created in');
        this.addRelationType('was_copied_in', 'place witness was copied', 'witnesses that were copied in');
        this.addRelationType('misattributed_to', 'title misattributed to', 'misattributions to person');
        this.addRelationType('was_dedicated_to', 'text dedicated to', 'texts that were dedicated to');
        this.addRelationType('is_version_of', 'standard text of different version', 'different version of standard text');
        this.addRelationType('is_translation_of', 'original text of a translation', 'translation of a text');
        this.addRelationType('has_floruit_date', 'floruit date of person', 'persons with floruit date');
        this.addRelationType('was_studied_by', 'persons studying this text', 'text studied by');
        //addRelationType('', '', '');
    }
    
    protected addRelationType(name: string, outLabel: string, inLabel: string) {
        // add outgoing relation
        this.RELATION_TYPES[name] = new RelationType(name, true, outLabel);
        // add inverse relation
        this.RELATION_TYPES[invNamePrefix + name] = new RelationType(name, false, inLabel);
    }
}
