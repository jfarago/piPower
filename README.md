# PiPower

PiPower is a node server for the raspberry pi that offers gpio manipulation from a web interface and/or a predefined schedule. It also supports ds18x20 sensors over i2c but but I need to add support for setting the sensor id's in the config file.

My current setup is a pi zero with an 8 channel relay wired to 8 outlets. The web interface creates an on/off button for every pin in the config file. I also wired up the i2c pins to a 3.5mm headphone jack so I could plug in temperature sensors until my heart is content, via headphone splitter.

By default, each pin is set to the on position when the server starts. This is the safest operation for my aquarium setup as equipment is usually on.

Although, I have used this to build a aquarium monitor, it would be very easy to use this for a DIY smart power strip.

![Logo](https://i.imgur.com/UR46gYA.jpg)


<p align="center">
  <img width="800" src="https://i.imgur.com/EgLEloc.jpg">
  <img width="300" src="https://i.imgur.com/laRh66M.jpg">
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
    
  Install latest version of node
  
    $ nvm install 4

##### Set timezone on raspberry pi

    $ sudo raspi-config
    
Select localisation options > change timezone > geographical area > timezone.
    
##### Enable w1-gpio

    $ sudo modprobe w1-gpio
    $ sudo nano /boot/config.txt
    
###### Add this line to bottom of file:

	dtoverlay=w1-gpio
	    
##### Install DHT11/22 supporting library (I cannot get this to work on the pi zero)

	$ wget http://www.airspayce.com/mikem/bcm2835/bcm2835-1.46.tar.gz
	$ tar zxvf bcm2835-1.46.tar.gz
	$ cd bcm2835-1.46
	$ ./configure
	$ make
	$ sudo make check
	$ sudo make install
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

##### Launch Server

    $ sudo node ~/piPower/dist/server/app.js
    
Navigate to https://<raspberry-pi-ip>:3000

##### Modifying the configuration

  The website is built from the config.json. Modify the array of outlets
  and names to your liking.

### Set Up Dev Environment on computer

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
 - PUT Pin State
	 - `https://<Raspberry Pi IP>/api/outlets/:pin/:state`
 - GET Raspberry Pi System Stats
	 - `https://<Raspberry Pi IP>/api/unit/info`
   
## Extras

#### Run server when pi boots

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

