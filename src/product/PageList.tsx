import { getPages, sortPages } from "@/app/utils/utils";
import { Card, Column, Icon, Row, Media, Text } from "@once-ui-system/core";
import React from "react";
import { urlFor } from "@/app/utils/sanity";

interface props extends Omit<React.ComponentProps<typeof Card>, 'onClick'> {
  range?: [number] | [number, number];
  thumbnail?: boolean;
  path?: string[];
  description?: boolean;
  sortType?: 'order' | 'alphabetical' | 'date' | 'section';
  depth?: number;
}

function formatSlug(slug: string): React.JSX.Element {
  const parts = slug.split('/');
  const pathParts = parts.slice(0, -1);
  
  if (pathParts.length === 0) {
    return <></>;
  }
  
  const formattedParts = pathParts.map(part => 
    part.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
  
  return (
    <Row vertical="center" gap="4">
      {formattedParts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Icon name="chevronRight" size="xs" />}
          <Text>{part}</Text>
        </React.Fragment>
      ))}
    </Row>
  );
}

export async function PageList({
  range,
  thumbnail = false,
  path = [],
  sortType = 'order',
  depth,
  description = true,
  ...rest
}: props) {
  let pages = await getPages();
  if (path && path.length > 0) {
    const filterPath = path.join('/');
    pages = pages.filter(page => page.slug.startsWith(filterPath));
  }

  if (depth !== undefined) {
    pages = pages.filter(page => {
      const pathPrefix = path.join('/');
      const relativePath = pathPrefix ? 
        page.slug.replace(pathPrefix + (pathPrefix.endsWith('/') ? '' : '/'), '') : 
        page.slug;
      
      const slashCount = (relativePath.match(/\//g) || []).length;
      return slashCount < depth;
    });
  }

  const sortedPages = sortPages(pages, sortType);

  const displayedPages = range 
    ? (range.length === 1 
        ? sortedPages.slice(range[0] - 1)
        : sortedPages.slice(range[0] - 1, range[1]))
    : sortedPages;

  return (
    <>
      {displayedPages.length > 0 && displayedPages.map((page) => {
        const imageUrl = page.metadata.image && typeof page.metadata.image !== 'string' 
          ? urlFor(page.metadata.image).url() 
          : page.metadata.image;

        return (
          <Card href={`/${page.slug}`} key={page.slug} radius="l" padding="2" gap="16" s={{direction: "column"}} border="neutral-alpha-weak" fillWidth {...rest}>
            {imageUrl && thumbnail && (
              <Media
                priority
                sizes="480px"
                border="neutral-alpha-weak"
                cursor="interactive"
                radius="m"
                src={imageUrl}
                alt={"Thumbnail of " + page.metadata.title}
                aspectRatio="16 / 9"
              />
            )}
            <Column fillWidth gap="4" vertical="center" paddingX="16" paddingY="12">
              <Text variant="label-default-s" onBackground="neutral-weak">
                {formatSlug(page.slug)}
              </Text>
              <Text variant="heading-strong-l" wrap="balance" onBackground="neutral-strong">
                {page.metadata.title}
              </Text>
              {description && page.metadata.summary && (
                <Text variant="body-default-s" onBackground="neutral-medium" marginTop="12" wrap="balance">
                  {page.metadata.summary}
                </Text>
              )}
            </Column>
          </Card>
        );
      })}
    </>
  );
}
