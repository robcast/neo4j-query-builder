import {QueryStep} from './query-step';
import {ResultType} from './result-type';
import {QueryMode, getQueryModeById} from './query-mode';

export class QueryState {
    public steps: QueryStep[] = [];

    public resultCypherQuery: string;
    public attributesCypherQuery: string;
    public outRelsCypherQuery: string;
    public inRelsCypherQuery: string;
    public cypherQueryParams: any;

    public results: any[];
    public numResults: number;
    public resultTypes: string;
    public resultType: ResultType;
    public resultInfo: string;
    public resultAttributes: string[];
    public resultRelations: any[];
    public resultColumns: any[];
    
    /**
     * Sets the query state from a string.
     */
    setStateFromString(newStateString: string) {
        try {
            // state string is json
            let newState = JSON.parse(newStateString);
            // state should be list of steps
            if (!Array.isArray(newState)) return;
            let newSteps: QueryStep[] = [];
            newState.forEach((elem) => {
                // step is an array [mode, params]
                if (!Array.isArray(elem)) return;
                let mode = elem[0];
                // get QueryMode object
                let qm: QueryMode = getQueryModeById(mode);
                let params = elem[1];
                if (qm != null && params != null) {
                    // construct QueryStep
                    let qs = new QueryStep(qm, params);
                    newSteps.push(qs);
                }
            });
            if (newSteps.length > 0) {
                // set new state
                this.steps = newSteps;
            }
        } catch (e) {
            console.error("Unable to set state from string: "+newStateString);
        }
    }

    /**
     * Returns the current query state as a string.
     */
    getStateAsString(): string {
        let stateList = this.steps.map((qs) => [qs.mode.id, qs.params]);
        let stateStr = JSON.stringify(stateList);
        return stateStr;
    }

    /**
     * Returns the cypher query as text for display.
     */
    getQueryText() {
        let text = this.resultCypherQuery;
        let hasParams = false;
        for (let k in this.cypherQueryParams) {
            if (!hasParams) {
                hasParams = true;
                text += '\n';
            }
            text += `[${k}='${this.cypherQueryParams[k]}'] `;
        }
        return text;
    }
    
    getNumSteps() {
        return this.steps.length;
    }
    
    setResultInfo(info: string) {
        this.resultInfo = info;
        this.steps[this.steps.length-1].resultInfo = info;
    }
}