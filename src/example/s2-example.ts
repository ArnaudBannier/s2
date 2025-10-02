export interface S2Example {
    id: string;
    title: string;
    path: string;
    description?: string;
}

const examples: S2Example[] = [
    {
        id: 'btree',
        title: 'Arbre binaire',
        path: '/s2/src/example/btree.html',
        description: "Animation des parcours préfixe/infixe/suffixe d'un arbre binaire.",
    },
    {
        id: 'basic-anim',
        title: 'Animation simple',
        path: '/s2/src/example/basic-anim.html',
        description: "Animation d'un S2Path et d'un S2Circle.",
    },
    {
        id: 'memory',
        title: 'Etat de la mémoire',
        path: '/s2/src/example/memory.html',
        description: "Animation d'un état de la mémoire (pile et tas) d'un code en C.",
    },
];

export default examples;
