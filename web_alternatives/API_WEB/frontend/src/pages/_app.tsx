import type { AppProps } from 'next/app';
import Head from 'next/head';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
}
