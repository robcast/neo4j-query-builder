import { Component, OnInit } from '@angular/core';

import { QueryService } from '../services/query.service';
import { QueryState } from '../model/query-state';

@Component( {
    selector: 'app-query',
    templateUrl: './query.component.html',
    styleUrls: ['./query.component.css']
} )
export class QueryComponent implements OnInit {
    
    public queryState: QueryState;
    public queryStepList: string[];

    constructor( private _queryService: QueryService ) {
        console.debug( "QueryAppComponent constructor!" );
        let newState = this.getStateStringFromUrlFragment();
        // initialize query service using external state
        this._queryService.setup( newState );
        this.queryStepList = [];
        // set state in queryStepList
        if ( this._queryService.state.getNumSteps() > 0 ) {
            // use state from URL
            this._queryService.state.steps
                .forEach(( elem ) => this.queryStepList.push( 'param' ) );
        } else {
            // new empty state
            this.addQueryStep();
        }
    }

    getStateStringFromUrlFragment(): string {
        let hash: string = window.location.hash;
        if ( hash ) {
            let fragb: string = hash.substr( 1 );
            // base64 decode
            let fragu = window.atob( fragb );
            // url decode
            let frag = decodeURIComponent( fragu );
            // reset hash
            window.location.hash = '';
            return frag;
        }
        return null;
    }

    getUrlFragmentFromState() {
        let stateStr = this._queryService.state.getStateAsString();
        let frag = '#';
        if ( stateStr.length > 0 ) {
            let fragu = encodeURIComponent( stateStr );
            let fragb = window.btoa( fragu );
            frag += fragb;
        }
        return frag;
    }

    addQueryStep() {
        this.queryStepList.push( 'step' );
    }

    removeQueryStep() {
        this.queryStepList.pop();
        this._queryService.state.steps.pop();
    }

    resetQuery() {
        // reset everything by reloading
        window.location.reload();
    }

    showQueryUrl() {
        let url = window.location.href
        url = url.replace( /#.*/, '' ) + this.getUrlFragmentFromState();
        window.prompt( "URL to current query state", url );
    }

    onQueryChanged( event: any ) {
        console.debug( "app.onquerychanged! event=", event );
        this._queryService.runQuery();
        this.queryState = this._queryService.getState();
    }
    ngOnInit() {
    }

}
