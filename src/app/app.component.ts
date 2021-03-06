import {Component, OnInit, ɵConsole} from '@angular/core';

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
  thermometers = [];
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

  iconMap = {
    light: 'fa-lightbulb',
    outlet: 'fa-plug'
  };

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
    // using +state to convert true false to 0 or 1
    this.piService.putOutlet(outlet.headerNum, +state).subscribe(res => {
      outlet.status = res.message.value;
      outlet.value = res.message.value === 'On' ? 1 : 0;
      console.log('Turning the outlet', res.message.value)
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

    this.piService.getTemperatureProbes().subscribe(res => {
      if (res.message && Array.isArray(res.message.value)) {
        this.thermometers = res.message.value
      }
      console.log('Thermometers: ', this.thermometers);
    })

    this.piService.getOutlets().subscribe(res => {
      this.outlets = res.message.value;

      this.outlets.map(outlet => {
        outlet.status = outlet.value ? 'On' : 'Off';
        outlet.icon = outlet.description.toLowerCase().includes('light') ? this.iconMap['light'] : this.iconMap['outlet'];
      })

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
