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
    humidity: 0,
    log: []
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

  oldAmbientLog = [];

  constructor(private piService: PiService) {
  };

  /**
   * Chart Config
   */
  public lineChartData: Array<any> = [
    {data: [], label: 'Temperature'},
    {data: [], label: 'Humidity'}
  ];
  public lineChartLabels: Array<any> = [];
  public lineChartOptions: any = {};
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

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
      this.ambient.temperature = Math.round((res.message.temperature * 9 / 5 + 32) * 10) / 10;
      this.ambient.humidity = res.message.humidity;
      this.ambient.log = res.message.log;
      this.oldAmbientLog = this.ambient.log;

      const tempLog = this.ambient.log.map(line => line.temperature);
      const humidityLog = this.ambient.log.map(line => line.humidity);

      this.lineChartData[0].data = tempLog;
      this.lineChartData[1].data = humidityLog;
      this.lineChartLabels = new Array(tempLog.length);
    });

    setInterval(() => {
      this.piService.getAmbientTemperature().subscribe(res => {
        this.ambient.temperature = Math.round((res.message.temperature * 9 / 5 + 32) * 10) / 10;
        this.ambient.humidity = res.message.humidity;
        this.ambient.log = res.message.log;

        const tempLog = this.ambient.log.map(line => line.temperature);
        const humidityLog = this.ambient.log.map(line => line.humidity);

        if (this.oldAmbientLog.length < this.ambient.log.length) {
          this.oldAmbientLog = this.ambient.log;
          this.lineChartData[0].data = tempLog;
          this.lineChartData[1].data = humidityLog;
          this.lineChartLabels = new Array(tempLog.length);
        }
      });
    }, 5000);
  }
}
