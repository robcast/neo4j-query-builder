import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

import { QueryState } from '../model/query-state';
import { ResultRowComponent } from './result-row.component';


@Component( {
    selector: 'query-result',
    templateUrl: './result-table.component.html',
    styleUrls: ['./result-table.component.css'],
    inputs: ['queryState', 'resultInfo']
} )
export class ResultTableComponent {

    @Input() queryState: QueryState;
    @Input() resultInfo: string;
    
    displayedColumns: string[] = [];
    
    ngOnChanges() {
        console.debug("resulttable: onChanges");
        this.displayedColumns = this.queryState.resultColumns.map(col => col.name);
    }

}
