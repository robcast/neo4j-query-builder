import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from "rxjs/operators";

import { SETTINGS } from '../../app-settings';
import { NormalizationService } from '../../services/normalization.service';

@Injectable({
    providedIn: 'root'
})
export class IsmiNormalizationService extends NormalizationService {

    constructor(protected _http: HttpClient) {
        super();
    }

    normalize(text: string) {
        console.debug("fetching arabic translit normalized string: ", text);
        var headers = new HttpHeaders({
            'Accept': 'application/json'
        });
        // put headers in options
        var opts = { 'headers': headers };
        // make get request asynchronously
        var url = SETTINGS['ISMI_BASE_URL'] + 'jsonInterface?method=normalize_string&type=arabic_translit&text=';
        url += encodeURIComponent(text);
        var response = this._http.get<NormalizationServiceResponse>(url, opts);
        // extract string from response attribute
        return response.pipe(map(resp => resp.normalized_text));
    }

}

export interface NormalizationServiceResponse {
    normalized_text: string;
}