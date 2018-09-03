import { Injectable } from '@angular/core';
import { Observable, of } from "rxjs";

/**
 * Normalization service used to transform the query for normalized search. 
 */
@Injectable({
    providedIn: 'root'
})
export class NormalizationService {

    /**
     * Normalize given text. Returns Observable.
     * @param text
     */
    public normalize(text: string): Observable<string> {
        // this implementation does not do anything!
        return of(text);
    };

}
