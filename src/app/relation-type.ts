
export var invLabelPrefix = '<- ';
export var invNamePrefix = '-';
export var rawLabelPrefix = '(';
export var rawLabelPostfix = ')';

export class RelationType {
    public name: string;
    public relType: string;
    public label: string;
    public outgoing: boolean;
    
    constructor (relType: string, isOutgoing: boolean, label?:string) {
        this.outgoing = isOutgoing;
        this.relType = relType;
        if (isOutgoing) {
            this.name = relType;
        } else {
            this.name = invNamePrefix + relType;
        }
        if (label != null) {
            this.label = label;
        } else {
            // create label using name
            if (isOutgoing) {
                this.label = rawLabelPrefix + relType + rawLabelPostfix;
            } else {
                this.label = rawLabelPrefix + invLabelPrefix + relType + rawLabelPostfix;
            }
        }
    }
    
    getLabel() {
        return this.label;
    }

    getName() {
        return this.name;
    }
    
    getRelType() {
        return this.relType;
    }
    
    isOutgoing() {
        return this.outgoing;
    }
}
