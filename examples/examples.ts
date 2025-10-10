interface S2Example {
    id: string;
    title: string;
    path: string;
    description?: string;
}

export const examples: S2Example[] = [
    {
        id: 'memory-s01-statements-01',
        title: 'INF1031 Etat de la mémoire : instructions simples 1',
        path: '/s2/examples/memory/s01-statements-01.html',
        description: "Code d'introduction aux instructions en C.",
    },
    {
        id: 'memory-s01-statements-02',
        title: 'INF1031 Etat de la mémoire : instructions simples 2',
        path: '/s2/examples/memory/s01-statements-02.html',
        description: "Code d'introduction aux instructions en C.",
    },
    {
        id: 'btree',
        title: 'INF2031 : Arbre binaire',
        path: '/s2/examples/algorithm/btree.html',
        description: "Parcours préfixe/infixe/suffixe d'un arbre binaire.",
    },
];

export const tests: S2Example[] = [
    {
        id: 'basic-anim',
        title: 'Animation simple',
        path: '/s2/examples/test/basic-anim.html',
        description: "Animation d'un S2Path et d'un S2Circle.",
    },
];
