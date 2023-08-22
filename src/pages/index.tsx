import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })
import {signIn, useSession} from "next-auth/react"


export default function Home() {
  const session = useSession();
  console.error(session)
  return (
    <>
      hi
        <button onClick={() => signIn()}>Sign up</button>
    </>
  )
}
