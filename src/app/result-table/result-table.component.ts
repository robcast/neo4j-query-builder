import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';

import { QueryState } from '../model/query-state';
import { ResultRowComponent } from './result-row.component';


@Component({
    selector: 'query-result',
    templateUrl: './result-table.component.html',
    styleUrls: ['./result-table.component.css'],
    inputs: ['queryState', 'resultInfo']
})
export class ResultTableComponent implements OnInit {

    @Input() queryState: QueryState;
    @Input() resultInfo: string;

    dataSource: MatTableDataSource<any>;
    displayedColumns: string[] = [];
    showTable: boolean = true;
    allColumns: Array<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    /**
     * Set the paginator after the view init since this component will
     * be able to query its view for the initialized paginator.
     * 
     * TODO: is this really necessary for Angular 6?
     */
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ngOnInit() {
        console.debug("resulttable: onInit");
        this.dataSource = new MatTableDataSource(this.queryState.results);
        this.allColumns = this.queryState.resultColumns;
        this.displayedColumns = this.allColumns.filter(col => col.show).map(col => col.name);
    }

    ngOnChanges() {
        console.debug("resulttable: onChanges");
        if (this.dataSource != null) {
            this.dataSource.data = this.queryState.results;
            this.showTable = (this.dataSource.data.length < 1000);
            this.allColumns = this.queryState.resultColumns;
            this.displayedColumns = this.allColumns.filter(col => col.show).map(col => col.name);
        }
    }
    
    onSelectCols(event: any) {
        this.displayedColumns = this.allColumns.filter(col => col.show).map(col => col.name);
    }
}
