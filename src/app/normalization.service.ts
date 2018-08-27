import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {OPENMIND_BASE_URL} from './app-config';

@Injectable({
  providedIn: 'root'
})
export class NormalizationService {

    constructor(private _http: HttpClient) {}

    fetchArabicTranslitNormalizedString(text: string) {
        console.debug("fetching arabic translit normalized string: ", text);
        var headers = new HttpHeaders();
        headers.append('Accept', 'application/json');
        // put headers in options
        var opts = {'headers': headers};
        // make get request asynchronously
        var url = OPENMIND_BASE_URL+'jsonInterface?method=normalize_string&type=arabic_translit&text=';
        url += encodeURIComponent(text);
        var resp = this._http.get<NormalizationServiceResponse>(url, opts)
        // return Observable
        return resp;        
    }

}

export interface NormalizationServiceResponse {
    normalized_text: any;
}