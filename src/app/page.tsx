import React from "react";
import { 
  Column, 
  Row, 
  Heading, 
  Text, 
  Button, 
  Grid,
  Media, 
  Line, 
  StatusIndicator,
  Badge,
  Tag,
  Meta,
  Schema
} from "@once-ui-system/core";
import { baseURL, meta, schema } from "@/resources";
import { formatDate } from "./utils/formatDate";
import { PageList } from "@/product/PageList";

export async function generateMetadata() {
  return Meta.generate({
    title: meta.home.title,
    description: meta.home.description,
    baseURL: baseURL,
    path: meta.home.path,
    image: meta.home.image
  });
}

export default function Home() {
  return (
    <Column maxWidth={56} gap="xl" paddingX="16">
      <Schema
        as="webPage"
        title={meta.home.title}
        description={meta.home.description}
        baseURL={baseURL}
        path={meta.home.path}
        author={{
          name: schema.name
        }}
      />
      
      {/* Hero Section */}
      <Column fillWidth gap="l" paddingTop="l">
        <Row fillWidth gap="l">
          <Column maxWidth="xs" gap="12">
            <Heading variant="display-strong-s">
              CharLink Docs
            </Heading>
            <Text wrap="balance" onBackground="neutral-weak" variant="body-default-xl" marginBottom="20">
              Build a landing page without writing a single line of code
            </Text>
            <Button data-border="rounded" size="s" href="/get-started/installation" variant="secondary" arrowIcon id="get-started">Quick start</Button>
          </Column>
        </Row>
      </Column>

      <Column fillWidth>
        <Column fillWidth>
          <Text 
            variant="display-default-s" 
            onBackground="neutral-strong"
          >
            Overview
          </Text>
          <Text
            onBackground="neutral-weak"
            marginTop="8"
          >
            Deploy your CharLink in minutes
          </Text>
        </Column>
        <PageList depth={1} thumbnail={true} marginTop="24" minHeight={14}/>
      </Column>
    </Column>
  );
}
