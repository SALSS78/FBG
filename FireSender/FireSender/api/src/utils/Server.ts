import { v4 as uuidv4 } from 'uuid';
import admin from 'firebase-admin';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { Auth } from "firebase-admin/lib/auth/auth";
import { UserImportRecord } from "firebase-admin/lib/auth/user-import-builder";
import bcrypt from 'bcryptjs';
import { Users } from "../db/schema.mongoDB";

const Servers = new Map<string, Server>();

export const serverFactory = async (id: string,userId: string, serverConfig: string, sendConfig: string): Promise<Server>=>{

    try {
        if(Servers.has(id+userId)){
            return Servers.get(id+userId) as Server;
        }else{
            const InitialDbServer: { id: string, data?: any[], emails?: string[], state?: any } = {
                id
            };
            const user = await Users.findOne({ _id: userId });
            const dbServer = user?.servers.find(server => server._id === id);
            if (dbServer) {
                InitialDbServer.data = dbServer.data;
                InitialDbServer.emails = dbServer.emails;
                InitialDbServer.state = dbServer.state;
            }

            const serverAuth = admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(serverConfig)),
            }, id+userId).auth();
            const sendAuth = getAuth(initializeApp(JSON.parse(sendConfig), id+userId));
            const server = new Server(id, userId, serverAuth, sendAuth, dbServer?.data, dbServer?.emails as string[], dbServer?.state as ServerState);
            Servers.set(id+userId, server);
            return server;
        }
    } catch (error) {
        throw error;
    }
}

export class Server{
    private id: string
    private userId: string
    private data: string[]
    private emails: string[]
    private state: ServerState
    private testEmails: string[]
    private adminAuth: Auth
    private sendAuth: any
    
    constructor(id: string, userId: string, adminAuth:any, sendAuth:any, data: string[] = [], emails: string[], state: ServerState = {import: [], send: []}){
        this.id = id
        this.data = data
        this.emails = emails
        this.state = state
        this.adminAuth = adminAuth
        this.sendAuth = sendAuth
        this.userId = userId
        this.testEmails = [];
    }
    async importUsers(data: string[], importId: string, test: boolean = false){
        //console.log(this.data, this.state, this.id, this.userId);
        const users: UserImportRecord[] = data.map((email: string) => ({
            email,
            uid: uuidv4(),
            emailVerified: true,
            phoneNumber: "+16" + generateRandom8Digits(),
            displayName: displayName(email),
            passwordHash: Buffer.from(generateRandomPassword(6, 12)),
            passwordSalt: Buffer.from(generateSalt())
        }));
        this.data = users.map(user=>user.uid);
        this.emails = users.map(user=>user.email) as string[];

        this.state.import.unshift({id: importId, total: data.length, remaining: data.length, messages: []});
        
        for (let i = 0; i < users.length; i += 1000) {
            const batch = users.slice(i, i + 1000);
            try {
                const result =  await this.adminAuth.importUsers(batch, {
                    hash: {
                        algorithm: "BCRYPT",
                    },
                });
                this.state.import[0].messages.push(result.successCount + " users imported successfully");
                this.state.import[0].remaining = this.state.import[0].remaining - batch.length;
                await this.save();
            } catch (error: any) {
                console.log(error)
                this.state.import[0].messages.push(error.message);
                i-=1000;
                sleep(5000);
                await this.save();
                continue;
            }
        }
    }
    async getEmails(){
        return this.data;
    };
    async sendEmails(sendId: string, numberEmails?: number, delay: number= 5000, bulkCount: number = 500){
        let failedCounter = 50;
        let sendCounter = 0;
        const emails = this.data.slice(0, numberEmails || this.data.length);
        this.state.send.unshift({id: sendId, total: emails.length, remaining: emails.length, messages: []});
        this.save();
        for (let i = 0; i < emails.length; i += bulkCount) {
            const batch = emails.slice(i, i + bulkCount);
            for (let index = 0; index < batch.length; index++) {
                const email = batch[index];
                await sendPasswordResetEmail(this.sendAuth, email).then((result)=>{
                    this.state.send[0].remaining--;
                    sendCounter++;
                    console.log("email sent ", result);
                }).catch((error: any)=>{
                    failedCounter--;
                });
            }
            this.state.send[0].messages.push(sendCounter+" emails sent successfully");
            this.state.send[0].messages.push(failedCounter+" emails failed to send");
            if(failedCounter <= 0){
                this.state.send[0].messages.push("failed to send "+bulkCount+" emails");
                break;
            }
            await sleep(delay);
        }
        
    }
    async deleteAllUsers(){
        console.log("delete all users function triggered")
        console.log(this.data);
        for (let index = 0; index < this.data.length; index+=1000) {
            this.adminAuth.deleteUsers(this.data.slice(index, index+1000)).then(console.log).catch(console.error);
            await sleep(5000);
        }
        this.clearDelete();
    }
    async clearDelete(){
        await fetchUsersByDate(this.adminAuth, async (toDelete: string[]) => {
            console.log(toDelete);
            for (let index = 0; index < toDelete.length; index+=1000) {
                this.adminAuth.deleteUsers(toDelete.slice(index, index+1000)).then(console.log).catch(console.error);
                await sleep(5000);
            }
        });
        Users.updateOne({ _id: this.userId, "servers._id": this.id }, { 
            $set: {
                "servers.$.data": [],
                "servers.$.state": this.state,
                "servers.$.emails": [],
                "servers.$.testEmails": [],
                "servers.$.updated_at": new Date()
              },
         }).then(console.log).catch(console.error);
    }
    async save(){
        console.log("save function triggered")
        Users.updateOne({ _id: this.userId, "servers._id": this.id }, { 
            $set: {
                "servers.$.data": this.data,
                "servers.$.state": this.state,
                "servers.$.emails": this.emails,
                "servers.$.updated_at": new Date()
              },
         }).then(console.log).catch(console.error);
    
    }
    async status(statusId: string){
        if(statusId.startsWith("import-")){
            return this.state.import.find(status=>status.id === statusId);
        }else if(statusId.startsWith("send-")){
            return this.state.send.find(status=>status.id === statusId);
        }
    }
}

type ServerState = {
    import: importStatus[],
    send: SendStatus[]
}
type importStatus = {
    id: string,
    total: number,
    remaining: number,
    messages: string[]
}
type SendStatus = {
    id: string,
    total: number,
    remaining: number,
    messages: string[]
}

async function sleep(delay: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}
function displayName(email: string) {
    return email?.split('@')[0];
}

function generateSalt() {
    return bcrypt.genSaltSync(10); // You can adjust the cost factor as needed
}
const fetchUsersByDate = async (auth: Auth, toDelete?: Function, toSend?: Function) => {
    try {
        const batch = 200;
        let users: any[] = [];
        let pageToken = undefined;

        do {
            const userRecords: any = await auth.listUsers(batch, pageToken);
            console.log(userRecords);
            if (toDelete) {
                toDelete(userRecords.users.map((user: any) => user.uid));
            }
            if (toSend) {
                toSend(userRecords.users.map((user: any) => user.email));
            }
            users = users.concat(userRecords.users);
            pageToken = userRecords.pageToken;
        } while (pageToken);

        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};


function generateRandomPassword(minLength: number, maxLength: number) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
    const passwordLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

    let password = '';
    for (let i = 0; i < passwordLength; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
}
function generateRandom8Digits() {
    const min = 100000000;
    const max = 999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

