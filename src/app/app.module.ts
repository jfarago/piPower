import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ButtonsModule } from 'ngx-bootstrap/buttons';


import { AppComponent } from './app.component';
import {PiService} from "./pi.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ButtonsModule.forRoot()
  ],
  providers: [
    PiService, {provide: PiService, useClass: PiService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
