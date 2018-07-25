---
layout: default
author: MDY
title:  Une base de configuration pour firewall Cisco ASA 5505
date:   2018-07-25 06:00:00
image: /assets/css/images/blog/firewall.jpg
categories: main
description: "Cisco ASA 5505 base configuration ASA OS version 9 et supérieure"
---
Les firewalls Cisco ASA 5505 sont encore très répandus. On en trouve de plus d'occasion ou reconditionnés à des prix intéressants. Nous publions ci-après une configuration de base pour ce matériel. Cette configuration suppose une utilisation de l'équipement en mode routage, avec une IP publique directe chez un opérateur. Cette configuration a le mérite d'être simple, de fonctionner et de pouvoir servir de base à une configuration plus avancée en fonction des besoins en sécurité. Cette configuration fonctionne également, avec quelques modifications mineures sur les ASA 5506-X. <!--break-->

Cette configuration permet d'accéder en VPN anyconnect à l'équipement pour l'administrer via SSH. Nous n'avons pas ajouté, dans cette version de base, l'authentification par clé, qui fera l'objet d'un post ultérieur.

## Définition de la configuration
### LAN
- Management : 192.168.77.1
- Gateway (interface in) : 192.168.22.254
- Ip publique : 19.22.25.45
- Domain : ISITIX-france.com
- Ne pas utiliser la .1 sur le réseau interne (192.168.22.1) qui correspond à la box operateur.
- Machines sont en 192.168.22.x / 24

=> à l'issue de la mise en place du nouveau firewall, modifier le pool d'adresses IP privées pour passer la passerelle operateur en 192.168.22.1  (ticket à déposer chez OBS)


### Pool public

- Sous-réseau : 19.22.25.40 (réservé)
- Plage : 40 jusqu'à 47
- Broadcast : 47
- Routeur operateur : 46
- Masque : 255.255.255.248
- DNS : 19.2.0.20, 19.2.0.50

Pool privé spécifique opérateur avec natage sur un gros routeur central
Pool privé : 192.168.22.1 (adresse IP privé du routeur opérateur)
ibre


## Réalisation de la configuration : phase 1, démarrage du nouvel ASA
### Plan de travail pour la mise en place du nouvel ASA 5505
* Se connecter sur l'ASA en port série OK
* Connecter l'ASA au réseau local => lui attribuer une adresse LAN (interface Lan et inteface de management) OK
* Activer SSH et SCP OK
* Faire l'inventaire des versions installées OK
* Rechercher les nouvelles versions sur le site Cisco OK
* Installer les nouvelles versions OK
* Mettre ensuite en place la configuration (filtrage, NAT) OK
* Accès VPN Anyconnect pour administrer le routeur

### Connexion port série
Pour se connecter directement depuis Linux avec un câble serie Cisco et un adaptateur serie-usb :
```
$sudo minicom -s
```

### Configuration des interfaces physiques
Activation des deux ports inside (port 0) et outside (port 5) et désactivation des autres ports

Les ports 6 et 7 sont POE
```
ISITIX-fw(config)# interface ethernet 0/0
ISITIX-fw(config-if)# description outside
ISITIX-fw(config-if)# no shutdown
ISITIX-fw(config)# interface ethernet 0/5
ISITIX-fw(config-if)# description inside
ISITIX-fw(config-if)# no shutdown
ISITIX-fw(config)# interface ethernet 0/1
ISITIX-fw(config-if)# shutdown
ISITIX-fw(config)# interface ethernet 0/2
ISITIX-fw(config-if)# shutdown
ISITIX-fw(config)# interface ethernet 0/3
ISITIX-fw(config-if)# shutdown
ISITIX-fw(config)# interface ethernet 0/4
ISITIX-fw(config-if)# shutdown
ISITIX-fw(config)# interface ethernet 0/6
ISITIX-fw(config-if)# shutdown
ISITIX-fw(config)# interface ethernet 0/7
ISITIX-fw(config-if)# shutdown
```

### Définition des paramètres réseaux
```
name 192.168.77.2 mgt_ip
name 192.168.22.254 inside_ip
name 19.22.25.45 outside_ip
name 19.2.0.20 operateur_dns
name 185.94.77.77 europe_pool_ntp_org
name 192.168.22.0 inside_lan
name 19.22.25.46 operateur_router
```
### Mise en place des interfaces VLAN
Configuration des VLANS, 1 pour l'administration, 2 pour le LAN et 9 pour le WAN

```
interface Vlan1
 management-only
 nameif management
 security-level 100
 ip address mgt_ip 255.255.255.0 
!
interface Vlan2
 description inside
 nameif inside
 security-level 99
 ip address inside_ip 255.255.255.0 
!
interface Vlan9
 description outside
 nameif outside
 security-level 0
 ip address outside_ip 255.255.255.248
 ```

Ajout des ports dans les bons VLANs
```
interface ethernet 0/0
switchport mode access
switchport access vlan 9

interface ethernet 0/5
switchport mode access
switchport access vlan 2
```


### Hostname, domain, time
Configuration générale du parefeu
```
hostname ISITIX-fw
domain-name ISITIX-france.com
clock timezone CET 1
clock summer-time CEST recurring
dns domain-lookup inside
name 19.2.0.20 operateur_dns
dns name-server operateur_dns
name 185.94.77.77 europe_pool_ntp_org
ntp server europe_pool_ntp_org
aaa authentication enable console LOCAL
```

Vérification de l'heure
```
show ntp associations
show clock
show ntp status
```

Désactivation de smart call home
```
clear config call-home 
no service call-home
```

### Authentification des utilisateurs
Sur base locale avec pwd (basic)
```
user-identity default-domain LOCAL
aaa authentication enable console LOCAL
```

### Activation de SSH et SCP
```
ssh version 2
ssl server-version tlsv1-only
ssl client-version tlsv1-only
ssh scopy enable
crypto key generate rsa modulus 2048
write memory
aaa authentication ssh console LOCAL
username admin password XXXXXX privilege 15
ssh timeout 15
ssh inside_lan 255.255.255.0 inside
```

### Mise à jour du firmware
```
Linux$scp asa924-k8.bin administrateur@192.168.22.254:disk0:/asa924-k8.bin
boot system disk0:/asa924-k8.bin
```

## Phase 2 de la configuration de l'ASA : NAT, routage, filtrage
### Network objects
Ajout des objets réseau pour les ACL éventuelles
```
object network WAN_NETWORK
 subnet 19.22.25.40 255.255.255.248
object network LAN_IP
 host 192.168.22.254
object network WAN_IP
 host 19.22.25.45
object network operateur_ROUTER
 host 19.22.25.46
object network LAN_NETWORK
 subnet 192.168.22.0 255.255.255.0
```

### Route par défaut
```
route outside 0 0 operateur_router 1
```

### Natage du LAN vers le WAN
```
object network LAN_NETWORK
 nat (inside,outside) dynamic interface
```

### Filtrage du sortant LAN par ACL
Définition de la liste des services
```
object-group service dns
 service-object tcp-udp destination eq domain 
object-group service https
 service-object tcp destination eq https 
object-group service http
 service-object tcp destination eq www 
 service-object tcp destination eq 8080 
 service-object tcp destination eq 8008 
object-group service pop
 service-object tcp destination eq pop3 
 service-object tcp destination eq 995 
object-group service smtp
 service-object tcp destination eq smtp 
 service-object tcp destination eq 465 
object-group service rtmp
 service-object tcp-udp destination eq 1935 
 service-object tcp destination eq 8134 
 service-object tcp destination eq 1111 
object-group service ssh
 service-object tcp destination eq ssh 
object-group service google-play
 service-object tcp destination eq 5228 
 service-object tcp destination eq 5229 
 service-object tcp destination eq 5320 
 service-object udp destination eq 5228 
object-group service teamviewer
 service-object tcp-udp destination eq 5938
object-group service spotify
 service-object tcp destination eq 4070 
object-group service imap
 service-object tcp destination eq imap4 
 service-object tcp destination eq 993 
object-group service ping
 service-object icmp traceroute
 service-object icmp echo
 service-object icmp alternate-address
 service-object icmp mask-request
 service-object icmp redirect
 service-object icmp 
object-group service telnet
 service-object tcp destination eq telnet 
object-group service ntp
 service-object tcp-udp destination eq 123 
object-group service vpn
 service-object udp destination eq isakmp 
 service-object udp destination eq 1701 
 service-object tcp destination eq pptp 
object-group service ftp
 service-object tcp destination eq ftp 
 service-object tcp destination eq ftp-data
```
Regroupement des services dans un ensemble de services autorisés :
```
object-group service service_enabled
 group-object https
 group-object http
 group-object pop
 group-object smtp
 group-object rtmp
 group-object ssh
 group-object google-play
 group-object teamviewer
 group-object spotify
 group-object imap
 group-object ping
 group-object telnet
 group-object ntp
 group-object vpn
```
Ajout d'ACL pour contrôler le trafic
```
access-list inside_in_acl extended permit object-group service_enabled object LAN_NETWORK any 
access-list inside_in_acl extended permit ip object LAN_NETWORK any log 
access-group inside_in_acl in interface inside
```

### Inspection du trafic
Ajout d'une politique globale  (permet également le passage du trafc icmp/ping)
```
icmp unreachable rate-limit 1 burst-size 1
icmp permit any echo inside
icmp permit any echo-reply inside
class-map global_map
 match default-inspection-traffic
policy-map global_policy
 class global_map
  inspect icmp 
  inspect dns 
  inspect ftp 
  inspect h323 h225 
  inspect h323 ras 
  inspect http 
  inspect sip  
  inspect snmp 
  inspect ipsec-pass-thru 
  inspect ip-options 
  inspect pptp 
  inspect esmtp
service-policy global_policy global
```
### Détection des menaces basiques
Scan et autres
```
threat-detection basic-threat
threat-detection statistics access-list
threat-detection statistics tcp-intercept rate-interval 30 burst-rate 400 average-rate 200
```
Spoofing
```
ip verify reverse-path interface inside
ip verify reverse-path interface outside
```

## Phase 3 : accès anyconnect admin
Objectif : pouvoir manager l'ASA en SSH sur un tunnel VPN.

Remarque : comme il n'y a qu'une groupe policy et un seul tunnel groupe, tout se passe bien et on tombe sur les valeurs par défaut. Sinon, il y aurait un mapping à réaliser entre le client, le username et les autres paramètres.

### Définition du pool d'adresses et du sous-réseau
```
ip local pool VPN_POOL 192.168.22.193-192.168.22.198 mask 255.255.255.0
object network VPN_NETWORK
 subnet 192.168.22.192 255.255.255.248
```

### Définition de l'ACL pour le split du trafic sur le client
```
access-list SplitVPNTunnel standard permit 192.168.22.0 255.255.255.0 
```
### Modification du NAT
Pour désactiver le NAT vers le pool d'adresses VPN
```
nat (outside,inside) source static VPN_NETWORK VPN_NETWORK destination static LAN_NETWORK LAN_NETWORK no-proxy-arp
nat (inside,outside) source static LAN_NETWORK LAN_NETWORK destination static VPN_NETWORK VPN_NETWORK no-proxy-arp
```
### Activation de anyconnect
```
ssl server-version tlsv1-only
webvpn
 enable outside
 anyconnect image disk0:/anyconnect-linux-2.2.0140-k9.pkg 1
 anyconnect enable
 tunnel-group-list enable
 cache
  disable
 error-recovery disable
```

### Définition de la VPN Policy
```
group-policy VPNGroupPolicy internal
group-policy VPNGroupPolicy attributes
 vpn-tunnel-protocol ssl-client 
 split-tunnel-policy tunnelspecified
 split-tunnel-network-list value SplitVPNTunnel
 address-pools value VPN_POOL
 ipv6-address-pools none
 webvpn
  anyconnect ssl dtls enable
  anyconnect keep-installer none
  anyconnect dtls compression none
  anyconnect ask none default anyconnect
```
### Définition du tunnel
```
tunnel-group VPNTunnelGroup type remote-access
tunnel-group VPNTunnelGroup general-attributes
 default-group-policy VPNGroupPolicy
tunnel-group VPNTunnelGroup webvpn-attributes
 group-alias ANYCONNECT-VPN enable
```
et accrochage de la policy au tunnel :
```
group-policy VPNGroupPolicy attributes
  group-lock value VPNTunnelGroup
```
### Ajout d'un utilisateur
```
username ISITIXanyconnect password XXXXXX/eq encrypted
username ISITIXanyconnect attributes
 service-type remote-access
```
### Activation du ssh sur l'ASA depuis VPN
```
management-access inside
```


### Filtrage du trafic pour limiter l'accès au ssh sur l'IP interne de l'ASA
Remarque : il est intéressant de tester que tout fonctionne bien avant d'ajouter ces règles de filtrage supplémentaires.

```
access-list FilterVPN extended permit object-group ssh object VPN_NETWORK object LAN_IP log 
group-policy VPNGroupPolicy attributes
 vpn-filter value FilterVPN
```

## Raccordement physique
Cordon entre le FW et la box sur la 0/0 ou la 0/3 (data), 0/1 ou 0/2 pour la téléphonie


