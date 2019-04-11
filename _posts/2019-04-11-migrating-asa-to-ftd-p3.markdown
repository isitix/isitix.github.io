---
layout: default
author: MDY
title:  Migrating a Cisco ASA 5506 from ASA OS to FTD part 23
date:   2019-04-1 11:00:00
image: /assets/css/images/blog/ftdp3.jpg
categories: main
description: "ASA 5506 migration FTD GUI Web"
---
In [a previous post](migrating-asa-to-ftd-p2.html), we give you a step by step tutorial to migrate your ASA to FTD. We end up this serie of posts with a quick tour of the web administration interface, Firepower Device Manager (FDM).
<!--break-->

# A quick tour of ASA FTD FDM

- [ASA NG architecture](migrating-asa-to-ftd-p1.html)
- [A step by step guide to upgrade your ASA](migrating-asa-to-ftd-p2.html)
- A quick tour of FDM in this post

## Official documentation

This post is a quick tour of FDM. If you need detailed instructions, you should download FTD administration guide on Csico web site.

## Licenses

The 5506 presented here is installed with a base license. You'll get a better undestanding of functionnalities that require advanced licenses by reading this post.

## Welcome page

The welcome page gives access to the management of the firewall viewed as an network node :

- Interfaces
- Routing
- Update
- Backup and recovery
- Licenses
- Site to site VPN

The are two additional links :

- To Remote access VPN configuration *that requires a specific license*
- Advanced configuration that lets you define configuration parameters that exist on ASA and are not avaible in the FDM.

![FDM welcome screen](/assets/images/pageaccueil.png)

## Policy

The policy section defines filter rules. We truncate the screen snapshot for security reasons :

![Filter rules](/assets/images/filtrage.png)

The pipeline that processes the traffic includes the following steps : 

1. SSL policy
2. Users authentication
3. Security intelligence
4. NAT
5. Access Control
6. Intrusion

### SSL policy

More than 70% of Internet traffic is ciphered. FTD lets you decide which traffic you uncipher to apply filters to the unciphered traffic.  The functionnality is disabled in the example. SSL policy is included in the base license but requires some attention :

- CPU load
- Managing certificates and "Man in the middle" configuration
- Managing side effects between pre-SSL and post-SSL filtering rules
- Managing compatibily issues with some applications, mobile applications specifically

![SSL policy FDM](/assets/images/dechiffrementssl.png)

### Users authentication

FTD can interface with a directory, such as Active Directory. You can set up a captive portal too. This functionnality is part of the base license. We didn't activate it in this example :

![users identification FDM](/assets/images/authentification.png)


### Security intelligence

The security intelligence service requests Cisco databases to implement filters bases on the reputation of IPs, domain names and URLs. This module is very rich but requires an additional license :

![security policy Cisco FTD](/assets/images/securityintelligence.png)

### NAT

The NAT service defines the NAT configuration, in a way similar to plain ASA NAT (auto-nat, static nat, dynamic nat) :

![nat Cisco FTD](/assets/images/nat.png)

### ACL

You can define ACL rules using this module of the interface. With the base license, advanced functionnalities like security intelligence and intrusion detection are disabled. However, you can filter traffic on the basis of geographical criteria or applications identification or URLs (as long as you define a black or white list of URL). Filtering on geography and applications is included in the base license : 

![ACL Cisco FTD](/assets/images/acl.png)

### Intrusion detection

Intrusion detection is used to define SNORT IDS rules to analyse and block (or permit) flows. An additional license is required to use it:

![intrusion detection Cisco FTD](/assets/images/intrusion.png)

## Monitoring

The firewall offers dashboards and a query interface to view and search through local logs. The volume of log data is limited by the size of the local log buffer but the interface is very easy to use to get a global insight on the system or to troubleshoot the configuration. 
Information available in the log depends on the configuration (which log you activate) and on licenses (which functionnalities you activate)

![monitoring Cisco FTD](/assets/images/monitoring.png)

## Others

The interface offers the following services too :

- Configuration object management
- Terminal (CLI) and web access administration management 
- Web emulation of the CLI
- Configuration deployment (but no versioning of configuration)
- Backup and restoration
- Updates

## Conclusion

With FTD, ASA 5506 is a good firewall for small businesses and branch offices, easy to configure and monitor, even for administrators with limited Cisco knowledge. The FDM interface is simple and ergonomic. The monitoring pages give you a good overview of the state of the firewall.
Without additional licenses, you probably get frustrated not to be able to configure remote VPN, to configure IDS rules.  To test it, an installation procedure is available [here](migrating-asa-to-ftd-p2.html)
)
