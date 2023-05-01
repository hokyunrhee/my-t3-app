import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>My T3 App</title>
        <meta name="description" content="This is my t3 app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ClerkProvider {...pageProps}>
        <Component {...pageProps} />
        <Toaster position="bottom-center" />
      </ClerkProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
