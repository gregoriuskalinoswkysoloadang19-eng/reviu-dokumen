import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo-sumba-barat.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d1836" />
        <meta name="description" content="DRES — Document Review & Evaluation System, Inspectorate of West Sumba Regency" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
