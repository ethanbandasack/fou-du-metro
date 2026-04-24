# Logique du Mode Intersection

Le mode **Intersection** (ou **Collision**) de Fou du Métro est conçu pour tester la connaissance approfondie du réseau en croisant deux critères géographiques ou techniques.

## Fonctionnement Technique

1.  **Extraction des Critères** : 
    - Le système analyse l'ensemble des stations enrichies (`stations-enriched.csv`).
    - Il génère dynamiquement des catégories basées sur les lignes, les arrondissements, les départements et les types de réseaux.
    
2.  **Calcul de l'Intersection** :
    - Lorsque deux critères sont sélectionnés (ex: Ligne 1 et Paris 4e), le système effectue une intersection d'ensembles :
      `A ∩ B = { station | station ∈ A ET station ∈ B }`
    - Le résultat est la liste des stations cibles.

3.  **Normalisation des Saisies** :
    - Pour faciliter le jeu, les entrées utilisateur sont normalisées :
      - Suppression des accents.
      - Conversion en minuscules.
      - Suppression des espaces et des tirets (`[^a-z0-9]`).
    - Cela permet de valider "Châtelet les Halles" même si l'utilisateur tape "chatelet-les-halles".

## Interface & Esthétique

L'interface suit le langage visuel **METRODOKU** :
- **Typographie** : Monospace (Courier New).
- **Structure** : Sidebar de configuration à gauche, zone d'action à droite.
- **Feedback** : Animations de "shake" en cas d'erreur, mise en évidence des lignes trouvées avec leurs couleurs officielles.

## Suggestions (Autocomplete)

Le mode suggestion peut être activé ou désactivé. Lorsqu'il est actif, il recherche les gares correspondantes dans l'ensemble du pool de stations dès que 2 caractères sont saisis.
