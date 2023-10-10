import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { SETTINGS } from '../app-settings';
import { TypeService } from './type.service';
import { QueryMode, getQueryModes } from '../model/query-mode';
import { QueryState } from '../model/query-state';
import { QueryStep } from '../model/query-step';


@Injectable({
    providedIn: 'root'
})
export class QueryService {

    public excludedAttributes = {};
    public state: QueryState;
    public objectTypes: string[];
    
    // Observable loading state
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    
    // Observable queryState
    private stateSubject = new BehaviorSubject<QueryState>(new QueryState());
    public queryState$ = this.stateSubject.asObservable();

    constructor(protected _http: HttpClient, protected _types: TypeService) {
        // init query state
        this.state = new QueryState();
    }

    public setup(newStateString: string) {
        // get list of object types
        this.setupObjectTypes();
        // get state from string
        if (newStateString) {
            this.state.setStateFromString(newStateString);
        }
    }

    public getState() {
        return this.state;
    }

    public getQueryModes(index: number): QueryMode[] {
        return getQueryModes((index == 0), (this._types.idAttribute != null), (this._types.normPrefix != null));
    }

    /**
     * Return the first set of options for the given query mode.
     */
    public getQueryOptions(queryMode: QueryMode) {
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
     * Fetch all object types from Neo4j and store in this.objectTypes.
     */
    public setupObjectTypes() {
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
    public setQueryStep(index: number, step: QueryStep) {
        this.state.steps[index] = step;
    }

    /**
     * Create the cypher queries for the current query state.
     * 
     * Updates the queries for results, attributes and relations.
     */
    protected createCypherQuery() {
        let queryMatch = '';
        let queryWhere = '';
        let queryReturn = '';
        let queryParams = {};
        let resultQuery = '';
        let typesQuery = '';
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
                    queryWhere += `n${nIdx}.ismi_id = toint({att_val${stepIdx}})`;
                    queryParams[`att_val${stepIdx}`] = params.value;
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
                    // TODO: generalize
                    // ismi_id is integer
                    queryWhere += `n${nIdx}.ismi_id = toint({att_val${stepIdx}})`;
                    queryParams[`att_val${stepIdx}`] = params.value;
                } else {
                    if (mode === 'att_contains_norm') {
                        // match _n_attribute with normValue
                        let npre = this._types.normPrefix;
                        queryWhere += `toLower(n${nIdx}.${npre}${params.attribute}) CONTAINS toLower({att_val${stepIdx}})`;
                        queryParams[`att_val${stepIdx}`] = params.normValue;
                    } else {
                        queryWhere += `toLower(n${nIdx}.${params.attribute}) CONTAINS toLower({att_val${stepIdx}})`;
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
        // compose query for types/labels of result
        typesQuery = queryMatch + ' ' + queryWhere + ` WITH DISTINCT labels(n${nIdx}) AS types`
            + ` UNWIND types AS type RETURN DISTINCT type ORDER BY type`;
        // compose query for attributes of result
        attributesQuery = queryMatch + ' ' + queryWhere + ` WITH DISTINCT keys(n${nIdx}) AS atts`
            + ` UNWIND atts AS att RETURN DISTINCT att ORDER BY att`;
        // compose query for relations of result
        outRelsQuery = queryMatch + '-[r]->() ' + queryWhere + ' RETURN DISTINCT type(r)';
        inRelsQuery = queryMatch + '<-[r]-() ' + queryWhere + ' RETURN DISTINCT type(r)';
        this.state.resultCypherQuery = resultQuery;
        this.state.cypherQueryParams = queryParams;
        if (this._types.typeAttribute == null) {
            // use query when no type attribute
            this.state.typesCypherQuery = typesQuery;
        }
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
        if (this.state.typesCypherQuery) {
            queries.push(this.state.typesCypherQuery);
            params.push(this.state.cypherQueryParams);
        }
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
                /*
                 * extract types
                 */
                let info = '';
                let resTypes = {};
                if (this.state.typesCypherQuery) {
                    // read types from query
                    resIdx += 1;
                    let types = data.results[resIdx].data.map(elem => elem.row[0]);
                    types.forEach(t => resTypes[t] = 0);
                    // create resultInfo summary
                    info = this.state.numResults + ' ';
                    for (let t in resTypes) {
                        info += t + ' ';
                    }
                } else {
                    // count types of all result objects
                    this.state.results.forEach(r => {
                        let t = r[this._types.typeAttribute];
                        if (resTypes[t] == null) {
                            resTypes[t] = 1;
                        } else {
                            resTypes[t] += 1;
                        }
                    });
                    // create resultInfo summary
                    for (let t in resTypes) {
                        info += resTypes[t] + ' ' + t + ' ';
                    }
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
        if (SETTINGS['NEO4J_AUTHENTICATION'] != null) {
            const auth = SETTINGS['NEO4J_AUTHENTICATION'];
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
        let response = this._http.post<N4jQueryResponse>(SETTINGS['NEO4J_BASE_URL'] + '/tx/commit', data, opts);
        // return Observable
        return response;
    }

}

export interface N4jQueryResponse {
    results: any[];
    errors: any[];
}
