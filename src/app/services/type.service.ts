import { Injectable } from '@angular/core';
import { ResultType } from '../model/result-type';
import { RelationType, invNamePrefix } from '../model/relation-type';

/**
 * Type service.
 */
@Injectable({
    providedIn: 'root'
})
export class TypeService {

    protected RESULT_TYPES: { [name: string]: ResultType } = {
        // no default relation type
    }
    
    protected RELATION_TYPES: { [name: string]: RelationType } = {
        // no default relation type
    }

    public getResultType(name: string): ResultType {
        let rt = this.RESULT_TYPES[name];
        if (rt == null) {
            rt = this.RESULT_TYPES['*'];
        }
        if (rt == null) {
            rt = new ResultType(name, name);
        }
        return rt;
    }
    
    public getRelationType(relType: string, isOutgoing: boolean): RelationType {
        let name = relType;
        if (isOutgoing === false) {
            // add prefix to name
            name = invNamePrefix + name;
        } 
        let rt = this.RELATION_TYPES[name];
        if (rt == null) {
            rt = new RelationType(relType, isOutgoing);
        }
        return rt;
    }

    public getRelationByName(name: string): RelationType {
        let rt = this.RELATION_TYPES[name];
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


}
