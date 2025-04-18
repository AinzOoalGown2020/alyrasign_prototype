# Frontend d'une Application de Gestion de Formations sur Solana

## Design et ergonomie :
- UI claire, minimaliste, et design system moderne.
- Utilisation cohérente des couleurs pour distinguer les actions
- Mises en page en cartes/blocs et contours doux.
- Interface responsive avec structure en colonnes.

## En-tête (Navbar)

- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.

- Menu de navigation (Les menus seront visibles suivant le role de connexion)
	-- Portail Étudiant (role Etudiant)
	-- Portail Étudiant (role Formateur)
	-- Gestion des Formations (role Formateur)
		--- Sous page : Gestion des Formations (role Formateur)
		--- Sous page : Gestion des Sessions (role Formateur)
	-- Gestion des Étudiant (role Formateur)
	-- Administration (role Formateur)

- Bouton de connexion au wallet (à droite)
	-- Pas de redirection apres connexion, on reste sur la page Acceuil

- Acces Developpeur 
	-- L'adresse du Wallet "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy" sera ecrite dans le code (comme "formateur" afin d'avoir tous les acces sans token)

## Page d'Accueil (`/home`) 

- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Bouton "Select Wallet" est placé à droite, suggérant la connexion a un wallet avec reconnaissance des wallet existants (exemple : Phantom/Solflare/...)

- Section Principale (Main Section) 
	-- Bouton "Select Wallet" est placé au milieu, suggérant la connexion a un wallet avec reconnaissance des wallet existants (exemple : Phantom/Solflare/...)
	-- Un message de bienvenue centré, "Bienvenue sur AlyraSign", en texte gras pour mettre l'accent.
	-- Une description sous le message principal : "Application de gestion des présences pour les étudiants", explicitant la fonction principale de l'application.

- Pied de page (Footer) :
	-- Un texte d'invitation à la connexion : "Connectez-vous pour accéder à votre espace".
	
- Action du Bouton de connexion au wallet
	-- Pas de redirection apres connexion, on reste sur la page Acceuil

- Acces Developpeur 
	-- L'adresse du Wallet "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy" sera ecrite dans le code (comme "formateur" afin d'avoir tous les acces sans token)


## Page "Administration" (`/admin/ajouts`)
- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Menu à gauche : Accueil / Gestion des Formations / Gestion des Étudiant / Administration (sélectionné)
	-- Bouton "Select Wallet" est placé à droite, est deja connecté (via le Bouton "Select Wallet" de la Page d'Accueil) et affiche l'adresse tonquée du wallet avec un dropdown (Changer de Wallet / Deconnection)
	
- Section Principale (Main Section) 
	-- Titre : Gestion des authorisations
	-- Roles predefinis (dans le code)
		--- Role Formateur (acces fonctionnalités formateur)
		--- Role Etudiant (acces fonctionnalités etudiant)
	-- Strucure (contener) d'authorisation
		--- Champs pour inserer une adresse wallet
		--- Dropdown pour choisir le role Formateur / Etudiant
		--- Bouton de validation et envoi sur la blockchain
		--- message d'information de validation 

## Page "Gestion des Étudiants" (`/admin/etudiants`) :
- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Menu à gauche : Accueil / Gestion des Formations / Gestion des Étudiant (sélectionné) / Administration 
	-- Bouton "Select Wallet" est placé à droite, est deja connecté (via le Bouton "Select Wallet" de la Page d'Accueil) et affiche l'adresse tonquée du wallet avec un dropdown (Changer de Wallet / Deconnection)

- Section Principale (Main Section) 
	-- Titre : "Gestion des authorisations"
	-- Roles predefinis (dans le code)
		--- Role Formateur (acces fonctionnalités formateur)
		--- Role Etudiant (acces fonctionnalités etudiant)
	-- Strucure (contener) d'historique
		--- Bouton pour recuperation de la blockchain
		--- Liste des adresse authorisées et acceptées + roles associés
		--- bouton "modifier role" (fais apparaitre le bouton "synchroniser sur la blockchain")
		--- bouton "supprimer" (demande confirmation de la suppression et si oui synchronise sur la blockchain)

## Page "Gestion des Formations" (`/admin/formations`) 
- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Menu à gauche : Accueil / Gestion des Formations (sélectionné) / Gestion des Étudiant / Administration 
	-- Bouton "Select Wallet" est placé à droite, est deja connecté (via le Bouton "Select Wallet" de la Page d'Accueil) et affiche l'adresse tonquée du wallet avec un dropdown (Changer de Wallet / Deconnection)

- Section Principale (Main Section) 
	-- A gauche, Titre "Gestion des Formations"
	-- A droite, 2 boutons :
		--- Bouton violet "Synchroniser avec la Blockchain" - action qui recupere toutes les formations (+ sessions) valides de la blockchain
		--- Bouton bleu "Créer une Formation" - action qui active une fenetre modale de Creation d'une formation
	-- Au mileu, Présentation sous forme de cartes alignées horizontalement, avec disposition en grille (flex ou grid).

 ### Zone de cartes de formations (`/admin/formations`)
	- Présentation sous forme de cartes alignées horizontalement, avec disposition en grille (flex ou grid).

	- Chaque carte de formation contient :
		-- Titre de la formation (texte en gras, en haut) 
		-- Description courte
		-- Dates : début et fin de la formation, format JJ-MM-AAAA
		-- Nombre de sessions : affiché sous forme de compteur (ex. Sessions: 0)
		-- link "Voir sur Solana Explorer" : permet d'ouvrir un nouvel onglet avec l'adresse du wallet 
		-- Texte "Derniere synchronisation : {date+time}. Info visible uniquement si la formation a deja été synchronisée sur la blockchain
		-- Bouton vert : "Gérer les Sessions" - action de navigation vers une page de gestion de sessions associées
		-- Bouton orange/jaune : "Modifier" - action de modification de la carte formation
		-- Bouton rouge : "Supprimer" - action de suppression de la carte formation (tag "deleted")
		-- Bouton violet : "Synchroniser" - visible uniquement si la carte de formation vient d'etre crée ou modifiée ou qu'une session à été crée ou modifiée dans cette carte formation

	- Les cartes sont :
		-- Stylisées avec des bords arrondis
		-- Ombres portées légères pour un effet de profondeur
		-- Séparées par des marges/paddings clairs pour une bonne lisibilité

	- Creation d'une formation (modale)
		-- Titre "Créer une Nouvelle Formation"
		-- Description + champs texte
		-- Date de début au format JJ-MM-AAAA (Sélecteur de date permettant de choisir une nouvelle date avec un calendrier interactif)
		-- Date de fin au format JJ-MM-AAAA (Sélecteur de date permettant de choisir une nouvelle date avec un calendrier interactif)
		-- Bouton blanc "Annuler"
		-- Bouton bleu "Créer"
			--- Action du bouton "créer", affichage de la carte formation avec un bouton "Synchroniser" (local avant envoi sur la blockchain)

## Page "Gestion des Sessions" (`/admin/sessions`) 
- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Menu à gauche : Accueil / Gestion des Formations (sélectionné) / Gestion des Étudiant / Administration 
	-- Bouton "Select Wallet" est placé à droite, est deja connecté (via le Bouton "Select Wallet" de la Page d'Accueil) et affiche l'adresse tonquée du wallet avec un dropdown (Changer de Wallet / Deconnection)

- Section Principale (Main Section) via le bouton "Gérer les Sessions" de la carte formation
	- en bleu, une fleche vers la gauche + "Retour aux formations" - action (fil d'ariane) de retour sur la page des formations
		--> Bouton violet : "Synchroniser" - visible uniquement sur la carte de formation si une session à été crée ou modifiée
	- Titre a gauche, "Sessions de la formation"
	- Texte a gauche : nom de la formation + Dates de la formation (Du xx-xx-xxxx au xx-xx-xxxx) choisie
	-- A droite, 2 boutons :
		--- Bouton violet "Synchroniser avec la Blockchain" - action qui recupere toutes les formations (+ sessions) valides de la blockchain
		--- Bouton bleu "Créer une Formation" - action qui active une fenetre modale de Creation d'une session
	-- Au mileu, Présentation sous forme de cartes alignées horizontalement, avec disposition en grille (flex ou grid).

 ### Zone de cartes de sessions (`/admin/sessions`) via le bouton "Gérer les Sessions" de la carte formation
	- Présentation sous forme de cartes alignées horizontalement, avec disposition en grille (flex ou grid).

	- Chaque carte de sessions contient :
		-- Titre de la session (texte en gras, en haut) 
		-- Dates de la session, format JJ-MM-AAAA 
		-- Heure de debut, format HH:MM
		-- Heure de fin, format HH:MM
		-- Bouton vert : "Gérer les Presences" - action de navigation vers une page de gestion des presences de la session
		-- Bouton orange/jaune : "Modifier" - action de modification de la carte session
		-- Bouton rouge : "Supprimer" - action de suppression de la carte session (tag "deleted")

	- Les cartes sont :
		-- Stylisées avec des bords arrondis
		-- Ombres portées légères pour un effet de profondeur
		-- Séparées par des marges/paddings clairs pour une bonne lisibilité

	- Creation d'une formation (modale)
		-- Titre de la formation (texte en gras, en haut) : "Creer une Nouvelle Session"
		-- Encadré bleu clair avec texte bleu foncé : "Periode de la formation" + Date "Du xx-xx-xxxx au xx-xx-xxxx"
			--- Les dates sont automatiquement recupérées sur la formation parent
		-- Description courte
		-- Dates de la formation, format JJ-MM-AAAA 
			--- Sélecteur de date permettant de choisir une nouvelle date avec un calendrier interactif
			--- Dans le calendrier interactif, seules les dates de la formation parent seront actives, les autres dates seront grisées et desactivées (non cliquable)
		-- Heure de debut, format HH:MM
		-- Heure de fin, format HH:MM
		-- Bouton blanc "Annuler"
		-- Bouton bleu "Créer"


## Page "Portail Étudiant" (`/etudiants/portail`) :
- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Menu à gauche : Accueil / Portail Étudiant (sélectionné)
	-- Bouton "Select Wallet" est placé à droite, est deja connecté (via le Bouton "Select Wallet" de la Page d'Accueil) et affiche l'adresse tonquée du wallet avec un dropdown (Changer de Wallet / Deconnection)

- Section Principale (Main Section)  (`/etudiants/formations`) : par defaut
	-- Titre de la Section : "Mes Formations"
		--- Mis en avant de la prochaine session
		--- Liste des formations associées à l'etudiant connecté

====

# Architecture d'une Application de Gestion de Formations sur Solana

## Introduction
Application de gestion de formations et de sessions sur la blockchain Solana. L'application permet aux formateurs de créer et gérer des formations, et aux étudiants de s'inscrire aux sessions et de signer leur présence. Toutes les données sont stockées de manière sécurisée et immuable sur Solana.

## Structure des Données

### Types de Comptes
- **Compte de Stockage des Formations** : Contient toutes les formations avec leurs métadonnées (nom, description, dates, statut, etc.).
- **Compte de Stockage des Sessions** : Contient toutes les sessions, liées aux formations par des IDs, avec leurs métadonnées.
- **Index des Formations/Sessions Actives** : Liste les IDs des formations et sessions actives pour une récupération rapide.
- **Compte de stockage des étudiants** : Pour la gestion des etudiants importés dans la section « Gestion des Étudiants »

## Gestion des Accès et Authentification

### Système de Tokens
- **Token Formateur** : Accès complet à toutes les fonctionnalités.
- **Token Étudiant** : Permet de consulter les formations/sessions deja associés par les formateurs
- **Mise à jour des droits** : Modification des droits associés à chaque type de token via des contrats intelligents.

### Processus d'Authentification
1. **Connexion** : L'utilisateur se connecte avec son portefeuille Solana.
2. **Vérification** : Vérification des tokens associés à l'adresse du portefeuille.
3. **Attribution des droits** : Accès aux fonctionnalités en fonction des tokens détenus.

====

# Creer un fichier ".env.memo" pour rappel des variables importantes :

## Configuration Solana
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_PROGRAM_ID="your_program_id_here"

## Contrôle de l'utilisation de la blockchain vs simulation
## Mettre à "true" pour utiliser réellement la blockchain, "false" pour utiliser le localStorage (simulation)
NEXT_PUBLIC_USE_BLOCKCHAIN="true"

## Wallet admin prédéfini
NEXT_PUBLIC_ADMIN_WALLET=79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy

====

# Dépendances de base

solana-cli 2.1.16 (Agave)
anchor-cli 0.30.1 (@coral-xyz)
nvm 0.39.3
node 23.10.0
avm 0.31.0
rustc 1.85.0
cargo 1.85.0


