import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main sidebar that shows all sections
  mainSidebar: [
    // Algorithms section
    {
      type: 'category',
      label: 'Algorithms',
      collapsed: false,
      items: [
        'algorithms/intro',
        {
          type: 'category',
          label: 'Sorting Algorithms',
          items: [
            'algorithms/sorting/bubble-sort',
            'algorithms/sorting/selection-sort',
            'algorithms/sorting/insertion-sort',
            'algorithms/sorting/merge-sort',
            'algorithms/sorting/quick-sort',
            'algorithms/sorting/heap-sort',
          ],
        },
        // More categories will be added as content is created
      ],
    },

    // Mathematics section
    {
      type: 'category',
      label: 'Mathematics',
      collapsed: false,
      items: [
        'mathematics/intro',
        {
          type: 'category',
          label: 'Linear Algebra',
          items: [
            'mathematics/linear-algebra/vectors',
            // More linear algebra topics will be added here
          ],
        },
        // More categories will be added as content is created
      ],
    },

    // Distributed Systems section
    {
      type: 'category',
      label: 'Distributed Systems',
      collapsed: false,
      items: [
        'distributed-systems/intro',
        // More categories will be added as content is created
      ],
    },
  ],
};

export default sidebars;
