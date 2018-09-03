import { Component } from '@angular/core';
import { APP_TITLE } from './app-settings';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    public title = APP_TITLE;
}
