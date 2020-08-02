# PiPower

PiPower is a node server for the raspberry pi that offers gpio manipulation from a web interface and/or a predefined schedule. It also supports ds18x20 sensors over i2c but but I need to add support for setting the sensor id's in the config file.

My current setup is a pi zero with an 8 channel relay wired to 8 outlets. The web interface creates an on/off button for every pin in the config file. I also wired up the i2c pins to a 3.5mm headphone jack so I could plug in temperature sensors until my heart is content, via headphone splitter.

By default, each pin is set to the on position when the server starts. This is the safest operation for my aquarium setup as equipment is usually on.

Although, I have used this to build a aquarium monitor, it would be very easy to use this for a DIY smart power strip.

![Logo](https://i.imgur.com/UR46gYA.jpg)


<p align="center">
  <img width="800" src="https://i.imgur.com/EgLEloc.jpg">
  <img width="300" src="https://i.imgur.com/FawijfY.png">
</p>

## BOM

Note: Links are sourced for 2 day Amazon Prime shipping. Can be found on ebay for about half the price.

* [Enclosure](https://www.amazon.com/gp/product/B00INGRK4W/ref=oh_aui_detailpage_o09_s00?ie=UTF8&psc=1) - $14
* [Relay](https://www.amazon.com/gp/product/B00R77PN1A/ref=oh_aui_detailpage_o03_s00?ie=UTF8&psc=1) - $11
* [Power Cable Input](https://www.amazon.com/gp/product/B01M1088S2/ref=oh_aui_detailpage_o00_s00?ie=UTF8&psc=1) - $7
* [Outlets](https://www.amazon.com/gp/product/B01M3URWIT/ref=oh_aui_detailpage_o00_s00?ie=UTF8&psc=1) - $8


Accessories

* [DHT22 Ambient Temp/Humidity Sensor](https://www.amazon.com/gp/product/B0795F19W6/ref=oh_aui_detailpage_o07_s00?ie=UTF8&psc=1) - $10
* [DS18B20 Waterproof Temp Probes](https://www.amazon.com/gp/product/B00CHEZ250/ref=oh_aui_search_detailpage?ie=UTF8&psc=1) - $8
* [Humidifier Mister](https://www.amazon.com/gp/product/B00PAK245E/ref=oh_aui_detailpage_o05_s00?ie=UTF8&psc=1) - $9
* [Humidifier Fan](https://www.amazon.com/gp/product/B00N1Y4RLU/ref=oh_aui_detailpage_o04_s00?ie=UTF8&psc=1) - $9



## Setup
	
### Raspberry Pi configuration (Raspbian):

##### Install Raspbian on a raspberry pi

  I recommend using [PiBakery](https://www.pibakery.org/), its very easy to use. I normally
  configure the wifi, hostname, password, reboot, and then i ssh into it fo the next steps.
  Raspbian lite can be used, no need to use the full version.

##### Install updates

    $ sudo apt update -y && sudo apt upgrade -y

##### Install git

    $ sudo apt-get install git
	
##### Install NodeJS via NVM

    $ git clone https://github.com/creationix/nvm.git ~/.nvm
    $ sudo echo "source ~/.nvm/nvm.sh" >> ~/.bashrc && sudo echo "source ~/.nvm/nvm.sh" >> ~/.profile

  Exit all terminal sessions and open new one
  
  Test to see if install worked
  
    $ nvm --version
    
  Install node 4 (sensor libraries require old version)
  
    $ nvm install 4

##### Set timezone on raspberry pi

    $ sudo raspi-config
    
Select localisation options > change timezone > geographical area > timezone.
    
##### Enable one-wire interface for sensors
If modprobe command fails, update your raspberry pi with sudo `rpi-update`

    $ sudo modprobe w1-gpio
    $ sudo nano /boot/config.txt
    
###### Add this line to bottom of file:

	dtoverlay=w1-gpio
	    
##### Install DHT11/22 supporting library

	$ wget http://www.airspayce.com/mikem/bcm2835/bcm2835-1.46.tar.gz
	$ tar zxvf bcm2835-1.46.tar.gz
	$ cd bcm2835-1.46
	$ ./configure
	$ make
	$ sudo make check
	$ sudo make install
	$ cd ../
	$ rm -rf bcm2835-1.46.tar.gz
	
##### Reboot
	
	$ sudo reboot now
	
### Raspberry Pi Server Setup

##### Clone the repository

    $ sudo git clone https://github.com/jfarago/piPower.git pi-power

##### Install node dependencies

	$ cd pi-power/dist/server
	$ sudo chown -R $(whoami) ./
	$ npm install

##### Generate SSL Cert in root of server

	$ openssl genrsa 1024 > private.key
	$ openssl req -new -key private.key -out cert.csr
	$ openssl x509 -req -in cert.csr -signkey private.key -out certificate.pem
		
##### Generate users.htpasswd file in root of server (this is the password to login to the web)

	$ sudo apt-get install apache2-utils
	$ htpasswd -c users.htpasswd admin

##### Set up your pin configuration

Copy server/config.example.json file and create a server/config.json file

    $ cp config.example.json config.json

##### Launch Server

    $ sudo node ~/pi-power/dist/server/app.js

If you get a sudo node error then you need to install a version of node globally. This is because we are using nvm to install node.
https://www.digitalocean.com/community/tutorials/how-to-install-node-js-with-nvm-node-version-manager-on-a-vps#-installing-nodejs-on-a-vps
https://stackoverflow.com/questions/21215059/cant-use-nvm-from-root-or-sudo

	$ n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local

Create credentials file ()
    
Navigate to https://raspberry-pi-ip:3000

##### Set up push notifications

Comfigureable Notifications
- on boot
- temperature threshold
- pin high/low

##### Set up temperature probes

- Connect temperature probes data pins to pin gpio 4 (hardware pin 7)
- On first boot, the server will log the temperature probes id's that where found.
- Copy those id's to set up probes in the config.json

"alert" is an optional field. If push notifications are enabled, a message will be sent if the temperature passes the alert threshold.

"offset" is used to calibrate the probe. Temp is in fahrenheit 

```
"temperatureProbes": [
    {
      "name": "Refugium",
      "id": "28-0000066fbb8c",
      "alert": 80,
      "offset": -2
    }
]
```

##### Set up DHT Sensor 

- Connect temperature probe data pin to pin gpio 4 (hardware pin 7)
- Configure sensor type and offset in the config.json

"offset" is used to calibrate the probe. Temp is in fahrenheit 

```
"dhtSensor" : {
    "type": 11,
    "offset": 0
  },
```

### Set Up Dev Environment on computer

  Note: dev environment needs node 12, while raspberry pi needs node 4

##### Clone the repository

    $ sudo git clone https://github.com/jfarago/piPower.git piPower
    
##### Install package dependancies

    $ cd piPower/
    $ npm install
    
##### Create dist package
    
	$ npm run build
	
##### Create proxy config

The proxy is to be able to serve the webpages locally, but point to the pi for server requests
    
	$ cp proxy.conf.example.json proxy.conf.json
	
##### Deploy using filezilla or cyberduck

## Modifications

###### App changes
* Make changes
* Run npm run builds
* copy dist folder to raspberry pi
* Restart server on pi



## Server
 - GET App Configuration
	 - `https://<Raspberry Pi IP>/api/app-config`
 - GET Pin Configuration
	 - `https://<Raspberry Pi IP>/api/outlets`
 - GET Pin State
	 - `https://<Raspberry Pi IP>/api/outlets/:pin`
 - GET Temperature Probes
	 - `https://<Raspberry Pi IP>/api/temperature_probes`
 - GET DHT Temperature/Humidity State
	 - `https://<Raspberry Pi IP>/api/ambient`
 - PUT Pin State
	 - `https://<Raspberry Pi IP>/api/outlets/:pin/:state`
   
## Extras

#### Run server when pi boots option 1

[pm2](https://pm2.keymetrics.io/)

#### Run server when pi boots option 2

```
$ sudo nano /etc/rc.local
```

Add line under "# By default this script does nothing."

```
$ /usr/bin/sudo -u pi sudo /usr/local/bin/forever /home/pi/piPower/dist/server/app.js >>/home/pi/piPower/dist/server/output.log 2>>/home/pi/piPower/dist/server/error.log
```

Reboot
```
$ sudo reboot
```

