import { Component } from '@angular/core';
import { SETTINGS } from './app-settings';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    public title = SETTINGS['APP_TITLE'];
}
