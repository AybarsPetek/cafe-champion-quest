import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = "TheCompany Coffee Academy - Profesyonel Barista Eğitimi";
const DEFAULT_DESCRIPTION =
  "Profesyonel barista eğitimleri ile kahve sanatında uzmanlaşın. Video eğitimler, puan sistemi ve ilerleme takibi.";
const DEFAULT_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/R8xPjsEGVuhuCdt1tzJxT0z4E3T2/social-images/social-1763373960889-LOGO.jpg";

const SEO = ({ title, description, image, noIndex }: SEOProps) => {
  const fullTitle = title
    ? `${title} | TheCompany Coffee Academy`
    : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const img = image || DEFAULT_IMAGE;
  const canonicalUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
};

export default SEO;
