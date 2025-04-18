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

Le projet est composé de trois programmes Solana distincts :

### 1. alyra_sign_registry

Programme principal gérant la structure hiérarchique des formations :

1. **Gestion des Registres** :
   - `create_registry` : Création d'un registre avec titre et description
   - Tailles maximales :
     - Titre : 64 octets
     - Description : 256 octets
   - Attributs :
     - Authority (Pubkey)
     - Formation count
     - Student count
     - Created at timestamp

2. **Gestion des Formations** :
   - `create_formation` : Création d'une formation avec titre, description et dates
   - `register_student` : Inscription d'un étudiant à une formation
   - Tailles maximales :
     - Titre : 64 octets
     - Description : 256 octets
     - Email : 64 octets
     - Nom : 32 octets
   - Attributs :
     - Start date / End date
     - Student count
     - Sessions list
     - Created at timestamp

3. **Gestion des Sessions** :
   - `create_session` : Création d'une session avec titre, description et horaires
   - `mark_presence` : Enregistrement de la présence d'un étudiant
   - Attributs :
     - Start time / End time
     - Presences list
     - Created at timestamp

4. **Structures de Données** :
   - `Registry` : Informations sur le registre
   - `Formation` : Détails des formations
   - `Student` : Données des étudiants
   - `Session` : Informations sur les sessions
   - `Presence` : Enregistrement des présences

### 2. alyra_sign_presence

Programme dédié à la gestion des présences et événements :

1. **Gestion des Événements** :
   - `create_event` : Création d'un événement avec titre, description, code et dates
   - `register_attendee` : Inscription d'un participant à un événement
   - Tailles maximales :
     - Titre : 16 octets
     - Description : 32 octets
     - Email : 32 octets
     - Nom : 16 octets
   - Attributs :
     - Event code
     - Start date / End date
     - Attendee count
     - Created at timestamp

2. **Gestion des Sessions** :
   - `create_session` : Création d'une session avec titre, description et horaires
   - `mark_presence` : Enregistrement de la présence d'un étudiant
   - `create_clockin` : Pointage des participants à une session

3. **Structures de Données** :
   - `Event` : Informations sur l'événement
   - `Attendee` : Données des participants
   - `Session` : Détails des sessions
   - `Presence` : Enregistrement des présences
   - `Clockin` : Pointage des participants

### 3. alyra_sign

Programme de signature numérique et gestion des formations :

1. **Gestion des Formations** :
   - `create_formation` : Création d'une formation avec titre, description et dates
   - `add_student_to_formation` : Ajout d'un étudiant à une formation
   - Tailles maximales :
     - Titre : 32 octets
     - Description : 64 octets
     - Email : 32 octets
     - Nom : 16 octets
   - Attributs :
     - Start date / End date
     - Student count
     - Session count
     - Created at timestamp

2. **Gestion des Sessions** :
   - `create_session` : Création d'une session avec titre, description et horaires
   - `mark_presence` : Enregistrement de la présence d'un étudiant
   - Attributs :
     - Start time / End time
     - Created at timestamp

3. **Structures de Données** :
   - `Formation` : Informations sur la formation
   - `Student` : Données des étudiants
   - `Session` : Détails des sessions
   - `Presence` : Enregistrement des présences

### Caractéristiques Communes

- Utilisation d'Anchor Framework (v0.27.0)
- Compatible avec Solana v1.18.2
- Gestion des erreurs via `ErrorCode` enum
- Utilisation de seeds pour la dérivation des PDAs
- Validation des données d'entrée
- Timestamps automatiques pour la création des comptes
- Gestion des compteurs (formation_count, student_count, etc.)
- Vérification des autorités pour les opérations sensibles

## Authors

* Yannick Jesson

* Mickaël Girondeau

* Gabriel Forestier


### Dependencies

```
solana-cli : 1.18.2
anchor-cli : 0.27.0
nvm : 0.39.3
node : v23.10.0
avm : 0.31.0
rustc : 1.72.0
cargo : 1.72.0
```



