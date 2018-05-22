---
layout: default
author: MDY
title:  Infrastructure hyperconvergée
date:   2018-05-22 06:00:00
image: /assets/css/images/blog/couchbasesync.jpg
categories: main
description: "Complexité de synchronisation de documents Couchbase Mobile 1.4 : pourquoi upgrader vers la V1.5?"
---
# La synchronisation des documents Couchbase Mobile avec la Sync Gateway V1.4 et son évolution en V1.5
## Introduction
La synchronisation des données d'une base Couchbase Mobile vers une base Couchbase centrale est un mécanisme simple à mettre en place, au moyen de la sync gateway, mais complexe à appréhendre du fait des mécanismes sous-jacents et de leur implantation dans l'architecture Couchbase.

Ce document cite et réordonne des informations présentées sur le site [Couchbase](https://developer.couchbase.com/). Il apporte une vue synthétique sur les mécanismes de synchronisation de Couchbase Mobile et permet de mieux comprendre certains comportements inattendus qui peuvent surprendre le développeur d'applications mobiles s'appuyant sur Couchbase Sync Gateway, des champs ajoutés, la présence apparente de doublons dans les bases, etc...<!--break-->

## Champs spécifiques à la gestion des révisions 
Les documents comportent des champs précédés par un \"\_\". Ces champs sont des champs techniques réservés pour le bon fonctionnement de la SyncGateway. Ces champs sont utilisés pour gérer les révisions et construire l'arbre de révision : 

> properties with a leading underscore (_ is the character to denote properties reserved for Couchbase) are kept to construct the revision tree.


## Le champ \_rev
Pour le bon fonctionnement du système, tout document doit comporter un numéro de révision :

> Every document has a special field called \_rev that contains the revision ID. The revision ID is assigned automatically each time the document is saved. Every time a document is updated, it gets a different and unique revision ID.

Le champ révision est utilisé pour permettre la synchronisation des données. Il ne doit en aucun cas être utilisé pour mettre en place une gestion de version (qui permettrait de revenir en arrière sur des modifications réalisées, etc...) :

> Keep in mind that Couchbase Lite is not a version control system and you must not use the versioning feature in your application. They’re there only to help with concurrency and resolving conflicts during replication.

**La valeur du champ révision doit cependant être correctement gérée dans l'application client pour assurer le bon fonctionnement du système :**

> When you save an update to an existing document, you must include its current revision ID. If the revision ID you provide isn’t the current one, the update is rejected. When this happens, it means some other endpoint snuck in and updated the document before you. You need to fetch the new version, reconcile any changes, incorporate the newer revision ID, and try again.

Dans le cas contraire, des problèmes de fonctionnement de l'application risque d'être rencontrés.


## Les mécanismes fonctionnant en tâche de fond de la synchronisation

Couchbase fait appel à plusieurs mécanismes pour assurer la synchronisation : 

- Arbre de synchronisation 
- Résolution de conflit
- Pruning
- Compaction
- Tombstone

La sync_gateway maintient un arbre de synchronisation des données sur la base des numéros de révision. Chaque numéro de révision comporte un premier chiffre indiquant le niveau de la révision (profondeur), un \- , et un hash identifiant de manière unique la révision. Le hash est calculé à partir du contenu du document. Ceci signifie que deux documents dont le contenu est identique auront le même hash, et que le hash peut être indifféremment calculé par le client ou la sync gateway.

La profondeur maximum de suivi des révisions est un paramètre défini dans l'application. 

Deux révisions se trouvant à la même profondeur et associées à des hash différents sont en conflit. Plusieurs stratégies sont disponibles pour résoudre ce type de conflit. Ces stratégies sont expliquées dans la documentation. **Pour qu'une application fonctionne correctement de manière maîtrisée, la gestion de conflit doit impérativement être implémentée au niveau du mécanisme de synchronisation.**

Les mécanismes de Compaction, Tombstone et Pruning fonctionnent ensuite en tâche de fond pour faire le ménage dans les données de synchronisation et maintenir la performance de l'application. 

Le mécanisme de Tombstone permet de marque des branches comme supprimées en utilisant le champ \_deleted. A noter que ce même mécanisme est utilisé pour indiquer des documents comme supprimés dans les buckets sur le serveur Couchbase.

Ce mécanisme est utilisé pour garder un historique des révisions supprimées afin de pouvoir résoudre des conflits éventuels : 

> The reason that tombstone revisions exist is so that deletes can be sync'd to other databases. If revisions were simply deleted with a naive approach, then there would be no easy way to sync up with other databases that contained the revision.

> There is a special field in a revision's JSON called \_deleted which determines whether the revision is a tombstone revision or not. A consequence of this fact is that tombstone revisions can hold arbitrary amounts of metadata, which can be useful for an application. If the full metadata of the document is preserved in the tombstone revision, then a document could easily be restored to it's last known good state after it's been deleted at some point.

Les deux autres mécanismes suppriment les données qui ne sont plus utiles à la gestion de révision. Le pruning supprime toutes les révisions au delà de la profondeur maximale de révision. La compaction supprime le contenu des champs des révisions antérieures à la dernière révision validée.

> Compaction is defined as the process of purging the JSON bodies of non-leaf revisions. As shown on the diagram below, only properties with a leading underscore (\_ is the character to denote properties reserved for Couchbase) are kept to construct the revision tree.

Le fonctionnement de la synchronisation est détaillé dans les documents suivants :

- [API Couchbase-lite](https://developer.couchbase.com/documentation/mobile/1.4/guides/couchbase-lite/native-api/revision/index.html)
- [Résolution de conflits dans Couchabase mobile](https://developer.couchbase.com/documentation/mobile/1.4/training/develop/adding-synchronization/index.html#resolve-conflicts )
- [Billet blog sur la résolution de conflits](https://blog.couchbase.com/conflict-resolution-couchbase-mobile/)

## Accès aux documents
Le bucket sur le serveur couchbase, rattaché à l'application mobile via la syn_gateway, comporte donc à la fois des données métier liées à l'application et des données techniques (champs précédés d'un \_ ) liés à la gestion de la synchronisation des données. Jusqu'à la version 1.4 incluse de la sync gateway, il est déconseillé d'accéder directement au bucket central et il est recommandé d'y accéder via l'un des deux mécanismes suivants :

- En REST sur la Sync_Gateway : la sync gateway fournit une API REST qui permet de consulter les données du bucket central. Les spécifications de cet API sont disponibles [ici](https://developer.couchbase.com/documentation/mobile/1.4/references/sync-gateway/index.html).
- En passant par la base couchbase lite locale, et en écrivant et en lisant les données depuis le client mobile  selon [la méthode décrite ici](https://developer.couchbase.com/documentation/mobile/1.4/references/couchbase-lite/index.html)

Par la première méthode, on accède aux données en central indépendamment des éventuelles modifications en cours sur les clients mobiles travaillant éventuellement en mode déconnecté au moment de la lecture / écriture des données centrales.

Par la deuxième méthode, on accède aux données stockées surs le client mobile, dans la base SQLLite, indépendamment des éventuelles modifications éventuellement remontées sur le serveur central par d'autres clients mobiles, qui ne seraient pas encore redescendus sur le client mobile considéré, si ce dernier est déconnecté de la sync_gateway au moment de l'accès aux données.

Comme précisé dans le documentation Couchbase : 

> The app's job is to make the UI reflect what's in the local database, and to reflect user actions by making changes to local documents. If it does that, replication will Just Work without much extra effort.

En claire, les modifications depuis le client doivent être réalisées dans la base locale sans (trop) se préoccuper de la synchronisation qui jouent en arrière-plan.

## Structure des documents
En synhsèse, comme précisé dans la documentation Couchbase, un document comporte les champs suivants: 
> - A document ID
> - A current revision ID (which changes every time the document is updated)
> - A history of past revision IDs (usually linear, but will form a branching tree if the document has or has had conflicts)
> - A body in the form of a JSON object, i.e. a set of key/value pairs
> - Zero or more named binary attachments


# Expiration d'un document
Il s'agit d'un mécanisme géré en local, qui permet de supprimer, sur la base Lite, les documents qui sont anciens et n'ont plus d'utilité en local. 

Deux solutions sont possibles pour faire appel à ce mécanisme :

- Utiliser la méthode ExpireAfter pour définir un temps minimum au-delà le document est expiré et sera supprimé de la base locale
- Utiliser la méthode Purge pour supprimer un document de la base locale

Dans les deux cas, le document est maintenu en central avec un numéro de révision, etc... comme le stipule clairement [la documentation Couchbase Lite](https://github.com/couchbase/couchbase-lite-ios/wiki/Document-Expiration) :

> Note: As with the existing explicit purge mechanism, this applies only to the local database; it has nothing to do with replication. The expiration time is not propagated when the document is replicated. The purge of the document does not cause it to be deleted on any other database. If the document is later updated on a remote database that the local database pulls from, the new revision will be pulled and the document will reappear.

## Pourquoi cette méthode génère-t-elle apparemment des doublons ?
Une fois le document expiré en local et supprimé, si l'on souhaite recréer un document avec le même identifiant sur la base locale, la méthode GetDocument(docId) retourne null, puisqu'elle ne trouve pas le document en local (voir remarque au paragraphe précédent).

On construit un nouveau document avec le même ID mais un numéro de révision à 0 qui rentre en conflit avec le document existant en central lors de la prochaine synchronisation. Si la résolution de conflit n'est pas prévu au niveau de l'application, le conflit est alors résolu en appliquant la stratégie de résolution par défaut.

Cette stratégie par défaut est expliquée dans [ce document](https://blog.couchbase.com/conflict-resolution-couchbase-mobile/)

Enfin, le problème de la gestion des documents purgés est mentionné [ici](https://stackoverflow.com/questions/34405150/purging-documents-in-couchbase-lite).

# Les apports de la version 1.5 de la sync gateway
La complexité et les restrictions liées au shadow bucket, le mélange des données de synchronisation et des données techniques, et l'impossibilité d'écrire directement sur la base centrale sans passer par l'API REST de la Sync_Gateway sont des contraintes lourdes de Couchbase de Couchbase Mobile dans les version < 1.5.

La version 1.5 apporte des modifications significatives sur ces points et notamment :

- Possibilité d'écrire directement dans le bucket central
- Meilleure séparation des données de synchronisation.

Ces améliorations sont expliquées dans [le document ci-après](https://blog.couchbase.com/announcing-couchbase-mobile-1-5/).






