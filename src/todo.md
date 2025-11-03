# TODO

- Revoir le local bbox
    - Elle utilise la position du parent alors qu'elle dépend de sa position x,y du svg qui n'est pas la même de pas forcément à jour.

- Mouvement de caméra ou modification d'un espace :
    - Lorsqu'un espace s est dirty, la scène parcourt tous les éléments et indique la modification de l'espace s.
    - Les données ont une fonction pour se marquer dirty si leur espace vaut s
    - L'espace vue met tous les objets en dirty (mais pas les données, à vérifier)
    - Le prochain update met à jour tous les éléments qu'il faut

- Possibilité d'ajouter des labels sur un edge (qui devient un groupe)
- Tracer une fonction
- stroke-dasharray : faut-il définir un nouveau type de données (principalement pour setParent avec un space global) ?
- SpacialCurve = PolyCurve et space dans un nouveau type de données
- Gradients

# Améliorations

- S2RichNode à corriger (en commentaire pour l'instant).
- S2SceneObject comme nouvelle classe de base de S2Element ?
    - Possibilité de définir une position simple comme point pour un edge
- Ajouter des descriptions/titres sur les éléments
- Manhattan edge

# Réflexions

- Réflechir aux S2Group (pour les data)
- Etat de la mémoire :
    - Valeur de variables dans un rectangle au dessus qui apparait lors d'une animation ou si possible avec la souris
    - Possibilté d'afficher tous le code avec un bouton
- S2SVG contient des fonctionnalités supplémentaires, comme ajouter des styles

# Tests

Pour vérifier les allocations mémoires

// cycle.ts
class A {
ref?: B;
constructor(public name: string) { }
finalize() { console.log(`${this.name} est détruit`); }
}

class B {
ref?: A;
constructor(public name: string) { }
finalize() { console.log(`${this.name} est détruit`); }
}

// Création du cycle
let a: A | null = new A("A1");
let b: B | null = new B("B1");

a.ref = b;
b.ref = a;

// Plus aucune référence depuis le code principal
a = null;
b = null;

// Demande de GC (Node.js avec --expose-gc)
if (global.gc) {
console.log("Appel du garbage collector...");
global.gc();
} else {
console.log("Lancer Node avec --expose-gc pour tester le GC");
}

const registry = new FinalizationRegistry((name) => {
console.log(`${name} a été garbage collecté`);
});

let a2: A | null = new A("A2");
let b2: B | null = new B("B2");
a2.ref = b2;
b2.ref = a2;

registry.register(a2, a2.name);
registry.register(b2, b2.name);

a2 = null;
b2 = null;

if (global.gc) {
console.log("Appel du garbage collector...");
global.gc();
} else {
console.log("Lancer Node avec --expose-gc pour tester le GC");
}
