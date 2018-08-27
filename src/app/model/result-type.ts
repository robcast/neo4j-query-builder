import {ResultColumn} from './result-column';

export class ResultType {
    public name: string;
    public idAttribute: string;
    public allowedAttributes: string[];
    public deniedAttributes: string[];
    
    constructor (name: string, idAttribute: string, allowedAttributes: string[]=[], deniedAttributes: string[]=[]) {
        this.name = name;
        this.idAttribute = idAttribute;
        this.allowedAttributes = allowedAttributes;
        this.deniedAttributes = deniedAttributes;
    }
    
    /**
     * Return columns for the given list of attributes.
     */
    getColumns(attributes: string[], allAttributes=true): ResultColumn[] {
        let atts = attributes.slice();
        let cols = [];
        // allowed attributes
        this.allowedAttributes.forEach(att =>  {
            let idx = atts.indexOf(att);
            if (idx > -1) {
                cols.push(new ResultColumn(att, att, '', true));
                atts[idx] = null;
            }
        });
        // then other attributes
        if (allAttributes) {
            atts.forEach(att => {
                if (att != null && att[0] != '_' && this.deniedAttributes.indexOf(att) < 0) {
                    cols.push(new ResultColumn(att, att, '', false));
                }
            });           
        }        
        return cols;
    }
    
}

export function getResultType(name: string, resultTypes: {[name:string]: ResultType}): ResultType {
    let rt = resultTypes[name];
    if (rt == null) {
        rt = resultTypes['*'];
    }
    return rt;
}