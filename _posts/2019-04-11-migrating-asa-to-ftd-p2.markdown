---
layout: default
author: MDY
title:  Migrating a Cisco ASA 5506 from ASA OS to FTD part 2
date:   2019-04-11 11:00:00
image: /assets/css/images/blog/ftdp2.jpg
categories: main
description: "ASA 5506 migration FTD"
---
In a [previous post](migrating-asa-to-ftd-p1.html), we discuss the architecture of Firepower Threat Defense (FTD) compared ASA with firepower service. This post is a step by step migration procedure from ASA with Firepower service to Firepower threat defense.
<!--break-->

# Migrating from ASA with Firepower Services to FTD


- [Firepower architecture](migrating-asa-to-ftd-p1.html)
- In this post: migration procédure
- [Presentation of the admin GUI](migrating-asa-to-ftd-p3.html)

## Reference documentation

You find the reference documentation published by Cisco [here](https://www.cisco.com/c/en/us/td/docs/security/firepower/quick_start/reimage/asa-ftd-reimage.html)

## Installation packages

There are two sets of installation package depending on the targeted architecture, as explained  [in this post](migrating-asa-to-ftd-p1.html) :

| ASA with firepower services | FTD | Commentaire |
|-----------------------------|-----|-------------|
| ROMMON | ROMMON | Similar to a BIOS on a PC |
| ASA OS | ASA FTD (.lfbff) | On ASA With FP service, it's the ASA firmware; on FTD, it's a custom Linux kernel |
| Firepower service | FTD package (.pkg) | On ASA with FP, it's a linux distro; on FTD, additional installation packages |
| ASDM | ASDM client for ASA with FPS; no equivalent on FTD |

## Full reset

Connect to the ASA with a serial console cable and power it up
Press ESC during boot

```ios
confreg 0x41
confreg
```

Choose "ignore system configuration"

For a step-bby-step procedure, read [this page](https://community.cisco.com/t5/security-documents/asa-password-recovery/ta-p/3126046).

## Change the password

```ios
enable
conf t
username ZZZZ  password XXXXX privilege 15
enable password YYYYY
no config-register
reload
```

## Configure temporary IP address to connect to the ASA to reimage it

Two IPs, interface and management :

- 172.10.0.75
- 172.10.0.76

```ios
interface GigabitEthernet 1/1
nameif inside
no traffic-forward sfr monitor only

interface management 1/1
ip address 172.10.0.75 255.255.255.0
```

Enable SSH access on the management IP

```ios
conf t
ssh 172.10.0.0 255.255.255.0 management
ssh scopy enable
ssh version 2
aaa authentication ssh console LOCAL
```

Upload the firmware from your linux desktop to the ASA

```bash
scp asa5500-firmware-1114.SPA adminix@172.10.0.75:disk0:asa5500-firmware-1114.SPA
```

Check the md5 sum of the firmware

```ios
ciscoasa# verify /md5 disk0:asa5500-firmware-1114.SPA
```

Update the rommon

```ios
upgrade rommon disk0:asa5500-firmware- xxxx.SPA
```

## Get the installation packages

To get ready for the next two steps, you need to

- create a $HOME/tftp directory on your linux system
- download the installation packages ftd-boot-9.9.2.0.lfbff and ftd-6.2.3-83.pkg on Cisco support site and copy them into tftp directory

## Set up a temporary TFTP server

We startup  a docker container tftp server available [on this link](https://hub.docker.com/r/pghalliday/tftp/)

Build and run following the developer's recommendations :

```bash
docker run -p 0.0.0.0:69:69/udp --name tft-asa -v $HOME/tftp:/var/tftpboot -i -t pghalliday/tftp
```

## Set a temporary http server

We run a standard Apache http server avaible in the official docker container registry :

```bash
docker run -dit --name apache-asa -p 80:80 -v $HOME/tftp/:/usr/local/apache2/htdocs/ httpd:2.4
```

## Download and verify the installation packages

```bash
md5sum ftd-boot-9.9.2.0.lfbff
md5sum ftd-6.2.3-83.pkg
```

## Load the FTD firmware for the first time

Reboot the ASA 

```ios
CISCOASA#reload
```

During the reboot cycle, press ESC key to get the rommon shell in the console.

In the rommon shell, set the configuration variables required to install the system :

```ios
rommon>address 172.10.0.75
rommon>server 172.10.0.4
rommon>file ftd-boot-9.9.2.0.lfbff
rommon>netmask 255.255.255.0
rommon>gateway 172.10.0.4
rommon>set
rommon>sync
rommon>tftpdnld
```

The ASA download the new firmware and boots up on the new system. You then need to initialize the administrion access :

```ios
setup
```

Define admin parameters (IP, ...)


## Install FTD packages using the temporary http server

```ios
system install noconfirm http://172.10.0.4/ftd-6.2.3-83.pkg
```

## First console connection

Default login is admin
Default password is Admin123

A few basic questions are displayed to run the initial configuration of the system

## Web connection

Then you can complete the configuration using FDM web interface by opening a browser and going to the management web interface :

```ios
https://<adresse IP de management>/
```

## Conclusion

At the end of the tutorial, your 5506 firewall is updated with a clean web interface that we present you in [the following post](migrating-asa-to-ftd-p3.html). 

Wait till the end of the installation process of the packages (30 minutes, 1 hour = a long long time). You'll get a strange error (504) if you try to connect before the installation is finished.