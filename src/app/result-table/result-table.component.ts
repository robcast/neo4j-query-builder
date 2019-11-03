import { Component, OnChanges, Input, ViewChild, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { QueryState } from '../model/query-state';
import { QueryService } from '../services/query.service';


@Component({
    selector: 'query-result',
    templateUrl: './result-table.component.html',
    styleUrls: ['./result-table.component.css']
})
export class ResultTableComponent {

    queryState: QueryState;
    resultInfo: string;

    dataSource: MatTableDataSource<any>;
    displayedColumns: string[] = [];
    allColumns: Array<any>;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

    constructor(private _queryService: QueryService) {
        _queryService.queryState$.subscribe(state => this.onQueryStateChange(state));
    }

    /**
     * Set the paginator after the view init since this component will
     * be able to query its view for the initialized paginator.
     */
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    onQueryStateChange(newstate: QueryState) {
        console.debug("resulttable: onQueryStateChange", newstate);
        this.queryState = newstate;
        if (this.dataSource == null) {
            this.dataSource = new MatTableDataSource(this.queryState.results);
        } else {
            this.dataSource.data = this.queryState.results;
        }
        this.resultInfo = this.queryState.resultInfo;
        this.allColumns = this.queryState.resultColumns;
        this.displayedColumns = this.allColumns.filter(col => col.show).map(col => col.name);
    }

    onSelectCols(event: any) {
        this.displayedColumns = this.allColumns.filter(col => col.show).map(col => col.name);
    }
}
