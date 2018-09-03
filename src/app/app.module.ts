import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppComponent } from './app.component';
import { QueryComponent } from './query/query.component';
import { SelectComponent } from './select/select.component';
import { ResultTableComponent } from './result-table/result-table.component';

import { NormalizationServiceProvider, TypeServiceProvider } from './app-services';

@NgModule({
    declarations: [
        AppComponent,
        QueryComponent,
        SelectComponent,
        ResultTableComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatTableModule,
        MatPaginatorModule,
        MatCardModule,
        MatExpansionModule,
        MatProgressSpinnerModule
    ],
    providers: [
        NormalizationServiceProvider,
        TypeServiceProvider
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
