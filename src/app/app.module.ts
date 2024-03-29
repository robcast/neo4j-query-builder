import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

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
