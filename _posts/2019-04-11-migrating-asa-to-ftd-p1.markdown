---
layout: default
author: MDY (blog@isitix.com)
title:  Migrating a Cisco ASA 5506 from ASA OS to FTD part 1
date:   2019-04-11 11:00:00
image: /assets/css/images/blog/ftd.jpg
categories: main
description: "ASA 5506 migration FTD"
---
In [a previous post](/main/2018/07/25/configuration-base-asa-5505.html), we offered a basic 5505 routed mode configuration.
This post is the first of a serie about the Cisco firewall, ASA5506, to present its architecture and to show how to migrate to the new OS, FTD (Firepower Threat Defense).
<!--break-->

# ASA Firepower architecture and migration to FTD

- Firepower architecture (in this post)
- [how to migrate to ft](migrating-asa-to-ftd-p2.html)
- [FTD GUI](migrating-asa-to-ftd-p2.html)

## Introduction

The legacy Cisco ASA 5505 firewall and the new ASA 5506 target SOHO and branch offices. Despite being a bit complex to configure compared to its competitors, the 5505 offered good performances, was very robust, and embarked advanced functionalities like VPN, clustering and transparent mode. 5505 is still a good fit as a second wall of defense. You can find refubirshed ones at a bargain price.

The relatively new 5506 is based on the new Cisco firewall architecture, named X-serie and renamed NG (for next generation) serie. The 5506 will be end of sales soon, unfortunately, because, after a few bugged versions, the latest versions of its firmware are stable, deliver the features you need in an easy and intuitive way, supported by a clean and ernonomic GUI.

## Hardware architecture

The 5505 was built upon a L3 switch architecture, with 8 switched ports, 2 of them POE. Traffic flows were seggregated using VLANs. This architecture was favored by clients deploying 5505 in branch office. 8 switched ports are sufficient to connect every stations in a small office without an additional swithc :

- one or two ports to WAN
- Two or three desktops
- A printer
- a Wifi access point

The 5506 has the same form factor as the 5505 but is built upon a very different architecture. First, ports are routed, and second, the 5506 embarked an additionnal module, Firepower module.

The 5506 offers eight routed ports, no VLAN interface but routed port sub-interfaces. In recent versions of the firmware, Cisco has preconfigured a bridge group to minimize changes for clients migrating from 5505 to 5506.

Cisco added an ethernet "management" port  to access to the firepower service engine, and a serial (mini-usb) port to connect in console mode.

Last, cipher algorithms have been updated to offer SHA2. 5505 only offers SHA1, which is unsafe. Activating SHA2 is complex.

## Firepower service versus Firepower threat defense ?

### SNORT

Five years ago, Cisco acquired SNORT(https://www.snort.org), the famous IDS/IPS (Intrusion Detection / Intrusion Protection System). Cisco decided to integrate SNORT in its ASA firewall product range, in place of its own IDS, who was available on the ASA X serie. This effort produced the NG (Next Generation) firewall product range. 

![Firepower service versus Firepower threat defense](/assets/images/ftdarchitecture.png)

### Firepower service

To reduce it time-to-market, an hybrid architecture linking a plain old ASA with a linux SNORT agent was designed. Packets are processed by the traditional ASA and a fraction of the traffic is diverted to the SNORT agent by inspection rules. The corresponding packets are queued, while SNORT is inspecting them. Depending of the IDS rules activated on SNORT, SNORT sends an order to block or to permit the traffic to the ASA. The ASA drops the traffic if necessary, or forwards it to the next step in the firewall pipeline. 

To run SNORT, a kind of X86 hardware - we didn't inverstigate further - with RAM, processor and SSD, is added to the ASA hardware platform.

### ASDM ou FMC ?

As a result, the new ASA houses two systems, a regular ASA and a SNORT agent, with two management interfaces, two consoles and so on. 

You manage the ASA as a conventional ASA, either in console mode (SSH, Serial) or using the awful ASDM :-).

To manage the firepower module, you can either use a SSH CLI, that is not that well documented, or (preferably) use the GUI. GUI managemend is offered in two flavors, ASDM or FMC (Firepower Management Console). Cisco more or less recommended to use FMC. 

FMC is a server. You have to deploy it on an indepent server. Firewalls are registered on the FMC using a crypto key mechanism. The FMC centralizes both the configuration and the logs of the firewall that are connected to it. The FMC is more powerful and easier to use than the ASDM firepower module.

### Firepower Threat Defense

Cisco released a new OS, Firepower Threat Defense (FTD) dedicated to ASA-NG. FTD integrates seamlessly ASA and firepower functionnalities.

When deploying a standalone firewall, such as a 5506 in a small business, you may not want to suffer the burden of installing and running a FMC server or working on the old ASDM Java client. Migrating to FTD, with its full web configuration GUI also named Firepower Device Management (FDM) becomes an attractive solution to both the old ASDM and the powerful but heavy FMC. Nevertheless, this migration comes with its specificities that you'll find in the table below : 

| Domain | ASA with Firepower Service | FTD |
|---------|----------------------------|-------|
| VPN licenses | Two VPN anyconnect licenses included in the base license | No Anyconnect license included in the base configuration |
| Standard configuration | ASA OS configuration (CLI or ADSM) + firepower configuration using ASDM or FMC | Web interface (Firepower Device Manager, FDM), Cisco defense orchestrator (server) available from firmware version 6.4 |
| Advanced configuration | ASA CLI, FMC, Firepower module CLI | Flex config |
| Fast traffic filtering | Fastpath bypasses SNORT filtering | ?? (trust??) |

As a conclusion, if you're looking for a standalone firewall, migrating to FTD is a winning decision, except the problem of anyconnect license. In [the next post](migrating-asa-to-ftd-p2.html), we'll detail the migration procedure. In a final post, we show [FTD GUI](migrating-asa-to-ftd-p3.html).