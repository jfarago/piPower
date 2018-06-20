# PiPower

PiPower is a node server for the raspberry pi that offers gpio manipulation from a web interface and/or a predefined schedule. It also supports ds18x20 sensors over i2c but but I need to add support for setting the sensor id's in the config file.

My current setup is a pi zero with an 8 channel relay wired to 8 outlets. The web interface creates an on/off button for every pin in the config file. I also wired up the i2c pins to a 3.5mm headphone jack so I could plug in temperature sensors until my heart is content, via headphone splitter.

By default, each pin is set to the on position when the server starts. This is the safest operation for my aquarium setup as equipment is usually on.

Although, I have used this to build a aquarium monitor, it would be very easy to use this for a DIY smart power strip.

<p align="center">
  <img width="800" src="https://i.imgur.com/EgLEloc.jpg">
  <img width="800" src="https://i.imgur.com/UR46gYA.jpg">
  <img width="300" src="https://i.imgur.com/laRh66M.jpg">
</p>

## Setup
	
### Raspberry Pi configuration (Raspbian):

##### Install git

	sudo apt-get update
	sudo apt-get install git
	
##### Install NodeJS

[http://blog.wia.io/installing-node-js-v4-0-0-on-a-raspberry-pi/
]()

###### Clean up install node packages

	rm -rf node-v4.0.0-linux-armv6l node-v4.0.0-linux-armv6l.tar.gz 

##### Set timezone on raspberry pi

[http://www.geeklee.co.uk/update-time-zone-on-raspberry-pi-with-raspbian/]()
    
##### Enable w1-gpio

    sudo modprobe w1-gpio
    sudo nano /boot/config.txt
    
##### Install DHT11/22 supporting library

	wget http://www.airspayce.com/mikem/bcm2835/bcm2835-1.46.tar.gz
	tar zxvf bcm2835-1.46.tar.gz
	cd bcm2835-1.46
	./configure
	make
	sudo make check
	sudo make install


###### Add this line to bottom of file:

	dtoverlay=w1-gpio
	
##### Reboot
	
	sudo reboot now
	
### Raspberry Pi Server Setup

##### Clone the repository

    sudo git clone https://github.com/jfarago/piPower.git piPower

##### Install node dependencies

	cd piPower/dist/server
	npm install

##### Generate SSL Cert in root of server

	cd server
	openssl genrsa 1024 > private.key
	openssl req -new -key private.key -out cert.csr
	openssl x509 -req -in cert.csr -signkey private.key -out certificate.pem
		
##### Generate users.htpasswd file in root of server

	htpasswd -c users.htpasswd admin

##### Set up your pin configuration

Copy server/config.example.json file and create a server/config.json file

##### Launch Server

    sudo node ~/piPower/dist/server/app.js
    
Navigate to https://raspberry-pi-ip-or-hostname

### Set Up Dev Environment on computer

##### Clone the repository

    sudo git clone https://github.com/jfarago/piPower.git piPower
    
##### Install package dependancies

    cd piPower/
    sudo npm install
    
##### Create dist package
    
	ng build --prod
	
##### Set up pi credentials for grunt scripts

Create pi_credentials.json for grunt scripts and put it in the same folder as the gruntfile.js
	
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
	
I set this up to support two pi's, one for deployment and one for development. If you just want to push the code fill out the release section wityh your pi's credentials.
	
##### Install grunt cli
	
	npm install grunt-cli -g
	
##### Push server package to pi

	grunt deployRelease

## Modifications

###### App changes
* Make changes
* Run ng build --prod
* Run grunt sftp:dev
* Restart server on pi



## Server
- GET App Configuration
	 - `https://<Raspberry Pi IP>/api/app-config`
 - GET Pin Configuration
	 - `https://<Raspberry Pi IP>/api/outlets`
 - GET Pin State
	 - `https://<Raspberry Pi IP>/api/outlets/:pin`
 - PUT Pin State
	 - `https://<Raspberry Pi IP>/api/outlets/:pin/:state`
 - GET Raspberry Pi System Stats
	 - `https://<Raspberry Pi IP>/api/unit/info`
   
## Extras

#### Run server when pi boots

```
sudo nano /etc/rc.local
```

Add line under "# By default this script does nothing."

```
/usr/bin/sudo -u pi sudo /usr/local/bin/forever /home/pi/piPower/dist/server/app.js >>/home/pi/piPower/dist/server/output.log 2>>/home/pi/piPower/dist/server/error.log
```

Reboot
```
sudo reboot
```

