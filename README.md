# AlyraSign

AlyraSign est un projet d'étude réalisé dans le cadre d'une formation dispensée par Alyra.


## Description

AlyraSign a pour objectif d'enregistrer la présence de participants à des évènements, en utilisant la blockchain Solana.
Les exemples sont nombreux : étudiants assistant à des formations, actionnaires lors d'une assemblée générale, etc.

A chaque évènement sont reliés :
* des participants autorisés
* une ou plusieurs sessions qui ont lieu à différentes dates

Les participants doivent pouvoir signer numériquement la feuille de présence lors d'une session.

## Structure

Le programme `alyra_sign_presence` gère la présence et les événements avec plusieurs fonctionnalités principales :

1. **Gestion des Sessions** :
   - `create_session` : Création d'une session avec titre, description, et horaires
   - `mark_presence` : Enregistrement de la présence d'un étudiant à une session

2. **Gestion des Événements** :
   - `create_event` : Création d'un événement avec titre, description, code, et dates
   - `register_attendee` : Inscription d'un participant à un événement
   - `create_clockin` : Enregistrement de la présence d'un participant à une session

3. **Structures de Données** :
   - Tailles maximales définies pour les champs :
     - Titre : 16 octets
     - Description : 32 octets
     - Email : 32 octets
     - Nom : 16 octets

4. **Comptes (Accounts)** :
   - `Event` : Informations sur l'événement
   - `Attendee` : Informations sur les participants
   - `Session` : Détails des sessions
   - `Presence` : Enregistrement des présences
   - `Clockin` : Pointage des participants

Le programme `alyra_sign_registry` est structuré de manière similaire à `alyra_sign_presence`, mais avec quelques différences clés :

1. **Tailles maximales plus petites** :
   - Titre : 8 octets (vs 16 dans presence)
   - Description : 16 octets (vs 32 dans presence)
   - Email : 16 octets (vs 32 dans presence)
   - Nom : 8 octets (vs 16 dans presence)

2. **Fonctionnalités principales** :
   - `create_registry` : Création d'un registre avec titre et description
   - `create_formation` : Création d'une formation liée à un registre
   - `register_student` : Inscription d'un étudiant à une formation
   - `create_session` : Création d'une session de formation
   - `mark_presence` : Marquage de la présence d'un étudiant

3. **Structures de données** :
   - `Registry` : Gestion des registres
   - `Formation` : Informations sur les formations
   - `Student` : Données des étudiants
   - `Session` : Détails des sessions
   - `Presence` : Enregistrement des présences

4. **Gestion des erreurs** :
   - `ErrorCode` enum pour gérer les erreurs de validation des champs

Les deux programmes sont complémentaires :
- `alyra_sign_registry` gère la structure hiérarchique (registre → formation → étudiant)
- `alyra_sign_presence` se concentre sur la gestion des événements et des présences


### Dependencies

```
solana --version
solana-cli 2.1.16 (src:5002c630; feat:3271415109, client:Agave)
```

```
anchor --version
anchor-cli 0.30.1 (@coral-xyz)
```

```
nvm --version
0.39.3
```

```
node --version
v23.10.0
```

```
avm --version
avm 0.31.0
```

```
rustc --version
rustc 1.85.0 (4d91de4e4 2025-02-17)
```

```
cargo --version
cargo 1.85.0 (d73d2caf9 2024-12-31)
```

## Authors

* Yannick Jesson

* Mickaël Girondeau

* Gabriel Forestier

## Version History

* 0.1
    * Initial Release

* 0.2
    * Erreur recurente et correction des problèmes de compatibilité avec la dépendance ahash (à corriger)



