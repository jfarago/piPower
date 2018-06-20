import {Component, OnInit} from '@angular/core';

import {PiService} from './pi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = '';
  color = '#ffffff';
  outlets = [];
  ambient = {
    temperature: 0,
    humidity: 0
  };
  style = {
    header: {
      background: this.color,
      'border-bottom': ''
    },
    row: {
      'border-bottom': ''
    },
    temp: {
      color: this.color
    }
  };

  constructor(private piService: PiService) {
  };

  public changeOutlet(outlet, state) {
    this.piService.putOutlet(outlet, state).subscribe(res => {
      console.log(res);
    });
  }


  ngOnInit() {
    this.piService.getAppConfig().subscribe(res => {
      this.title = res.message.value.title;
      this.color = res.message.value.color;
      this.style.header = {
        background: this.color,
        'border-bottom': '1px solid ' + this.color
      };
      this.style.row = {
        'border-bottom': '1px solid ' + this.color
      };

      this.style.temp = {
        color: this.color
      };
    });

    this.piService.getOutlets().subscribe(res => {
      this.outlets = res.message.value;

      for (let i = 0; i < this.outlets.length; i++) {
        this.outlets[i].value = this.outlets[i].value ? 'On' : 'Off';
      }

      console.log('Outlets: ', this.outlets);
    });

    this.piService.getAmbientTemperature().subscribe(res => {
      this.ambient.temperature = Math.round((res.message.temperature * 9 / 5 + 32) * 10) / 10 ;
      this.ambient.humidity = res.message.humidity;
      console.log('Ambient Temperature: ', this.ambient.temperature);
      console.log('Ambient Humidity: ', this.ambient.humidity);
    });
  }
}
