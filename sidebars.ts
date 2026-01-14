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
      collapsed: true,
      items: [
        'algorithms/intro',
        // {
        //   type: 'category',
        //   label: 'Sorting Algorithms',
        //   items: [
        //     'algorithms/sorting/bubble-sort',
        //     'algorithms/sorting/selection-sort',
        //     'algorithms/sorting/insertion-sort',
        //     'algorithms/sorting/merge-sort',
        //     'algorithms/sorting/quick-sort',
        //     'algorithms/sorting/heap-sort',
        //   ],
        // },
        {
          type: 'category',
          label: 'Tree Algorithms',
          items: [
            'algorithms/tree/mst',
          ],
        },
      ],
    },

    // Mathematics section
    {
      type: 'category',
      label: 'Mathematics',
      collapsed: true,
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
      collapsed: true,
      items: [
        'distributed-systems/intro',
        {
          type: 'category',
          label: 'Replication',
          items: [
            'distributed-systems/replication/wal',
            'distributed-systems/replication/segmented-log',
            'distributed-systems/replication/low-water-mark',
          ],
        },
      ],
    },

      // Storage Systems section
    {
      type: 'category',
      label: 'Storage Systems',
      collapsed: true,
      items: [
        'storage-systems/intro',
        'storage-systems/slotted-page',
        'storage-systems/byte-ordering-endianness',
      ],
    },
  ],
};

export default sidebars;
