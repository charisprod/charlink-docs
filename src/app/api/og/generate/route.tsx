import { ImageResponse } from "next/og";
import { baseURL, schema } from "@/resources";

export const runtime = "edge";

export async function GET(request: Request) {
  let url = new URL(request.url);
  let title = url.searchParams.get("title") || schema.name;
  let description = url.searchParams.get("description");
  
  async function loadGoogleFont(font: string) {
    const url = `https://fonts.googleapis.com/css2?family=${font}`
    const css = await (await fetch(url)).text()
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)
    if (resource) {
      const response = await fetch(resource[1])
      if (response.status == 200) {
        return await response.arrayBuffer()
      }
    }
    throw new Error('failed to load font data')
  }

  return new ImageResponse(
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#0A0A0A",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <img
        src={baseURL + "/images/background.jpg"}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.45) contrast(1.1)"
        }}
      />
      <img
        src={baseURL + schema.avatar}
        style={{
          width: "12rem",
          height: "12rem",
          objectFit: "cover",
          borderRadius: "100%",
        }}
      />
      <div
        style={{
          display: "flex",
          marginTop: "6rem",
          flexDirection: "column",
          gap: "4rem",
          fontFamily: "Geist",
          fontStyle: "normal",
          color: "white",
          width: "100%",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: "8rem",
            lineHeight: "8rem",
            fontWeight: "bold",
            letterSpacing: "-0.05em",
            whiteSpace: "pre-wrap",
            textWrap: "balance",
            textAlign: "center",
          }}
        >
          {title}
        </span>
        {description && (
          <span
            style={{
              fontSize: "3rem",
              lineHeight: "3.5rem",
              color: "#9ca3af",
              fontWeight: "normal",
              whiteSpace: "pre-wrap",
              textWrap: "balance",
              marginTop: "-2rem",
              textAlign: "center",
            }}
          >
            {description}
          </span>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1920,
      height: 1080,
      fonts: [
        {
          name: "Geist",
          data: await loadGoogleFont('Geist:wght@400;700'),
          style: "normal",
        },
      ],
    },
  );
}