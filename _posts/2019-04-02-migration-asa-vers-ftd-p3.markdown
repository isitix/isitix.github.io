---
layout: default
author: MDY
title:  Migration d'un Cisco ASA 5506 de ASA-OS vers FTD, partie 3
date:   2019-04-02 11:00:00
image: /assets/css/images/blog/ftd.jpg
categories: main
description: "ASA 5506 migration FTD interface Web"
---
Dans [un précédent post](migration-asa-vers-ftd-p2.html), nous vous avons présenté la procédure de migration de firepower service vers FTD. Nous terminons cette série par un tour d'horizon de l'interface Web, pour vous donner envie de migrer.
<!--break-->

# Tour d'horizon de l'interface Cisco ASA FTD sur 5506

Sujet abordés :

- [l'architecture firepower](migration-asa-vers-ftd-p1.html)
- [la procédure de migration](migration-asa-vers-ftd-p2.html)
- la nouvelle interface web d'administration dans ce post

## Guide de l'administrateur FTD

Le guide d'administrateur FTD est disponible sur le site de Cisco. Il vous apportera beaucoup plus d'éléments que ce poste qui constitue un très rapide tour d'horizon des principales fonctionnalités.

## Licences

Le 5506 présenté ici est équipé d'une licence de base. Vous vous rendrez également compte concrétement, en parcourant ce post, des fonctions qui nécessitent des licences supplémentaires.

## Page d'accueil

La page d'accueil regroupe l'ensemble des éléments de gestion du parefeu vu comme un équipement de routage : 

- Interfaces
- Routage
- Mise à jour
- Sauegarde restauration
- Licences
- VPN Site à site

Elle comporte de plus deux accès spécifiques : 

- Remote access VPN *qui nécessite une licence*
- Advanced configuration qui permet d'appliquer des paramètres de configuration qui existaient dans un ASA classique mais ne sont pas encore disponibles en FTD, en les empaquetant dans du JSON (un peu compliqué mais faisable)

![Page d'accueil Cisco FTD](/assets/images/pageaccueil.png)

## Policy

La partie policy définit les règles de filtage de manière simple en fonction du parcours des paquets dans le système. Nous avons tronqué la copie d'écran par sécurité :

![Gestion des règles de filtrage FTD](/assets/images/filtrage.png)

Nous voyons que s'enchaîne les étapes suivantes : 

1. Déchiffrement SSL
2. Authentification des utilisateurs
3. Security intelligence
4. NAT
5. Access Control
6. Intrusion

### Déchiffrement SSL

Le trafic étant chiffré à plus de 70%, il est possible de déchiffrer pour appliquer des règles au niveau du trafic. Nous ne l'avons pas appliqué ici. Il est compris dans la licence de base mais nécessite de l'attention :

- Consommation CPU
- Nécessite de déployer un certificat et de gérer les problématiques de type "Man in the middle"
- Interaction à bien organiser entre le filtrage avec ou sans déchiffrement
- Incompatible avec certaines applications, mobiles notamment

![Déchiffrement SSL sur Cisco FTD](/assets/images/dechiffrementssl.png)

### Authentification des utilisateurs

Il est possible de s'interfacer avec un annuaire, notammenet Active Directory, mais également d'activer un portail captif permettant aux utilisateurs de s'authentifier, ce qui peut être une option intéressante pour protéger certains flux. Nous n'avons pas activé cette fonctionnalité, pourtant comprise dans la licence de base, ici :

![Authentification sur Cisco FTD](/assets/images/authentification.png)


### Security intelligence

Le module Security intelligence permet d'interroger une base Cisco pour ajouter des règles s'appuyant sur la réputation des domaines, des adresses IP et des URLs. Ce module est intéressant mais nécessite une licence supplémentaire :

![security policy Cisco FTD](/assets/images/securityintelligence.png)

### NAT

Le module NAT nous permet de définir des règles NAT équivalentes à celles existants sur un ASA classique (auto-nat, static nat, dynamic nat) mais à travers une interface plus conviviale

![nat Cisco FTD](/assets/images/nat.png)

### ACL

Le module ACL permet de définir les règles de filtrage des flux et les actions à entreprendre. Les fonctions liées à security intelligence ou intrusion detection ne sont pas disponibles. Il est cependant possible, par exemple, de faire du filtrage par zone géographique, par application - le moteur de classement des applications ne nécessite pas de licence supplémentaire - et par URL. 

![ACL sur Cisco FTD](/assets/images/acl.png)

### Intrusion detection

La partie intrusion detection permet de définir et d'adpater les règles SNORT d'analyse du trafic. Pour être actif, la politique d'intrusion doit être déployée dans la partie Access Control, ce qui nécessite une licence supplémentaire par rapport à la licence de base.

![intrusion detection Cisco FTD](/assets/images/intrusion.png)



## Monitoring

Enfin, le parefeu des tableaux de bord et une interface de requête permettant de visualiser et d'analyser les logs locaux. Le volume de logs est évidemment limité mais suffisant pour avoir une vision d'ensemble du fonctionnement du parefeu et réaliser du troubleshooting. Les informations entrant dans le monitoring dépendent de la configuration définie pour les logs et des licences activées sur le parefeu

![monitoring Cisco FTD](/assets/images/monitoring.png)

## Autres fonctions

Nous n'avons pas fourni de copies d'écran mais l'interface permet également :

- de définir les objets de la configuration
- d'accéder à un terminal (CLI)
- de configurer l'accès administration et les utilisateurs administrateurs du parefeu
- de gérer le déploiement de la configuration (mais pas de gestion de version à proprement parler)

## Conclusions

Avec FTD, l'ASA 5506 devient un parefeu performant, facile à prendre en main même par des administrateurs n'ayant pas de connaissance en Cisco. L'interface est simple et ergonomique, la partie monitoring est très utile pour avoir une première vue sur les problèmes de sécurité. En version de base, sans les licences complémentaires, vous serez probablement frustrés de ne pas pouvoir accéder aux fonctions remote VPN, filtrage par réputation et filtrage par IDS, le remote VPN étant probablement le plus problématique pour un administrateur à distance de l'équipement. Si vous souhaitez tester, la procédure d'installation est [ici](migration-asa-vers-ftd-p2.html)
)
