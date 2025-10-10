export default function EmbedWidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
