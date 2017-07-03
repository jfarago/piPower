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
    
Install NodeJS

    http://blog.wia.io/installing-node-js-v4-0-0-on-a-raspberry-pi/
    
Install package dependancies

    sudo npm install express ds18x20 gpio http-auth node-schedule
    sudo npm install -g nodemon
    
Enable w1-gpio

    sudo modprobe w1-gpio
    sudo nano /boot/config.txt

Add to file: dtoverlay=w1-gpio

Generate SSL Cert in root of server

    openssl genrsa 1024 > private.key
    openssl req -new -key private.key -out cert.csr
    openssl x509 -req -in cert.csr -signkey private.key -out certificate.pem
		
Generate users.htpasswd file in root of server

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
	 - `https://<Raspberry Pi IP>/api/outlets`
 - GET Pin State
	 - `https://<Raspberry Pi IP>/api/outlets/:pin`
 - PUT Pin State
	 - `https://<Raspberry Pi IP>/api/outlets/:pin/:state`
 - GET Raspberry Pi System Stats
	 - `https://<Raspberry Pi IP>/api/unit/info`
   
**Set Up Dev Environment**

Create pi_credentials.json for grunt scripts
 ```
 {
 	"dev": {
 		"host": "192.168.1.45",
 		"username": "pi",
 		"password": "letmein"
 	},
 	"release": {
 		"host": "192.168.1.46",
 		"username": "pi",
 		"password": "letmein"
 	}
 }
```
