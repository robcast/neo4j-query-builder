import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { NEO4J_BASE_URL, NEO4J_AUTHENTICATION } from '../app-config';
import { TypeService } from './type.service';
import { QueryMode, QUERY_MODES, FIRST_QUERY_MODES } from '../model/query-mode';
import { QueryState } from '../model/query-state';
import { QueryStep } from '../model/query-step';


@Injectable({
    providedIn: 'root'
})
export class QueryService {

    /* TODO: make configurable */
    public typeAttribute = '_type';
    public excludedAttributes = {};
    public state: QueryState;
    public objectTypes: string[];

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    private stateSubject = new BehaviorSubject<QueryState>(new QueryState());
    public queryState$ = this.stateSubject.asObservable();



    constructor(private _http: HttpClient, private _types: TypeService) {
        // init query state
        this.state = new QueryState();
    }

    setup(newStateString: string) {
        // get list of object types
        this.setupObjectTypes();
        // get state from string
        if (newStateString) {
            this.state.setStateFromString(newStateString);
        }
    }

    getState() {
        return this.state;
    }

    getQueryModes(index: number): QueryMode[] {
        if (index == 0) {
            return FIRST_QUERY_MODES;
        } else {
            return QUERY_MODES;
        }
    }

    /**
     * return the first set of options for the given query mode.
     */
    getQueryOptions(queryMode: QueryMode) {
        let options: any[] = [];
        if (queryMode == null) return options;
        if (queryMode.id === 'type_is') {
            options = this.objectTypes;
        } else if (queryMode.id === 'relation_is') {
            options = this.state.resultRelations;
        } else if (queryMode.id === 'att_contains') {
            options = this.filterAttributes(this.state.resultAttributes);
        } else if (queryMode.id === 'att_contains_norm') {
            options = this.filterAttributes(this.state.resultAttributes, true);
        } else if (queryMode.id === 'att_num_range') {
            options = this.filterAttributes(this.state.resultAttributes);
        }
        console.debug("getQueryOptions returns: ", options);
        return options;
    }

    /**
     * fetch all object types from Neo4j and store in this.objectTypes.
     */
    setupObjectTypes() {
        let query = `MATCH (n) WITH DISTINCT labels(n) AS labels
                UNWIND labels AS label 
                RETURN DISTINCT label ORDER BY label`;

        let res = this.fetchCypherResults([query]);
        res.subscribe(
            data => {
                console.debug("neo4j data=", data);
                this.objectTypes = data.results[0].data
                    .map(elem => elem.row[0])
                    .filter(elem => elem[0] != "_");
                console.debug("object types=", this.objectTypes);
            },
            err => console.error("neo4j error=", err),
            () => console.debug('neo4j query Complete')
        );
    }

    /**
     * Set the query step at index.
     */
    setQueryStep(index: number, step: QueryStep) {
        this.state.steps[index] = step;
    }

    /**
     * Create the cypher queries for the current query state.
     * 
     * Updates the queries for results, attributes and relations.
     */
    createCypherQuery() {
        let queryMatch = '';
        let queryWhere = '';
        let queryReturn = '';
        let queryParams = {};
        let resultQuery = '';
        let attributesQuery = '';
        let outRelsQuery = '';
        let inRelsQuery = '';
        let returnType = '';
        let nIdx = 1;
        this.state.steps.forEach((step, stepIdx) => {
            let mode = step.mode.id;
            let params = step.params;

            /*
             * step: object type is
             */
            if (mode === 'type_is') {
                queryMatch = `MATCH (n${nIdx}:${params.objectType})`;
                queryWhere = '';
                queryReturn = `RETURN n${nIdx}`;
                returnType = 'node';
            }

            /*
             * step: object id is
             */
            if (mode === 'id_is') {
                if (!queryMatch) {
                    // first step - use match clause
                    queryMatch = `MATCH (n${nIdx} {ismi_id: {att_val${stepIdx}}})`;
                    queryParams[`att_val${stepIdx}`] = parseInt(params.value, 10);
                    queryWhere = '';
                    queryReturn = `RETURN n${nIdx}`;
                    returnType = 'node';
                } else {
                    // use where clause
                    if (!queryWhere) {
                        queryWhere = 'WHERE ';
                    } else {
                        queryWhere += ' AND ';
                    }
                    queryWhere += `n${nIdx}.ismi_id = {att_val${stepIdx}}`;
                    queryParams[`att_val${stepIdx}`] = parseInt(params.value, 10);
                }
            }

            /*
             * step: relation type is
             */
            if (mode === 'relation_is') {
                nIdx += 1;
                let rel = params.relationType;
                if (rel.isOutgoing()) {
                    queryMatch += `-[:\`${rel.getRelType()}\`]->(n${nIdx})`;
                } else {
                    // inverse relation
                    queryMatch += `<-[:\`${rel.getRelType()}\`]-(n${nIdx})`;
                }
                queryReturn = `RETURN DISTINCT n${nIdx}`;
                returnType = 'node';
            }

            /*
             * step: attribute contains(_norm)
             */
            if (mode === 'att_contains' || mode === 'att_contains_norm') {
                if (!queryWhere) {
                    queryWhere = 'WHERE ';
                } else {
                    queryWhere += ' AND ';
                }
                if (params.attribute === 'ismi_id') {
                    // ismi_id is integer
                    queryWhere += `n${nIdx}.ismi_id = {att_val${stepIdx}}`;
                    queryParams[`att_val${stepIdx}`] = parseInt(params.value, 10);
                } else {
                    if (mode === 'att_contains_norm') {
                        // match _n_attribute with normValue
                        queryWhere += `lower(n${nIdx}._n_${params.attribute}) CONTAINS lower({att_val${stepIdx}})`;
                        queryParams[`att_val${stepIdx}`] = params.normValue;
                    } else {
                        queryWhere += `lower(n${nIdx}.${params.attribute}) CONTAINS lower({att_val${stepIdx}})`;
                        queryParams[`att_val${stepIdx}`] = params.value;
                    }
                }
            }

            /*
             * step: attribute number range
             */
            if (mode === 'att_num_range') {
                if (!queryWhere) {
                    queryWhere = 'WHERE ';
                } else {
                    queryWhere += ' AND ';
                }
                queryWhere += `toint(n${nIdx}.${params.attribute}) >= toint({att_nlo${stepIdx}})`
                    + ` AND toint(n${nIdx}.${params.attribute}) <= toint({att_nhi${stepIdx}})`;
                queryParams[`att_nlo${stepIdx}`] = params.numLo;
                queryParams[`att_nhi${stepIdx}`] = params.numHi;
            }

        });
        // compose query
        resultQuery = queryMatch + (queryWhere ? '\n' + queryWhere : '') + '\n' + queryReturn;
        // compose query for attributes of result
        attributesQuery = queryMatch + ' ' + queryWhere + ` WITH DISTINCT keys(n${nIdx}) AS atts`
            + ` UNWIND atts AS att RETURN DISTINCT att ORDER BY att`;
        // compose query for relations of result
        outRelsQuery = queryMatch + '-[r]->() ' + queryWhere + ' RETURN DISTINCT type(r)';
        inRelsQuery = queryMatch + '<-[r]-() ' + queryWhere + ' RETURN DISTINCT type(r)';
        this.state.resultCypherQuery = resultQuery;
        this.state.cypherQueryParams = queryParams;
        this.state.attributesCypherQuery = attributesQuery;
        this.state.outRelsCypherQuery = outRelsQuery;
        this.state.inRelsCypherQuery = inRelsQuery;
        this.state.resultTypes = returnType;
    }

    /**
     * Create and run the cypher queries for the current query state.
     * 
     * Updates the results and nextQuery attributes and relations.
     */
    runQuery() {
        this.createCypherQuery();
        this.loadingSubject.next(true);
        this.state.resultInfo = 'loading...';
        /*
         * run query for result table
         */
        let queries = [this.state.resultCypherQuery];
        let params = [this.state.cypherQueryParams];
        if (this.state.attributesCypherQuery) {
            queries.push(this.state.attributesCypherQuery);
            params.push(this.state.cypherQueryParams);
        }
        if (this.state.outRelsCypherQuery) {
            queries.push(this.state.outRelsCypherQuery);
            params.push(this.state.cypherQueryParams);
        }
        if (this.state.inRelsCypherQuery) {
            queries.push(this.state.inRelsCypherQuery);
            params.push(this.state.cypherQueryParams);
        }
        let result = this.fetchCypherResults(queries, params);
        result.subscribe(
            data => {
                console.debug("neo4j result data=", data);
                let resIdx = 0;
                /*
                 * results for result table
                 */
                this.state.results = data.results[resIdx].data.map(elem => elem.row[0]);
                this.state.numResults = this.state.results.length;
                // count all types
                let resTypes = {};
                this.state.results.forEach((r) => {
                    let t = r[this.typeAttribute];
                    if (resTypes[t] == null) {
                        resTypes[t] = 1;
                    } else {
                        resTypes[t] += 1;
                    }
                });
                let info = '';
                for (let t in resTypes) {
                    info += resTypes[t] + ' ' + t + ' ';
                }
                info = info.substr(0, info.length - 1);
                this.state.setResultInfo(info);
                /*
                 * results for attribute list
                 */
                if (this.state.attributesCypherQuery) {
                    resIdx += 1;
                    let atts = data.results[resIdx].data.map(elem => elem.row[0]);
                    this.state.resultAttributes = atts;
                    // the following assumes only one type in the result
                    for (let t in resTypes) {
                        this.state.resultType = this._types.getResultType(t);
                        break;
                    }
                    this.state.resultColumns = this.state.resultType.getColumns(atts);
                }
                /*
                 * results for relations list
                 */
                if (this.state.outRelsCypherQuery) {
                    // outgoing aka forward relations
                    resIdx += 1;
                    let rels = data.results[resIdx].data.map(elem => elem.row[0])
                        .filter(elem => elem[0] != "_")
                        .map(elem => this._types.getRelationType(elem, true));
                    this.state.resultRelations = rels;
                }
                if (this.state.inRelsCypherQuery) {
                    // incoming aka reverse relations
                    resIdx += 1;
                    let rels = data.results[resIdx].data.map(elem => elem.row[0])
                        .filter(elem => elem[0] != "_")
                        .map(elem => this._types.getRelationType(elem, false));
                    this.state.resultRelations = this.state.resultRelations.concat(rels);
                }
            },
            err => {
                console.error("neo4j result error=", err)
                this.loadingSubject.next(false);
            },
            () => {
                console.debug('neo4j result query Complete');
                this.loadingSubject.next(false);
                this.stateSubject.next(this.state);
            }
        );
    }


    filterAttributes(attributes: string[], normalized = false) {
        let atts = [];
        if (normalized) {
            attributes.forEach((att) => {
                if (att.substr(0, 3) == "_n_") {
                    atts.push(att.substr(3));
                }
            });
        } else {
            atts = attributes.filter(elem => elem[0] != "_" && !this.excludedAttributes[elem]);
        }
        return atts;
    }

    /**
     * Run the given queries on the Neo4J server.
     * 
     * Returns an Observable with the results.
     */
    fetchCypherResults(queries: string[], params = [{}]): Observable<N4jQueryResponse> {
        console.debug("fetching cypher queries: ", queries);
        // set HTTP headers
        let headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        if (NEO4J_AUTHENTICATION != null) {
            const auth = NEO4J_AUTHENTICATION;
            headers['Authorization'] = 'Basic ' + btoa(`${auth.user}:${auth.password}`);
        }
        // put headers in options
        const opts = { 'headers': new HttpHeaders(headers) };
        // unpack queries into statements
        const statements = queries.map((q, i) => {
            return { 'statement': q, 'parameters': (params[i]) ? params[i] : {} };
        });
        // create POST data from query
        const data = JSON.stringify({ 'statements': statements });
        // make post request asynchronously
        let response = this._http.post<N4jQueryResponse>(NEO4J_BASE_URL + '/transaction/commit', data, opts);
        // return Observable
        return response;
    }

}

export interface N4jQueryResponse {
    results: any[];
    errors: any[];
}
