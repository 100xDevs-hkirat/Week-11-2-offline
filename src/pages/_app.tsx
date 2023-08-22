import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"

export default function App({ Component, pageProps }: AppProps) {
  console.error("pageProps")
  console.error(pageProps)
  return  <SessionProvider session={pageProps.session}>
    <Component {...pageProps} />
  </SessionProvider>
}
