
import { Inter } from 'next/font/google'
import { Button, Typography } from "@mui/material";
import {signIn, useSession, signOut} from "next-auth/react"
import {getServerSession} from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth]'

export default function Ssr({session}) {
    return (
        <div style={{height: 60, background: "white", padding: 10}}>
            {session.data && <div style={{display: "flex", justifyContent: "space-between"}}>
                <Typography variant={"h4"} style={{color: "black"}}>
                    {session.data.user?.email}
                </Typography>
                <div>
                    <Button variant={"contained"} onClick={() => signOut()}>Logout</Button>
                </div>
            </div>}
            {!session.data && <div style={{display: "flex", justifyContent: "space-between"}}>
                <Typography variant={"h4"} style={{color: "black"}}>
                    Coursera
                </Typography>
                <div>
                    <Button variant={"contained"} onClick={() => signIn()}>Sign up</Button>
                </div>
            </div>}
        </div>
    )
}

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions)

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return {
        props: {
            session,
        },
    }
}