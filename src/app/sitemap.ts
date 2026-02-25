import { getPages } from "@/app/utils/utils";
import { baseURL } from "@/resources";

export default async function sitemap() {
  const pages = (await getPages()).map((post) => ({
    url: `${baseURL}/${post.slug}`,
    lastModified: post.metadata.updatedAt,
  }));

  const routes = pages.map((route) => ({
    url: `${baseURL}/${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...pages];
}
