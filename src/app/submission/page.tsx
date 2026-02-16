import { Flex, Meta, Schema } from "@once-ui-system/core";
import { Upload } from "@/product/Upload";
import { baseURL, meta, schema } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: meta.submission.title,
    description: meta.submission.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(meta.submission.title)}&description=${encodeURIComponent(meta.submission.description)}`,
    path: meta.submission.path,
  });
}

export default function Showcase() {
  return (
    <Flex maxWidth="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={meta.submission.title}
        description={meta.submission.description}
        path={meta.submission.path}
        image={`/api/og/generate?title=${encodeURIComponent(meta.submission.title)}&description=${encodeURIComponent(meta.submission.description)}`}
        author={{
          name: schema.name,
          url: `${baseURL}${meta.submission.path}`,
          image: `${baseURL}${schema.avatar}`,
        }}
      />
      <Upload />
    </Flex>
  );
}
