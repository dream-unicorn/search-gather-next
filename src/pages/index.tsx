import type { NextPage } from 'next'
import Head from 'next/head'

import { Button } from 'antd'
import 'antd/dist/antd.css'

import Search from '../components/Search/Search'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>人美声甜</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Search />
    </>
  )
}

export default Home
