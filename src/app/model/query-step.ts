import {QueryMode} from './query-mode';

export class QueryStep {
    public mode: QueryMode;
    
    public params: any;
    
    public resultInfo: string;
    
    constructor (mode: QueryMode, params: any) {
        this.mode = mode;
        this.params = params;
    }
}