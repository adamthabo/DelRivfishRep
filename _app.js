import '../styles/globals.css';
import Head from 'next/head';
import { SWRConfig } from 'swr';

// Global fetcher for SWR
const fetcher = async (url) => {
  const res = await fetch(url);
  
  // If the status code is not in the range 200-299,
  // throw an error
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  
  return res.json();
};

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Delaware River Dashboard</title>
        <meta name="description" content="Live monitoring dashboard for the Delaware River and its tributaries" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <SWRConfig 
        value={{
          fetcher,
          revalidateOnFocus: false,
          refreshInterval: 0, // Default to no auto-refresh (components will set their own intervals)
          dedupingInterval: 10000, // Dedupe requests within 10 seconds
          errorRetryCount: 3, // Retry failed requests 3 times
        }}
      >
        <Component {...pageProps} />
      </SWRConfig>
    </>
  );
}

export default MyApp;
