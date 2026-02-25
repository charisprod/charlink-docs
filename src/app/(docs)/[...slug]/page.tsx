import { notFound } from "next/navigation";
import { getPages, getAdjacentPages } from "@/app/utils/utils";
import { formatDate } from "@/app/utils/formatDate";
import { Column, Heading, Icon, Row, Media, Text, Card, HeadingNav, Meta, Schema, Button } from "@once-ui-system/core";
import { baseURL, layout, schema } from "@/resources";
import { CustomMDX } from "@/product/mdx";
import { ScrollToHash } from '@/product/ScrollToHash';
import { Metadata } from "next";
import React from "react";
import { urlFor } from "@/app/utils/sanity";

const sections = ["charlink"]; 

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slugPath = routeParams.slug ? routeParams.slug.join('/') : '';

  const docs = await getPages(sections);
  const doc = docs.find((doc) => doc.slug === slugPath);

  if (!doc) return {};

  const imageUrl = doc.metadata.image ? 
    (typeof doc.metadata.image === 'string' ? doc.metadata.image : urlFor(doc.metadata.image).url()) : 
    undefined;

  return Meta.generate({
    title: doc.metadata.title + " – " + schema.name,
    description: doc.metadata.summary ?? "",
    baseURL,
    path: `/${doc.slug}`,
    type: "article",
    publishedTime: doc.metadata.updatedAt,
    image: imageUrl ?? `/api/og/generate?title=${encodeURIComponent(doc.metadata.title)}`,
  });
}

export default async function Docs({
  params,
 }: { params: Promise<{ slug: string[] }> }) {
  const routeParams = await params;
  const slugPath = routeParams.slug.join('/');
  
  const allDocs = await getPages(sections);
  const doc = allDocs.find((d) => d.slug === slugPath);

  if (!doc) {
    notFound();
  }
  
  const { prevPage, nextPage } = await getAdjacentPages(slugPath, sections);
  
  const sectionTitle = routeParams.slug.length === 1 && !routeParams.slug[0].includes('/') 
    ? "Docs"
    : routeParams.slug[0]
      ?.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const resolvedImage = doc.metadata.image && typeof doc.metadata.image !== 'string' 
    ? urlFor(doc.metadata.image).url() 
    : doc.metadata.image;
  
  return (
    <>
      <Row fillWidth horizontal="center">
        <Column as="main" maxWidth={layout.content.width} gap="l" paddingBottom="xl" paddingX="16">
          <Schema
            as="techArticle"
            title={doc.metadata.title + " – " + schema.name}
            description={doc.metadata.summary ?? ""}
            baseURL={baseURL}
            path={`/${doc.slug}`}
            datePublished={doc.metadata.updatedAt}
            dateModified={doc.metadata.updatedAt}
            image={resolvedImage}
            author={{ name: schema.name }}
          />
          <Column fillWidth gap="8" vertical="center" paddingTop="40">
            <Text variant="label-default-l" onBackground="neutral-medium">{sectionTitle}</Text>
            <Heading variant="display-strong-s">{doc.metadata.title}</Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Last update: {formatDate(doc.metadata.updatedAt)}
            </Text>
          </Column>
          {resolvedImage && (
            <Media border="neutral-alpha-medium" enlarge src={resolvedImage} alt={doc.metadata.title} aspectRatio="16 / 9" radius="m" />
          )}
          <Column as="article" fillWidth>
            <CustomMDX source={doc.content} />
          </Column>
          
          <Row gap="16" fillWidth horizontal="between" s={{direction: "column"}}>              
              {prevPage ? (
                <Row fillWidth>
                  <Row maxWidth={20}>
                    <Card fillWidth border="neutral-alpha-medium" vertical="center" gap="4" href={`/${prevPage.slug}`} radius="l" paddingX="16">
                      <Icon name="chevronLeft" size="s" onBackground="neutral-weak" />
                      <Column gap="4" vertical="center" paddingX="16" paddingY="12">
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          {prevPage.slug.includes('/') ? prevPage.slug.split('/')[0].toUpperCase() : 'page'}
                        </Text>
                        <Text onBackground="neutral-strong" variant="heading-strong-m">{prevPage.metadata.title}</Text>
                      </Column>
                    </Card>
                  </Row>
                </Row>
              ) : <Row/>}
              {nextPage ? (
                <Row fillWidth horizontal="end">
                  <Row maxWidth={20}>
                    <Card fillWidth border="neutral-alpha-medium" horizontal="end" vertical="center" gap="4" href={`/${nextPage.slug}`} radius="l" paddingX="16">
                      <Column horizontal="end" gap="4" vertical="center" paddingX="16" paddingY="12">
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          {nextPage.slug.includes('/') ? nextPage.slug.split('/')[0].toUpperCase() : 'page'}
                        </Text>
                        <Text onBackground="neutral-strong" variant="heading-strong-m">{nextPage.metadata.title}</Text>
                      </Column>
                      <Icon name="chevronRight" size="s" onBackground="neutral-weak" />
                    </Card>
                  </Row>
                </Row>
              ) : <Row/>}
            </Row>
        </Column>
        <ScrollToHash/>
      </Row>
      <Column gap="16" maxWidth={layout.sideNav.width} s={{hide: true}} fillHeight paddingLeft="24" borderLeft="neutral-alpha-medium">
        <HeadingNav position="sticky" top="80" fitHeight/>
      </Column>
    </>
  );
}