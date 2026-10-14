import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        {/* Meta tags */}
        <meta charSet="utf-8" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="AI Medical Solutions" />
        
        {/* SEO Meta Tags */}
        <meta name="description" content="Sistem deteksi kanker mulut menggunakan AI dengan teknologi MobileNetV2 dan Grad-CAM untuk analisis medis yang akurat" />
        <meta name="keywords" content="AI, kanker mulut, deteksi medis, kecerdasan buatan, grad-cam, medical analysis" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AI Deteksi Kanker Mulut - Sistem Analisis Medis" />
        <meta property="og:description" content="Sistem deteksi kanker mulut berbasis AI dengan akurasi 98.5%" />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Deteksi Kanker Mulut" />
        <meta name="twitter:description" content="Sistem analisis medis berbasis AI untuk deteksi dini kanker mulut" />
        
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B3954" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Analytics (if needed) */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
