import {usePluginData} from '@docusaurus/useGlobalData';

interface DocMetadata {
  id: string;
  title: string;
  description: string;
  permalink: string;
  lastUpdatedAt?: number;
  frontMatter: {
    description?: string;
    keywords?: string[];
    draft?: boolean;
    reading_time?: number;
    last_update?: {
      date: string;
    };
  };
}

interface DocsPluginData {
  versions: Array<{
    docs: DocMetadata[];
  }>;
}

interface LatestDoc {
  title: string;
  description: string;
  link: string;
  category: string;
  date: string;
  readingTime: number;
}

export function useLatestDocs(count: number = 3): LatestDoc[] {
  try {
    const pluginData = usePluginData('docusaurus-plugin-content-docs') as DocsPluginData;

    if (!pluginData?.versions?.[0]?.docs) {
      return [];
    }

    const allDocs = pluginData.versions[0].docs;

    // Filter out intro pages and get docs with descriptions
    const validDocs = allDocs.filter(doc => {
      const hasDescription = doc.description || doc.frontMatter?.description;
      const isNotIntro = !doc.id.endsWith('/intro') && !doc.id.endsWith('intro');
      const isNotDraft = !doc.frontMatter?.draft;
      return hasDescription && isNotIntro && isNotDraft;
    });

    // Sort by last_update date if available
    const sortedDocs = validDocs.sort((a, b) => {
      const dateA = a.frontMatter?.last_update?.date || '1970-01-01';
      const dateB = b.frontMatter?.last_update?.date || '1970-01-01';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    // Map to our format and take the requested count
    return sortedDocs.slice(0, count).map(doc => {
      // Extract category from the path
      const pathParts = doc.id.split('/');
      const category = pathParts[0]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        title: doc.title,
        description: doc.description || doc.frontMatter?.description || '',
        link: doc.permalink,
        category,
        date: doc.frontMatter?.last_update?.date || '',
        readingTime: doc.frontMatter?.reading_time || 5,
      };
    });
  } catch (error) {
    console.error('Error fetching latest docs:', error);
    return [];
  }
}

// Format reading time for display
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

