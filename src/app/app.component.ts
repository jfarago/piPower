import {Component, OnInit} from '@angular/core';

import {PiService} from './pi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private piService: PiService) {
  };

  title = 'piFish';

  outlets = [];

  public changeOutlet(outlet, state) {
    console.log(outlet, state)
    this.piService.putOutlet(outlet, state).subscribe(res => {
      console.log(res);
    });
  }


  ngOnInit() {
    this.piService.getOutlets().subscribe(res => {
      this.outlets = res.message.value;
      console.log(this.outlets);

      for (let i = 0; i < this.outlets.length; i++) {
        this.outlets[i].value = this.outlets[i].value ? 'On' : 'Off';
      }

      console.log(this.outlets)
    });


  }
}
