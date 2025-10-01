export interface S2Example {
    id: string;
    title: string;
    path: string;
    description?: string;
}

const examples: S2Example[] = [
    {
        id: 'btree',
        title: 'B-Tree',
        path: '/s2/src/test/btree.html',
        description: "Animation des parcours préfixe/infixe/suffixe d'un arbre binaire.",
    },
    {
        id: 'basic-anim',
        title: 'Basic Animation',
        path: '/s2/src/test/basic-anim.html',
        description: 'Animation de base.',
    },
];

export default examples;
