import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    author?: string;
    keywords?: string[];
}

export const SEO = ({
    title,
    description = 'TruthLens - Premium News Portal for Bangladesh and beyond.',
    image = 'https://truthlens.com.bd/og-image.png', // Fallback image
    url = typeof window !== 'undefined' ? window.location.href : '',
    type = 'article',
    author = 'TruthLens',
    keywords = []
}: SEOProps) => {
    const siteTitle = 'TruthLens';
    const fullTitle = `${title} | ${siteTitle}`;

    // Ensure image is absolute URL
    const absoluteImage = image?.startsWith('http') ? image : `https://truthlens.com.bd${image}`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="author" content={author} />
            {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

            {/* Facebook / Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={absoluteImage} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={absoluteImage} />
            <meta name="twitter:site" content="@truthlens_bd" />
        </Helmet>
    );
};
