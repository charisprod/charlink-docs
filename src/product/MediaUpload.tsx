"use client";
import React, { 
  useRef, 
  useState, 
  forwardRef, 
  useEffect, 
  DragEvent,
  ChangeEvent
} from "react";
import Compressor from "compressorjs";
import { Flex, Icon, Media, Spinner, Text } from "@once-ui-system/core";
import styles from "./MediaUpload.module.scss";

interface MediaUploadProps extends React.ComponentProps<typeof Flex> {
  onFileSelect?: (file: File | null) => void;
  compress?: boolean;
  aspectRatio?: string;
  className?: string;
  style?: React.CSSProperties;
  initialPreviewImage?: string | null;
  emptyState?: React.ReactNode;
  quality?: number;
  sizes?: string;
  children?: React.ReactNode;
  convertTypes?: string[];
  resizeMaxWidth?: number;
  resizeMaxHeight?: number;
  resizeWidth?: number;
  resizeHeight?: number;
  loading?: boolean;
  accept?: string;
}

const MediaUpload = forwardRef<HTMLInputElement, MediaUploadProps>((
  { 
    onFileSelect,
    compress = true,
    aspectRatio = "16 / 9",
    quality = 0.8,
    convertTypes = ["image/png", "image/webp", "image/jpg"],
    emptyState = "Drag and drop or click to browse",
    resizeMaxWidth = 1920,
    resizeMaxHeight = 1920,
    resizeWidth = 1200,
    resizeHeight = 1200,
    loading = false,
    sizes,
    children,
    initialPreviewImage = null,
    accept = "image/*",
    ...rest 
  },
  ref
) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialPreviewImage);
  const [uploading, setUploading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPreviewImage) {
      setPreviewImage(initialPreviewImage);
    }
  }, [initialPreviewImage]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelection = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      setPreviewImage(URL.createObjectURL(file));
      if (compress && file.type.startsWith("image/")) {
        compressImage(file);
      } else {
        uploadFile(file);
      }
    } else {
      console.warn("Unsupported file type:", file.type);
    }
  };

  const compressImage = (file: File) => {
    new Compressor(file, {
      convertTypes: convertTypes,
      quality: quality,
      maxWidth: resizeMaxWidth,
      maxHeight: resizeMaxHeight,
      convertSize: 400 * 1024,
      width: resizeWidth,
      height: resizeHeight,
      success(compressedFile: File) {
        uploadFile(compressedFile);
      },
      error(err: Error) {
        console.error("Compression error:", err);
        uploadFile(file);
      },
    });
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    if (onFileSelect) {
      await onFileSelect(file);
    }
    setUploading(false);
    
    if (!file) {
      setPreviewImage(null);
    }
    
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <Flex
      style={{ isolation: "isolate", cursor: "pointer" }}
      transition="micro-medium"
      overflow="hidden"
      className={styles.container}
      aspectRatio={aspectRatio}
      fillWidth={true}
      center={true}
      border="neutral-medium"
      bottomRadius="l"
      onClick={handleFileSelection}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...rest}
    >
      {!loading && (
        <>
          {previewImage ? (
            <Media
              height={undefined}
              style={{
                filter: uploading ? "grayscale(1)" : "",
              }}
              sizes={sizes}
              src={previewImage}
              alt="Preview of uploaded image"
            />
          ) : (
            <Flex fill={true} center={true}>
              <Icon name="plus" size="l" />
            </Flex>
          )}
        </>
      )}
      {children}
      <Flex
        className={styles.upload}
        zIndex={1}
        transition="micro-medium"
        position="absolute"
        fill={true}
        padding="m"
        horizontal="center"
        vertical="center"
      >
        {uploading || loading ? (
          <Spinner size="l" />
        ) : (
          <Text className={styles.text} align="center">
            {emptyState}
          </Text>
        )}
      </Flex>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        style={{ display: "none" }}
        onChange={handleInputChange}
      />
    </Flex>
  );
});

MediaUpload.displayName = "MediaUpload";

export { MediaUpload };