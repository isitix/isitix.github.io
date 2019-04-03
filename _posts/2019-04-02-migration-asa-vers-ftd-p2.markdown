---
layout: default
author: MDY
title:  Migration d'un Cisco ASA 5506 de ASA-OS vers FTD, partie 2
date:   2019-04-02 11:00:00
image: /assets/css/images/blog/ftdp2.jpg
categories: main
description: "ASA 5506 migration FTD"
---
Dans [un précédent post](migration-asa-vers-ftd-p1.html), nous vous avons présenté l'architecture FTD et la comparions à ASA with firepower service. Nous donnons, dans ce post, une procédure de migration détaillée.
<!--break-->

# Migration de ASA with Firepower Services vers FTD

Sujet abordés :

- [l'architecture firepower](migration-asa-vers-ftd-p1.html)
- la procédure de migration dans ce post
- [la nouvelle interface web d'administration](migration-asa-vers-ftd-p3.html)

## Procédure officielle Cisco

La procédure complète officielle Cisco est [accessible ici](https://www.cisco.com/c/en/us/td/docs/security/firepower/quick_start/reimage/asa-ftd-reimage.html)

## Packages d'installation

Il ne faut pas se tromper entre les deux architectures disponibles [décrites dans le post précédent](migration-asa-vers-ftd-p1.html), ASA with firepower services et FTD, qui s'appuient sur deux ensembles de paquets différents :

| ASA with firepower services | FTD | Commentaire |
|-----------------------------|-----|-------------|
| ROMMON | ROMMON | Equivalent du BIOS pour un PC |
| ASA OS | ASA FTD (.lfbff) | Sur la version classique c'est l'OS ASA; sur FTD, c'est un linux adapté |
| Firepower service | FTD package (.pkg) | Sur la version classique, c'est le linux Firepower; sur FTD, ce sont des packages d'installation à ajouter sur le noyau linux FTD |
| ASDM | Sur la version classique, c'est le client Java de management; sur FTD, pas d'équivalent puisque l'on accès en Web |7

## Reset complet

Démarrage avec connexion par câble console
ESC avant la phase de boot

```ios
confreg 0x41
confreg
```

Choix "ignore system configuration"

Pour la procédure complète, aller à [la page suivante](https://community.cisco.com/t5/security-documents/asa-password-recovery/ta-p/3126046).

## Mise à jour des mots passe

```ios
enable
conf t
username ZZZZ  password XXXXX privilege 15
enable password YYYYY
no config-register
reload
```

## Mise en place d'adresses IP temporaires pour réimager vers FTD

Deux IPs choisies :

- 172.10.0.75
- 172.10.0.76

```ios
interface GigabitEthernet 1/1
nameif inside
no traffic-forward sfr monitor only

interface management 1/1
ip address 172.10.0.75 255.255.255.0
```

Ouverture de l'accès SSH sur l'IP de management

```ios
conf t
ssh 172.10.0.0 255.255.255.0 management
ssh scopy enable
ssh version 2
aaa authentication ssh console LOCAL
```

Copie du firmware depuis poste Linux vers ASA

```bash
scp asa5500-firmware-1114.SPA adminix@172.10.0.75:disk0:asa5500-firmware-1114.SPA
```

Vérification du MD5 du firmware

```ios
ciscoasa# verify /md5 disk0:asa5500-firmware-1114.SPA
```

Mise à jour de la rommon

```ios
upgrade rommon disk0:asa5500-firmware- xxxx.SPA
```

## Mise à disposition des packages d'installation

Pour préparer les deux étapes suivantes, il est nécessaire :

- d'avoir créé le répertoire $HOME/tftp
- d'avoir déposé les packages d'installation ftd-boot-9.9.2.0.lfbff et ftd-6.2.3-83.pkg dans le répertoire tftp

## Mise en place d'un serveur TFTP temporaire

Pour ce faire, nous utilisons  [un serveur disponible via docker](https://hub.docker.com/r/pghalliday/tftp/)

Build et run selon les préconisations du développeur :

```bash
docker run -p 0.0.0.0:69:69/udp --name tft-asa -v $HOME/tftp:/var/tftpboot -i -t pghalliday/tftp
```

## Mise en place d'un serveur http temporaire

Nous utilisons un Apache standard téléchargeable sur Docker :

```bash
docker run -dit --name apache-asa -p 80:80 -v $HOME/tftp/:/usr/local/apache2/htdocs/ httpd:2.4
```

## Téléchargement et vérification des packages d'installation

```bash
md5sum ftd-boot-9.9.2.0.lfbff
md5sum ftd-6.2.3-83.pkg
```

## Chargement du firmware FTD

On reboote l'ASA
```
CISCOASA#reload
```

Pendant la phase de reboot, on appuie sur ESC pour obtenir le prompt de la rommon depuis la console.

Depuis la rommon, on fixe les variables nécessaires pour réaliser l'installation :

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

L'ASA télécharge le firmware et reboot sur le nouveau système. Il faut ensuite initialiser les paramètres d'accès à l'administration.

```ios
setup
```

Initialisation des paramètres de l'interface d'administration (adresse IP, etc...)

## Chargement du système FTD via http

```ios
system install noconfirm http://172.10.0.4/ftd-6.2.3-83.pkg
```

## Première connexion en mode console

Le login par défaut est admin
Le mot de passe par défaut est Admin123

Une suite de question basique est ensuite posée pour configurer le système.

## Connexion en Web

Il suffit ensuite de se connecter à l'interface de management via un browser en https pour accéder à la configuration du système :

```ios
https://<adresse IP de management>/
```

## Conclusion

Une fois cette opération réalisée, le 5506 devient un parefeu équipé d'une interface ergonomique que nous présentons dans [le post suivant](migration-asa-vers-ftd-p3.html). 

Pendant la procédure de migration, attention à laisser un temps suffisant pour l'installation des packages, qui est très lente. A défaut, une tentative d'accès en mode renvoie un message troublant (504) alors qu'il suffit d'attendre.
