import { client, groq } from "./sanity";

export interface Post {
  slug: string;
  content: string;
  navLabel?: string;
  navIcon?: string;
  metadata: {
    title: string;
    summary?: string;
    updatedAt: string;
    image?: any;
    order?: number;
    section?: string;
    _type: string;
  };
}

export type SortType = 'order' | 'alphabetical' | 'date' | 'section';

export async function getPages(types: string[] = ["charlink"]): Promise<Post[]> {
  const query = groq`*[(_type in $types)] {
    _type,
    "slug": slug.current,
    section,
    title,
    summary,
    updatedAt,
    image,
    order,
    content,
    navIcon
  }`;

  try {
    const data = await client.fetch(query, { types });
    
    return data.map((page: any) => ({
      slug: page.section ? `${page.section}/${page.slug}` : page.slug,
      content: page.content || '',
      navLabel: page.title || '',
      navIcon: page.navIcon,
      metadata: {
        title: page.title || '',
        summary: page.summary,
        updatedAt: page.updatedAt || '',
        image: page.image,
        order: page.order ?? undefined,
        section: page.section,
        _type: page._type
      }
    }));
  } catch (error) {
    console.error("Error fetching pages from Sanity:", error);
    return [];
  }
}

export function sortPages(pages: Post[], sortType: SortType = 'order'): Post[] {
  if (!pages || pages.length === 0) return [];
  const sortedPages = [...pages];

  switch (sortType) {
    case 'order':
      return sortedPages.sort((a, b) => {
        if (a.metadata.order !== undefined && b.metadata.order !== undefined) {
          return a.metadata.order - b.metadata.order;
        }
        if (a.metadata.order !== undefined) return -1;
        if (b.metadata.order !== undefined) return 1;
        return a.slug.localeCompare(b.slug);
      });
    case 'alphabetical':
      return sortedPages.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
    case 'date':
      return sortedPages.sort((a, b) => new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime());
    case 'section':
      return sortedPages.sort((a, b) => {
        const aSection = a.slug.split('/')[0];
        const bSection = b.slug.split('/')[0];
        if (aSection !== bSection) return aSection.localeCompare(bSection);
        if (a.metadata.order !== undefined && b.metadata.order !== undefined) return a.metadata.order - b.metadata.order;
        return a.metadata.title.localeCompare(b.metadata.title);
      });
    default:
      return sortedPages;
  }
}

export async function getAdjacentPages(currentSlug: string, allowedTypes: string[] = ["charlink"]) {
  try {
    const allPages = await getPages(allowedTypes);
    const sidebarOrderedPages: Post[] = [];
    
    const topLevelPages = allPages.filter(page => !page.slug.includes('/'));
    const sortedTopLevel = topLevelPages.sort((a, b) => {
      if (a.metadata.order !== undefined && b.metadata.order !== undefined) return a.metadata.order - b.metadata.order;
      return a.metadata.title.localeCompare(b.metadata.title);
    });
    sortedTopLevel.forEach(p => sidebarOrderedPages.push(p));
    
    const sectionMap = new Map<string, Post[]>();
    allPages.forEach(page => {
      if (page.slug.includes('/')) {
        const section = page.slug.split('/')[0];
        if (!sectionMap.has(section)) sectionMap.set(section, []);
        sectionMap.get(section)!.push(page);
      }
    });
    
    const sortedSections = Array.from(sectionMap.entries()).sort(([a], [b]) => a.localeCompare(b));
    sortedSections.forEach(([section, pages]) => {
      const folderMap = new Map<string, Post[]>();
      pages.forEach(page => {
        const pathParts = page.slug.split('/');
        const folder = pathParts.length > 2 ? pathParts[1] : '';
        if (!folderMap.has(folder)) folderMap.set(folder, []);
        folderMap.get(folder)!.push(page);
      });
      const sortedFolders = Array.from(folderMap.entries()).sort(([a], [b]) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b)));
      sortedFolders.forEach(([folder, folderPages]) => {
        const sortedP = folderPages.sort((a, b) => {
          if (a.metadata.order !== undefined && b.metadata.order !== undefined) return a.metadata.order - b.metadata.order;
          return a.metadata.title.localeCompare(b.metadata.title);
        });
        sortedP.forEach(p => sidebarOrderedPages.push(p));
      });
    });
    
    const currentIndex = sidebarOrderedPages.findIndex(page => page.slug === currentSlug);
    if (currentIndex === -1) return { prevPage: null, nextPage: null };
    
    let prevPage = currentIndex > 0 ? sidebarOrderedPages[currentIndex - 1] : null;
    let nextPage = currentIndex < sidebarOrderedPages.length - 1 ? sidebarOrderedPages[currentIndex + 1] : null;
    
    return { prevPage, nextPage };
  } catch (error) {
    return { prevPage: null, nextPage: null };
  }
}