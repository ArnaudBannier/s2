# TODO

- Améliorer les timelines pour appliquer uniquement les changements depuis le dernier elapsed
    - Très important pour les performances et le markDirty
- Possibilité d'ajouter des labels sur un edge (qui devient un groupe)
- Tracer une fonction
- Ajouter un système d'event au S2Element
- Coder une interaction avec la souris dans le monde
- Interpolation de Mat2x3
- Définir un marker perso qui vient s'ajouter et s'adapter à un S2Edge
    - Il n'est pas défini en global mais créé pour chaque path
- stroke-dasharray : faut-il définir un nouveau type de données (principalement pour setParent avec un space global) ?
- PolyCurve et space à fusionner dans un nouveau type de données ?
- Gradients

# Améliorations

- Ajouter des descriptions/titres sur les éléments
- setCycleDuration qui n'est pas valide sur une timeline pour l'instant
- S2SVG contient des fonctionnalités supplémentaires, comme ajouter des styles

# Réflexions

- Réflechir aux groupes (pour les data)
- Créer deux catégories pour les animations -> timeAnim eventAnim ?
- Comment gérer les smoothDamped ?
- S2AnimationGroup ?
- Valeur de variables dans un rectangle au dessus qui apparait lors d'une animation ou si possible avec la souris.
- Possibilité d'écrire les valeurs dans le texte d'information.

# Tests

- isActive à tester.
