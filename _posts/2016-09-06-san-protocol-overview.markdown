---
layout: default
author: AGS
title:  "An overview of SAN protocols"
date:   2016-09-06 06:00:00
categories: main
image: /assets/css/images/blog/san.jpg
description: "FCOE, iSCSI, SMB, NFS, which san protocol ?"
---
## Abstract
Since the advent of iSCSI, chosing a block-storage transport protocol is a recurring debate.<!--break--> With the growing integration of cloud storage and hybrid storage, and the increasing performance of LAN ethernet, Software Defined Storage Protocol are more and more relevant as an alternative to hardware solutions based on Fiber Channel and its derivative.
## Quel protocole de transport pour le SAN ? FC, FCoE, iSCSI, SMBv3 ou NFSv4 ?
Depuis l’émergence du iSCSi dans les Datacenters, le choix du protocole de transport en alternative au Fibre Channel au niveau SAN est un débat récurrent.

## Un débat qui refait surface avec l'intégration des normes DCB dans les switches
Aujourd’hui c’est de plus en plus en d’actualité avec l’intégration des nouvelles normes DCB dans les switches Ethernet de la gamme Datacenter. Les switchs Ethernet DCB offrent aujourd’hui des niveaux de performance et de robustesse lors du transport des trames équivalents à ceux des switchs Fibre Channel.

## Le succès mitigé du FCoE
En tentant d'imposer le FCoE dans les Datacenters, Cisco a participé à l’émergence de ces normes mais n’a pas été récompensé de ces efforts. En effet le FCoE (Fibre Channel Over Ethernet) peine à percer dans les Datacenters pour différentes raisons : relative complexité de mise en œuvre, réticence au changement des équipes informatiques avec la nécessité de revoir le périmètre des rôles et responsabilités entre les équipes LAN et SAN, un ROI dans les datacenters existants difficile à atteindre à court terme avec un historique de serveurs ou de commutateurs incompatibles avec le FCoE…

## Le retour en force de SMB et NFS
Finalement ce sont les nouvelles versions des protocoles historiques SMB et NFS qui devraient percer à l’avenir. En effet, elles bénéficient de la feuille de route des switchs DCB en matière de bande passante (10/40/100 Gbs), avec une très faible latence aux alentours de la microseconde.

Leurs réelles avancées au niveau protocolaire et leur facilité de mise en œuvre sont des atouts indéniables.

Le support de base Oracle avec NFS, de Microsoft SQL server avec SMBv3, de VMware avec NFSv4 ou encore de Nutanix avec SMBv3 ou NFS sont clairement des indicateurs d’une tendance de fond.

Aujourd’hui l’avenir d’une architecture de commutation convergée au niveau du Datacenter semble reposer davantage sur les protocoles SMBv3 ou NFSv4 que sur FCoE.
