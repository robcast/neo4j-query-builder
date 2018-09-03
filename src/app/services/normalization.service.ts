import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

/**
 * Normalization service used to transform the query for normalized search. 
 */
@Injectable({
    providedIn: 'root'
})
export abstract class NormalizationService {

    /**
     * Normalize given text. Returns Observable.
     * @param text
     */
    public abstract normalize(text: string): Observable<string>;

}
