import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Provider } from "next-auth/providers";
import { ensureDbConnected } from '@/lib/dbConnect';
import { Admin, User } from "@/lib/db";
import bcrypt from 'bcrypt';


import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

const saltRound = 10;

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_GOOGLE_CLIENT_ID,
            clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET,
        }),
        GithubProvider({
            clientId: process.env.NEXT_GITHUB_CLIENT_ID,
            clientSecret: process.env.NEXT_GITHUB_CLIENT_SECRET
        }),
        CredentialsProvider({
            id: "adminCredential",
            name: "Admin",
            type: "credentials",
            credentials: {
                username: { label: "Admin Username", type: "text", placeholder: "jsmith" },
                password: { label: "Admin Password", type: "password" },
                tokenId: { label: 'Admin Secret Token', type: 'text', placeholder: 'Only this if you are already a admin' }
            },
            // @ts-ignore
            async authorize(credentials, req) {
                await ensureDbConnected();

                const username = credentials?.username || '';
                const password = credentials?.password || '';
                const tokenId = credentials?.tokenId || '';

                if (tokenId.length > 0) {
                    const isAdmin = await Admin.findOne({ tokenId });
                    if (isAdmin) {
                        return {
                            id: isAdmin._id,
                            email: isAdmin.username
                        }
                    }
                }
                if (!tokenId) {
                    return null;
                }
                if (username.length > 0 && password.length > 0) {


                    const salt = await bcrypt.genSalt(saltRound);
                    const hashPassword = await bcrypt.hash(password, salt);

                    // Add logic here to look up the user from the credentials supplied
                    const admin = await Admin.findOne({ username });

                    if (!admin) {
                        const obj = { username: username, password: hashPassword, tokenId };
                        const newAdmin = new Admin(obj);
                        let adminDb = await newAdmin.save();
                        console.log(adminDb);
                        return {
                            id: adminDb._id,
                            email: adminDb.username,
                        }
                    } else {
                        //TODO:: Make this safer, encrypt passwords
                        const result = await bcrypt.compare(password, admin.password);
                        if (admin.tokenId.length == 0 && tokenId.length > 0) {
                            admin.tokenId = tokenId;
                            await admin.save();
                        }
                        if (!result) {
                            return null
                        }
                        // User is authenticated
                        return {
                            id: admin._id,
                            email: admin.username,
                        }
                    }
                }




            }
        }),

        CredentialsProvider({
            id: "userCredentials",
            name: "User",
            type: "credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                await ensureDbConnected()
                if (!credentials) {
                    return null;
                }
                const username = credentials.username;
                const password = credentials.password;
                console.log(username)
                console.log(password)
                const salt = await bcrypt.genSalt(saltRound);
                const hashPassword = await bcrypt.hash(password, salt);

                // Add logic here to look up the user from the credentials supplied
                const user = await User.findOne({ username });
                console.log(user, 'from here')
                if (!user) {
                    const obj = { username: username, password: hashPassword };
                    const newUser = new User(obj);
                    await newUser.save();
                    console.log(newUser);
                    return {
                        id: newUser._id,
                        email: newUser.username,
                    }
                } else {
                    //TODO:: Make this safer, encrypt passwords
                    const result = await bcrypt.compare(password, user.password);
                    if (!result) {
                        return null
                    }
                    // User is authenticated
                    return {
                        id: user._id,
                        email: user.username,
                    }
                }
            }
        }),

        CredentialsProvider({
            id: "Impersoncredentials",
            name: "Imperson",
            type: "credentials",
            credentials: {
                tokenId: { label: 'Admin Secret Token', type: 'text', placeholder: 'Only this if you are already a admin' },
                imperson: { label: "Imperson's Username", type: 'text', placeholder: ':)' }
            },
            async authorize(credentials, req) {
                await ensureDbConnected()
                if (!credentials) {
                    return null;
                }

                const tokenId = credentials.tokenId;
                const impersonUsername = credentials.imperson;

                // Add logic here to look up the user from the credentials supplied
                const admin = await Admin.findOne({ tokenId });

                if (!admin) {
                    return null
                }
                //TODO:: Make this safer, encrypt passwords
                const imperson = await User.findOne({ username: impersonUsername  })
                if(!imperson) {
                    return null;
                }
                console.log(imperson)
                // User is authenticated
                return {
                    id: imperson._id,
                    email: imperson.username,
                }

            }
        })
    ] as Provider[],
    secret: process.env.NEXT_AUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        encryption: true
    },
}

export default NextAuth(authOptions)




