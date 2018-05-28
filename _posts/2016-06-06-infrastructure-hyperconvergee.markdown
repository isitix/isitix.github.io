---
layout: default
author: AGS
title:  Infrastructure hyperconvergée
date:   2016-06-06 06:00:00
image: /assets/css/images/blog/hyperconverged.jpg
categories: main
description: "Elements concernant les infrastructures hyperconvergées"
---
##Abstract
Hyperconverged infrastructures promise less configuration work, a lower operating cost, and horizontal scaling capabilities. But they come with their own fallacies and pitfalls, mainly:<!--break-->

- The scaling out process may be more complex than planned because in hyperconverged architecture, memory, processing, storage IO and networking are very intricate
- You may be locked in a proprietary solution, both in terms of software and in terms of hardware. For instance, existing solutions force that every node is the same
- Data consistency mechanisms are very complex especially if you need to build a stretched cluster
- You'll have to be very consistent in the way you manage server licenses

Beyond these challenges, some of our clients are already migrating to hyperconverged solutions because, depending on the use case, they may offer tremendous performance improvement, and simplifiy operation at a relatively low cost

## Une arrivée remarquée, stimulée par les perspectives de solutions scale-out
Depuis quelques temps, les infrastructures dites 'hyperconvergées', font une arrivée remarquée sur le marché de l'IT. Ces solutions, qui pour certaines se sont fait connaître sur le marché du VDI, adressent aujourd’hui les architectures IaaS en offrant des services à valeur ajoutée avec a priori moins d'ingénierie nécessaire en amont. La possibilité d'ajouter de la puissance de traitement de manière linéaire au niveau de stockage, est sur le papier l'un des points forts de ce type de solutions. Cela évite les effets de seuil parfois rencontrées sur les solutions traditionnelles de stockage de type scale-up.

## Un usage encore confidentiel

Par ce billet nous souhaitons tempérer quelque peu l'enthousiasme parfois excessif que nous rencontrons. Voici donc quelques remarques et interrogations que nous proposons de partager:

- En France le nombre de références en réelle production, avec un nombre significatif de VMs avec des profils variés est aujourd'hui très faible.
- Mise à part les benchmarks de type VDI, aucun autre benchmark d’un tiers n’est aujourd’hui communiqué que ce soit sur la partie calcul ou disques.
- Dans leur configuration actuelle, les solutions proposées s'appuient sur des architectures propriétaires. Le fait d'avoir un seul fournisseur ne permet pas de faire jouer la concurrence sur les ressources stockage, réseau et serveur. Y-a-t-il un vrai ROI sur le moyen terme?
- En matière de gestion de capacité, il y a une adhérence forte entre les ressources stockage, réseau, mémoire et de calcul lorsque l'on ajoute un nouveau nœud dans un cluster. La granularité de la gestion de capacité de la puissance de traitement est donc moins fine que dans les architectures précédentes et peu avoir un impact non négligeable en matière de licence hyperviseur.
- La capacité d’E/S d’une VM peut dépendre des caractéristiques disques du nœud physique sur lequel elle s’exécute, cela semble contraire aux principes d’une architecture de type « Grid » et cela est de fait un principe incompatible avec certains profils applicatifs. En fait le peu d’axes disques sur un nœud physique est un facteur limitant pour certains profils d’accès, lorsque le tiering SSD n’est plus utilisé.
- Le réseau physique Ethernet est partagé à la fois pour les flux VMs, le flux de gestion de l’hyperviseur et les flux de gestion de la « parité » des données : cela pose des questions en cas d’incident sur la partie réseau et notamment vis-à-vis de l’intégrité des données.

##  La promesse d'une plus grande souplesse

Sur un certain nombre de projets, notamment lorsque la croissance des volumes et des traitements est forte, les architectures conventionnelles manquent souvent de la souplesse nécessaire pour encaisser la croisance sans des upgrades importants de l'architecture.

Trop souvent, nous rencontrons des clients contraints à un upgrade important voire un remplacement d'une architecture dont la performance se dégrade en raison de l'évolution des besoins.

La perspective offerte par les infrastructures hyperconvergées d'un scale out au fil de l'eau des besoins est particulièrement séduisante

Nous avons conscience que les solutions hyperconvergées peuvent apporter une vraie valeur ajoutée dans ce type de situation, et ce type de solution s’inscrit dans la tendance actuelle du « Software Defined Datacenter » ou « Software Defined Storage » où la plus-value se situe dans une infrastructure entièrement reconfigurable - si possible automatiquement - en fonction des besoins avec des briques matérielles sous-jacentes banalisées.

Il reste encore beaucoup d’étapes à franchir pour pérenniser ces architectures.

## Un avenir qui passe par l'open source et la standardisation ?

Quatre domaines nous semblent intéressants à surveiller et à expérimenter:
- L'émergence progressive d'un standard de gestion des ressources et des services du datacenter autour des solutions OpenSource type OpenStack
- Les efforts de standardisation des technologies SDN comme OpenFlow
- Le développement des solutions de containerisation légères type docker ou hdfs
- Et enfin la capacité à intégrer l'ensemble de ces initiatives dans une vision globale d'exploitation des ressources disponibles, notamment des multipes solutions de cloud, du legacy et des nouveaux systèmes hyperconvergés ou pas

## En conclusion
A ce stade, l'hyperconvergé n'est donc ni la solution unique ni la clé de l'évolution du datacenter. Sa mise en place offira une réelle valeur ajoutée si elle s'intègre à un système de gestion des ressources qui intègre de manière transparente la solution hyperconvergée et l'existant de l'entreprise

Dans un premier temps, nous conseillons de limiter le cas d’usage à des projets ciblés, soit à des fins d'expérimentation, soit sur des applications spécifiques où le ROI est bien identifié.

Pour les Datacenters centralisés de taille significative, il nous semble prudent d'attendre de réels retours d'expérience et des benchmarks indépendants du marché avant de se lancer dans ce type de solutions.