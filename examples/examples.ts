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
        id: 'memory-s01-conditionals-01',
        title: 'INF1031 Etat de la mémoire : conditionnelles',
        path: '/s2/examples/memory/s01-conditionals-01.html',
        description: 'Code en C avec des instructions conditionnelles.',
    },
    {
        id: 'memory-s01-function-01',
        title: 'INF1031 Etat de la mémoire : les fonctions',
        path: '/s2/examples/memory/s01-functions-01.html',
        description: 'Code en C avec des fonctions.',
    },
    {
        id: 'btree',
        title: 'INF2031 : Arbre binaire',
        path: '/s2/examples/algorithm/btree.html',
        description: "Parcours préfixe/infixe/suffixe d'un arbre binaire.",
    },
    {
        id: 'graph-s04-dijkstra',
        title: 'INF2031 : Dijkstra',
        path: '/s2/examples/algorithm/s04-graph-dijkstra.html',
        description: 'Algorithme de Dijkstra pour les plus courts chemins dans un graphe.',
    },
    {
        id: 'graph-s04-search',
        title: 'INF2031 : Parcours de graphes',
        //path: '/s2/examples/algorithm/s04-graph-search.html',
        path: '/s2/examples/algorithm/s04-graph-search/graph-search-index.html',
        description: 'Algorithme de parcours de graphes.',
    },
    {
        id: 'linear-algebra-s03-eigenvector-01',
        title: 'MAT2051 : Vecteurs propres',
        path: '/s2/examples/linear-algebra/s03-eigenvectors-01.html',
        description: 'Introduction aux vecteurs propres et valeurs propres.',
    },
];

export const tests: S2Example[] = [
    {
        id: 'basic-anim',
        title: 'Animation simple',
        path: '/s2/examples/test/basic-anim.html',
        description: "Animation d'un S2Path et d'un S2Circle.",
    },
    {
        id: 'algebra',
        title: "Test d'algèbre",
        path: '/s2/examples/test/algebra.html',
        description: "Test d'algèbre sur les fonctions.",
    },
    {
        id: 'space',
        title: "Test d'espaces",
        path: '/s2/examples/test/space.html',
        description: "Test de changement d'espaces.",
    },
    {
        id: 'sdf',
        title: 'Test de SDF',
        path: '/s2/examples/test/sdf.html',
        description: 'Test de Signed Distance Function.',
    },
    {
        id: 'draggable',
        title: 'Test de draggable',
        path: '/s2/examples/test/draggable.html',
        description: 'Test de draggable avec un graphe.',
    },
];
