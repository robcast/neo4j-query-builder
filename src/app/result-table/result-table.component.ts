import { Component, OnInit } from '@angular/core';

import { QueryState } from '../query-state';
import { ResultRowComponent } from './result-row.component';


@Component( {
    selector: 'query-result',
    templateUrl: './result-table.component.html',
    styleUrls: ['./result-table.component.css'],
    inputs: ['queryState', 'resultInfo']
} )
export class ResultTableComponent {

    public queryState: QueryState;
    public resultInfo: string;

}
