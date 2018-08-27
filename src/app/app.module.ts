import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; 

import { AppComponent } from './app.component';
import { QueryComponent } from './query/query.component';
import { SelectComponent } from './select/select.component';
import { ResultTableComponent } from './result-table/result-table.component';
import { ResultRowComponent } from './result-table/result-row.component';

@NgModule({
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
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
