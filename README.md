# FishPi

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


Currently, this server supports turning gpio's on and off as well as report the pi systems stats. i2c is implemented to read ds18x20 temperature sensors but I need to add support for sensor id's in the config file.

**Installation on Raspbian:**
-
 Clone the repository to a directory on your pi 

    sudo git clone https://github.com/jfarago/node-berry.git folder_name
    
Install package dependancies

    sudo npm install express ds18x20 gpio http-auth
    sudo npm install -g nodemon
    
Enable w1-gpio

    sudo modprobe w1-gpio
    sudo nano /boot/config.txt

Add to file: dtoverlay=w1-gpio	

Launch Server

    npm start

**Pin Configuration File Example**
-
    {
	"pins": [
		{
			"pinNumber": 5,
			"direction": "out",
			"description": "Outlet 1"
		},
		{
			"pinNumber": 6,
			"direction": "out",
			"description": "Outlet 2"
		},
		{
			"pinNumber": 12,
			"direction": "out",
			"description": "Outlet 3"
		},
		{
			"pinNumber": 13,
			"direction": "out",
			"description": "Outlet 4"
		}
	]
    }

**API Examples**
-
 - GET Pin Configuration
	 - `http://<Raspberry Pi IP>:3000/api/outlets`
 - GET Pin State
	 - `http://<Raspberry Pi IP>:3000/api/outlets/:pin`
 - PUT Pin State
	 - `http://<Raspberry Pi IP>:3000/api/outlets/:pin/:state`
 - GET Raspberry Pi System Stats
	 - `http://<Raspberry Pi IP>:3000/api/unit/info`

