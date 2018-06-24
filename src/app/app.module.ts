import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {PiService} from './pi.service';

// UI
import {ButtonsModule} from 'ngx-bootstrap/buttons';
import { AccordionModule } from 'ngx-bootstrap/accordion';

import {ChartsModule} from 'ng2-charts';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ButtonsModule.forRoot(),
    AccordionModule.forRoot(),
    ChartsModule
  ],
  providers: [
    PiService, {provide: PiService, useClass: PiService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
