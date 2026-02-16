import { Flex, Meta, Schema } from "@once-ui-system/core";
import View from "@/product/showcase/View";
import { baseURL, meta, schema } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: meta.showcase.title,
    description: meta.showcase.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(meta.showcase.title)}&description=${encodeURIComponent(meta.showcase.description)}`,
    path: meta.showcase.path,
  });
}

export default function Showcase() {
  return (
    <Flex maxWidth="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={meta.showcase.title}
        description={meta.showcase.description}
        path={meta.showcase.path}
        image={`/api/og/generate?title=${encodeURIComponent(meta.showcase.title)}&description=${encodeURIComponent(meta.showcase.description)}`}
        author={{
          name: schema.name,
          url: `${baseURL}${meta.showcase.path}`,
          image: `${baseURL}${schema.avatar}`,
        }}
      />
      <View />
    </Flex>
  );
}
