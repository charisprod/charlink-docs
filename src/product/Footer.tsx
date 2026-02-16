import { layout, social } from "@/resources/once-ui.config";
import {
  Button,
  Column,
  Icon,
  Logo,
  Row,
  ThemeSwitcher,
} from "@once-ui-system/core";

export const Footer = () => {
  return (
    <Column gap="40" fillWidth paddingY="xl" paddingX="l" horizontal="center" borderTop="neutral-alpha-medium">
      <Row gap="12" textVariant="label-default-m" maxWidth={layout.footer.width} vertical="center">
        <Logo dark href="/" icon="/trademarks/icon-dark.svg" size="m" />
        <Logo light href="/" icon="/trademarks/icon-light.svg" size="m" />
        {/* Usage of this template requires attribution. Please don't remove the link to Once UI unless you have Once UI Pro subscription. */}
        <Button
          data-border="rounded"
          size="s"
          weight="default"
          variant="tertiary"
          href="https://once-ui.com/products/magic-docs"
        >
          <Row gap="12" vertical="center">
            Launch your docs with Once UI
            <Icon size="xs" name="arrowUpRight" onBackground="brand-medium" />
          </Row>
        </Button>
      </Row>
      <Row maxWidth={layout.footer.width}>
        <ThemeSwitcher />
      </Row>
    </Column>
  );
};
