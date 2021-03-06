import { Component, Output, EventEmitter, OnInit, Input, SimpleChanges } from '@angular/core';

import { QueryMode } from '../model/query-mode';
import { QueryStep } from '../model/query-step';
import { QueryState } from '../model/query-state';

import { QueryService } from '../services/query.service';
import { NormalizationService } from '../services/normalization.service';
import { TypeService } from '../services/type.service';


@Component({
    selector: 'query-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.css'],
    outputs: ['queryChanged']
})
export class SelectComponent implements OnInit {
    // inputs
    @Input() queryStep: string;
    @Input() index: number;
    queryState: QueryState;
    // output
    @Output() queryChanged: EventEmitter<QueryState> = new EventEmitter<QueryState>();
    
    public resultInfo: string;
    public queryModes: Array<QueryMode>;
    public selectedMode: QueryMode;
    public queryOptions: any[];
    public selectedOption: string;
    public queryInput: string;
    public queryInput2: string;

    constructor(private _queryService: QueryService, private _normService: NormalizationService,
            private _typeService: TypeService) {
        _queryService.queryState$.subscribe(state => this.onQueryStateChange(state));
    }
    
    ngOnInit() {
        this.setup();
    }

    onQueryStateChange(newstate: QueryState) {
        console.debug("select.onQueryStateChange ", newstate);
        this.queryState = newstate;
        let step = this.queryState.steps[this.index]; // i-1?
        if (step != null) {
            this.resultInfo = step.resultInfo;
        }        
    }
    
    setup() {
        console.log("query-select setup step=", this.queryStep);
        // set up current step
        let step = this.queryState.steps[this.index]; // i-1?
        if (step != null) {
            this.setQueryStep(step);
            this.resultInfo = step.resultInfo;
        }
    }

    getQueryModes(): QueryMode[] {
        this.queryModes = this._queryService.getQueryModes(this.index);
        return this.queryModes;
    }

    onSelectMode(event: any) {
        var selected = event.target.value;
        this.selectedMode = this.queryModes.find(mode => mode.id === selected);
        this.queryOptions = this._queryService.getQueryOptions(this.selectedMode);
    }

    onSelectOption(event: any) {
        var selected = event.target.value;
        console.debug("selected option:", selected);
        this.selectedOption = selected;
        this.onSubmit();
    }

    onSubmit() {
        console.debug("Submit! selectedMode=", this.selectedMode, " selectedOption=", this.selectedOption, " queryInput=", this.queryInput);

        let step = this.getQueryStep();

        /*
         * set step and submit change event
         */
        if (step != null) {
            this._queryService.setQueryStep(this.index, step);
            this.queryChanged.emit(this._queryService.getState());
        }
        return false;
    }

    /**
     * Returns QueryStep from current form state.
     */
    getQueryStep(): QueryStep {
        let step: QueryStep = null;

        if (this.selectedMode.id === 'type_is') {
            /*
             * type_is
             */
            let opt = this.selectedOption;
            if (opt) {
                step = new QueryStep(this.selectedMode, { 'objectType': opt });
            }
        } else if (this.selectedMode.id === 'relation_is') {
            /*
             * relation_is
             */
            let opt = this.selectedOption;
            if (opt) {
                let rel = this._typeService.getRelationByName(opt);
                step = new QueryStep(this.selectedMode, { 'relationType': rel });
            }
        } else if (this.selectedMode.id === 'id_is') {
            /*
             * id is
             */
            let val = this.queryInput;
            if (val) {
                step = new QueryStep(this.selectedMode, { 'value': val });
            }
        } else if (this.selectedMode.id === 'att_contains') {
            /*
             * att_contains
             */
            let att = this.selectedOption;
            let val = this.queryInput;
            if (att && val) {
                step = new QueryStep(this.selectedMode, { 'attribute': att, 'value': val });
            }
        } else if (this.selectedMode.id === 'att_num_range') {
            /*
             * att_num_range
             */
            let att = this.selectedOption;
            let nlo = this.queryInput;
            let nhi = this.queryInput2;
            if (att && nlo && nhi) {
                step = new QueryStep(this.selectedMode, { 'attribute': att, 'numLo': nlo, 'numHi': nhi });
            }
        } else if (this.selectedMode.id === 'att_contains_norm') {
            /*
             * att_contains_norm
             * 
             * calls normalization service and submits event in callback
             */
            let att = this.selectedOption;
            let val = this.queryInput;
            if (att && val) {
                // run search term through normalizer 
                this._normService.normalize(val)
                    .subscribe(
                    data => {
                        console.debug("normalized data=", data);
                        step = new QueryStep(this.selectedMode, { 'attribute': att, 'value': val, 'normValue': data });
                        this._queryService.setQueryStep(this.index, step);
                        // query has changed now
                        this.queryChanged.emit(this._queryService.getState());
                    },
                    err => console.error("normalization error=", err),
                    () => console.debug("normalization query complete")
                    );
                // query has not been set yet (gets set in callback)
                return null;
            }
        }
        return step;
    }

    /**
     * Sets form state from given QueryStep.
     */
    setQueryStep(step: QueryStep) {
        let mode = step.mode;
        this.selectedMode = mode;
        if (mode.id === 'id_is') {
            /*
             * id_is
             */
            this.queryInput = step.params.value;

        } else if (mode.id === 'type_is') {
            /*
             * type_is
             */
            let name = step.params.objectType;
            this.queryOptions = [name];
            this.selectedOption = name;

        } else if (this.selectedMode.id === 'relation_is') {
            /*
             * relation_is
             */
            let name = step.params.relationType.name
            let rel = this._typeService.getRelationByName(name);
            this.queryOptions = [rel];
            this.selectedOption = name;

        } else if (this.selectedMode.id === 'att_contains') {
            /*
             * att_contains
             */
            let name = step.params.attribute
            this.queryOptions = [name];
            this.selectedOption = name;
            this.queryInput = step.params.value;

        } else if (this.selectedMode.id === 'att_num_range') {
            /*
             * att_num_range
             */
            let name = step.params.attribute
            this.queryOptions = [name];
            this.selectedOption = name;
            this.queryInput = step.params.numLo;
            this.queryInput2 = step.params.numHi;

        } else if (this.selectedMode.id === 'att_contains_norm') {
            /*
             * att_contains_norm
             */
            let name = step.params.attribute
            this.queryOptions = [name];
            this.selectedOption = name;
            this.queryInput = step.params.value;
        }
        // TODO: implement other modes
    }
}
