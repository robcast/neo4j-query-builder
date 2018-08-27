import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { AppComponent } from './app.component';
import { QueryComponent } from './query/query.component';
import { SelectComponent } from './select/select.component';
import { ResultTableComponent } from './result-table/result-table.component';
import { ResultRowComponent } from './result-table/result-row.component';

@NgModule( {
    declarations: [
        AppComponent,
        QueryComponent,
        SelectComponent,
        ResultTableComponent,
        ResultRowComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatTableModule
    ],
    providers: [],
    bootstrap: [AppComponent]
} )
export class AppModule { }
