import "./globals.css";

export const metadata = {
  title: "台灣即時氣象地圖 | AIoT-DA HW1",
  description: "NCHU AIoT-DA HW1 - CWA 即時氣象視覺化地圖",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
