export default function Sitemap() {
  return null;
}

export async function getServerSideProps({ res }) {
  const baseUrl = "https://cinetales-lilac.vercel.app";

  const pages = [
    "",
    "/discover",
    "/trending",
    "/vibes",
    "/match",
    "/about",
    "/search",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.write(sitemap);
  res.end();

  return { props: {} };
}
