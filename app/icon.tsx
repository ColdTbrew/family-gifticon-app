import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#132235",
          borderRadius: 12,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%"
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            height: 18,
            justifyContent: "center",
            padding: "0 4px",
            width: 20
          }}
        >
          <div style={{ background: "#0064d1", borderRadius: 99, height: 3, width: 12 }} />
          <div style={{ background: "#5b6a7a", borderRadius: 99, height: 3, width: 9 }} />
          <div style={{ background: "#5b6a7a", borderRadius: 99, height: 3, width: 14 }} />
        </div>
      </div>
    ),
    size
  );
}
