import { Component, OnInit } from '@angular/core';

@Component( {
    selector: 'tr.resultRow',
    templateUrl: './result-row.component.html',
    styleUrls: ['./result-table.component.css'],
    inputs: ['rowData', 'rowType', 'columns']
} )
export class ResultRowComponent implements OnInit {

    public rowType: string;
    public rowData: any;
    public columns: any[];

    ngOnInit() {
        console.debug( "row init! rowType=", this.rowType, " columns=", this.columns, " rowData=", this.rowData );
    }

}
