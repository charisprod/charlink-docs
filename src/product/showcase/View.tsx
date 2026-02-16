"use client";

import Masonry from "react-masonry-css";
import { Button, Heading, LetterFx, Flex, Media, Spinner } from "@once-ui-system/core";
import styles from "./View.module.scss";
import { useState, useEffect, useRef } from "react";

interface Image {
  src: string;
  alt: string;
  aspectRatio: string;
  extra?: string;
}

export default function MasonryGrid() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const gridItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const breakpointColumnsObj = {
    default: 4,
    1440: 3,
    1024: 2,
    560: 1,
  };

  useEffect(() => {
    async function fetchGallery() {
      try {
        const response = await fetch("/api/media/gallery");
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGallery();
  }, []);

  const handleImageClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        gridItemRefs.current.every((ref) => ref && !ref.contains(event.target as Node))
      ) {
        setActiveIndex(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <Flex fillWidth horizontal="center" marginY="xl">
      {isLoading ? (
        <Flex fillWidth paddingY="128" horizontal="center">
          <Spinner />
        </Flex>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className={styles.masonryGrid}
          columnClassName={styles.masonryGridColumn}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className={styles.gridItemContainer}
              ref={(el) => { gridItemRefs.current[index] = el; }}
            >
              <Media
                priority={index < 10}
                sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
                radius="m"
                aspectRatio={image.aspectRatio}
                src={image.src}
                alt={image.alt}
                className={styles.gridItem}
                onClick={() => handleImageClick(index)}
                onContextMenu={(e) => e.preventDefault()}
              />
          
              {activeIndex === index && (
                <Flex
                  position="absolute"
                  padding="xs"
                  horizontal="center"
                  align="center"
                  vertical="end"
                  bottom="0"
                  left="0"
                  right="0"
                  fillWidth
                  radius="s"
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "var(--neutral-alpha-strong)",
                  }}
                  className={styles.trigger}
                >
                  <Flex gap="8" horizontal="center" direction="column">
                      <Heading wrap="balance" variant="body-default-s" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                          <LetterFx trigger="instant" speed="medium">
                            {image.alt}
                          </LetterFx>
                      </Heading>
                      {image.extra && (
                        <Heading wrap="balance" variant="body-default-s" style={{ fontFamily: 'monospace' }}>
                          <Button label="View Project" href={decodeURIComponent(image.extra)} size="s"/>
                        </Heading>
                      )}
                  </Flex>
                </Flex>
              )}
            </div>
          ))}
        </Masonry>
      )}
    </Flex>
  );
}