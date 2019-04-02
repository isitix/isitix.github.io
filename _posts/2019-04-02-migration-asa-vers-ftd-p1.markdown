---
layout: default
author: MDY
title:  Migration d'un Cisco ASA 5506 de ASA-OS vers FTD, partie 1
date:   2019-04-02 11:00:00
image: /assets/css/images/blog/ftd.jpg
categories: main
description: "ASA 5506 migration FTD"
---
Dans [un précédent post](/main/2018/07/25/configuration-base-asa-5505.html), nous vous avons présenté une configuration de base pour l'ancienne plateforme Cisco ASA 5505 en mode routé. Nous revenons sur ce sujet aujourd'hui pour introduire le remplaçant du 5505, le 5506 et vous expliquer comment le migrer d'ASA-OS vers le nouvel OS parefeu Cisco, FTD pour Firepower Threat Defense.
<!--break-->

# L'architecture ASA Firepower

Sujet abordés :

- l'architecture firepower (dans ce post)
- [la procédure de migration](migration-asa-vers-ftd-p2.html)
- [la nouvelle interface web d'administration](migration-asa-vers-ftd-p3.html)

## Introduction

La gamme de parefeu Cisco, 5505 pour la version historiques, et 5506 pour la dernière version, est destinée au marché du SOHO (TPE/PME) et du branch office (agences commerciales d'entreprises plus importantes). Malgré une certaine complexité de mise en place, le 5505 a eu beaucoup de succès parce qu'il offrait de bonnes performances, un grande stabilité, et des fonctions avancées de type clustering, VPN, mode transparent.

Son remplaçant, le 5506, est issue de la nouvelle architecture Cisco, X devenue depuis NG pour Next Generation. Le 5506 devrait passer end of sales bientôt, malheureusement, parce qu'après des débuts difficiles, il est devenu un parefeu performant, facile à configurer et de bonne qualité avec une interface web facile à prendre en main.

## Architecture matérielle

Le 5505 était basé sur une architecture de type switch L3, avec 8 ports switchés dont deux POE et une logique de répartition des flux par VLAN. Cette architecture avait de nombreux avantages, notamment pour les clients utilisant le 5505 dans des agences. Le nombre de ports était suffisant pour desservir une petite agence avec un ou deux ports WAN, un ou deux téléphones, deux ou trois PCs, une imprimante, une borne Wifi :

- un port ou deux ports WAN
- 6 ou 7 ports switchés sur le LAN

L'architecture du 5506 est différente à deux niveaux. Premièrement, c'est une architecture routée avec 8 ports routés et deuxièmement, elle comporte un module firepower sur lequel nous allons revenir plus loin.

Le 5506, à la différence du 5505, est plus un routeur qu'un switch L3, avec 8 ports routés. Il n'y a donc pas, à proprement parler, de notion de VLAN. L'équipement est destinée à être associé à un switch. Les VLANs sont gérés au niveau des ports routés, comme des sous-interfaces, comme sur un routeur. Comme cette solution ne convenait pas aux clients historiques de Cisco, qui avaient l'habitude d'utiliser le switch sur les 5505, un bridge group permet de recréer un ou des LAN locaux sur les différents ports si besoin.

Du fait de la présence du firepower service, un port réseau supplémentaire, management, a été ajouté pour manager l'équipement. Enfin, en plus du port console classique Cisco, il est possible de se connecter en console sur un port mini-usb, ce qui permet de se passer du câble bleu. L'accès console série sur USB est direct depuis Linux. Sous Windows, il nécessite le téléchargement d'un driver.

Enfin, la partie chiffrement a été mise à jour par rapport à l'ASA 5505 où il est compliqué d'activer le SHA2, qui est pourtant nécessaire pour avoir un accès SSL sécurisé.

## Firepower service ou Firepower threat defense ?

### SNORT

Il y a 5 ans, Cisco a racheté l'IDS/IPS (Intrusion Detection/Protection System) [SNORT](https://www.snort.org) et décidait de l'intégrer à sa gamme de parefeu, en remplacement d'un IDS interne qui tournait déjà sur la série ASA-X. En découle la gammme NG  à laquelle appartient le 5506.

![Firepower service versus Firepower threat defense](assets/images/ftdarchitecture.png)

### Firepower service

Pour aller vite dans l'intégration de SNORT, il est décidé d'empiler, au dessus d'un parefeu classique ASA, une machine Linux (X86?) hébergeant Snort avec une liaison interne entre les deux systèmes, les paquets étant d'abord traités par l'ASA, puis renvoyés, via le mécanisme d'inspection vers SNORT. Pour faire tourner le Linux, un disque SSD, qui était disponible en tant que module dans les ASA X, est ajouté à l'architecture.

### ASDM ou FMC ?

La plateforme ainsi constituée, dénommée ASA with firepower service, empile donc deux systèmes, un ASA et un module SNORT, avec deux interfaces de management, deux consoles, etc... L'ensemble peut être managé en mode console pour l'ASA comme un ASA classique. Pour la partie Firepower service, l'accès en CLI n'est pas très bien documenté. Il est préférable de travailler en GUI. L'accès en GUI peut se faire de deux manières, via l'ASDM, dont une nouvelle version est fournie ou via un serveur capable de manager plusieurs ASA en parallèe, la FMC, pour Firepower Management Console.

### Firepower Threat Defense

Cisco a ensuite redéveloppé un OS de parefeu intégrant SNORT et les fonctions de l'ASA. Ce nouvel OS s'appelle FTD, Firepower Threat Defense.

L'ADSM n'a pas la réputation d'être un logiciel très ergonomique. Il pose des problèmes de compatibilité avec Java. L'interface est lente, complexe. Pour un parefeu en mode standalone, et en particulier un 5506, destiné à une petite structure, l'installation d'un serveur FMC ne se justifie cependant pas vraiment. Il devient donc intéressant de migrer vers FTD et son interface full web. Cependant, cette migration apporte son lot de changement et de restriction que nous indiquons dans le tableau ci-après :

| Domaine | ASA with Firepower Service | FTD |
|---------|----------------------------|-------|
| Licences VPN | Deux licences anyconnect compris dans la licence de base | Pas de licence Anyconnect |
| Configuration de base | Configuration ASA classique comme sur un 5505 + configuration du module Firepower via ASDM ou FMC | Interface Web plutôt agréable, Cisco Defense Orchestrator à partir de la version 6.4 |
| Configuration avancée | ASA CLI | Flex config (un peu compliqué à prendre en main) |
| Traitement rapide du trafic | Fastpath permet d'éviter l'analyse SNORT | ?? (trust??) |

En conclusion, pour une installation locale de type standalone , en dehors du problème des licences anyconnect qui est un peu problématique pour de l'administration à distance, vous avez tout à gagner à migrer vers FTD. Dans [le prochain post](migration-asa-vers-ftd-p2.html), nous décrivons en détail les étapes de cette migration. Dans le post suivant, nous vous apportons [une présentation](migration-asa-vers-ftd-p3.html) de l'interface web FTD.
