"use client";

import { useEffect, useState } from "react";
import { Column, Carousel, Select, Flex, Button, Heading, Line, Input, Textarea, Spinner, Text } from "@once-ui-system/core";
import { Feedback } from "./Feedback";

// ==================== MediaUpload Component ====================
import { MediaUpload } from "./MediaUpload";

export function Upload() {
  const [altText, setAltText] = useState("");
  const [extra, setExtra] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  useEffect(() => {
    if (uploadMessage) {
      const timer = setTimeout(() => setUploadMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [uploadMessage]);

  const handleUpload = async () => {
    if (!selectedFile || !extra) {
      setUploadMessage("Please input the file and URL Project.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("alt", altText);
    formData.append("extra", extra);

    try {
      const response = await fetch("/api/media/upload", { method: "POST", body: formData });
       
      const contentType = response.headers.get('content-type');
      let errorData;
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Unknown error');
      }
       
      if (!response.ok) {
        setUploadMessage(`Upload failed: ${errorData.error}`);
        return;
      }

      setUploadMessage("Upload success!");
      setAltText("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      const err = error as Error;
      setUploadMessage(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Column fillWidth gap="m" maxWidth="m" marginY="xl" paddingX="l">
      <Column fillWidth gap="-1">
        {uploadMessage ? (
          <Feedback
            icon
            description={uploadMessage}
            variant={
              uploadMessage === "Upload success!" ? "success" :
              uploadMessage.startsWith("Upload failed") ? "danger" : "info"
            }
            topRadius="l"
            vertical="center"
            zIndex={1}/>
        ): (
          <Feedback
            icon
            description={loading ? "Uploading..." : "Drag and drop or click to browse."}
            variant="info"
            topRadius="l"
            vertical="center"
            zIndex={1}/>
        )}
        <MediaUpload 
          onFileSelect={setSelectedFile} 
          aspectRatio="16/9"
          accept="image/*,video/*"
          loading={loading ? true : false}
        />
      </Column>

      <Flex direction="column" marginBottom="s" gap="m">
        <Textarea
          id="description"
          label="Description"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          resize="both"
          maxLength={200}
          characterCount
          style={{ overflowY: 'auto', maxHeight: '100px', width: '100%' }}
        />
        
        <Input
          id="extra"
          label="Project URL"
          placeholder="https://charisprod.xyz"
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          required
        />
      </Flex>

      <Button
        variant="primary"
        onClick={handleUpload}
        disabled={!selectedFile || !extra || loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </Button>
    </Column>
  );
}