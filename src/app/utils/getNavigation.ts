import { client, groq } from "./sanity";

interface NavigationItem {
    slug: string;
    title: string;
    label?: string;
    navLabel?: string;
    navIcon?: string;
    keywords?: string;
    children?: NavigationItem[];
    order?: number;
}

function sortItems(items: NavigationItem[]): NavigationItem[] {
  return items.sort((a, b) => {
    const aIsCategory = !!a.children;
    const bIsCategory = !!b.children;
    
    if (!aIsCategory && bIsCategory) return -1;
    if (aIsCategory && !bIsCategory) return 1;
    
    const aHasOrder = typeof a.order === 'number';
    const bHasOrder = typeof b.order === 'number';
    
    if (aHasOrder && !bHasOrder) return -1;
    if (!aHasOrder && bHasOrder) return 1;
    
    if (aHasOrder && bHasOrder) {
      if (a.order !== b.order) {
        return a.order! - b.order!;
      }
    }
    
    return a.title.localeCompare(b.title);
  });
}

/**
 * Mengambil data dari Sanity dan merekonstruksi struktur folder
 * berdasarkan field 'section' di Sanity.
 * Mendukung multiple types: docs, charlink, templates.
 */
export default async function getNavigation(types: string[] = ["charlink"]): Promise<NavigationItem[]> {
  // Query diubah agar memfilter berdasarkan array types yang diberikan
  const query = groq`*[(_type in $types)] {
    "slug": slug.current,
    section,
    title,
    navLabel,
    navIcon,
    keywords,
    order
  }`;

  try {
    const allPages = await client.fetch(query, { types });
    const rootItems: NavigationItem[] = [];
    const sectionsMap: Record<string, NavigationItem> = {};

    allPages.forEach((page: any) => {
      const item: NavigationItem = {
        slug: page.section ? `${page.section}/${page.slug}` : page.slug,
        title: page.title || page.slug,
        navLabel: page.navLabel,
        navIcon: page.navIcon,
        keywords: page.keywords,
        order: page.order,
      };

      if (!page.section) {
        rootItems.push(item);
      } else {
        if (!sectionsMap[page.section]) {
          sectionsMap[page.section] = {
            slug: page.section,
            title: page.section.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            children: [],
            order: undefined 
          };
          rootItems.push(sectionsMap[page.section]);
        }
        sectionsMap[page.section].children?.push(item);
      }
    });
    
    const finalizeNavigation = (items: NavigationItem[]): NavigationItem[] => {
      const sorted = sortItems(items);
      sorted.forEach(item => {
        if (item.children) {
          item.children = finalizeNavigation(item.children);
        }
      });
      return sorted;
    };

    return finalizeNavigation(rootItems);
  } catch (error) {
    console.error("Error fetching navigation from Sanity:", error);
    return [];
  }
}