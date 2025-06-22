import { Router } from 'express'
import { Users } from '../db/schema.mongoDB';
import admin from 'firebase-admin';
import { getAuth, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { v4 as uuidv4 } from 'uuid';
import { Auth } from 'firebase-admin/lib/auth/auth';
import multer from "multer";
import readline from 'readline';
import { Readable } from 'stream';
import { serverFactory } from '../utils/Server';
import logger from '../utils/logger';


const sendStatus: Map<string, { send: number, failed: number, messages: string[] }> = new Map();
const adminMap: Map<string, admin.auth.Auth> = new Map();
const sendMap: Map<string, Auth> = new Map();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });




// db.insert({ _id: 'rS3E9luMlIaM78Ng', name: 'test' });



export const appRouter = Router();

const adminInstances: any[] = [];
let sendDeadCounter = new Map<string, number>();

appRouter.get('/servers', (req, res) => {
    const user = (req as any).user;
    logger.info('GET /servers hit ip: '+req.socket?.remoteAddress);
    Users.findOne({ _id: user.id }).then((user) => {
        if (user) {
            if (user.servers) {
                res.json({
                    servers: user.servers.map((server) => {
                        return {
                            id: server._id,
                            name: server.name,
                            isp: server.isp,
                            config: server.config,
                            sendConfig: server.sendConfig,
                            updated_at: server.updated_at
                        }
                    })
                });
            } else {
                res.json({ servers: [] });
            }
        }
    });
});

appRouter.post('/server', (req, res) => {
    const user = (req as any).user;
    logger.info('POST /server hit ip: '+req.socket?.remoteAddress);
    const { name, config, isp, sendConfig } = req.body;
    if (!name || !config || !isp || !sendConfig) {
        res.status(400).json({ message: 'missing fields ' });
    } else {
        Users.updateMany({ _id: user.id }, {
            $push: {
                servers: {
                    _id: uuidv4(),
                    name,
                    config,
                    isp,
                    sendConfig
                }
            }
        }).then(() => {
            res.json({ message: 'server added' });
        });
    }
});

appRouter.delete('/server/:id', (req, res) => {
    const user = (req as any).user;
    logger.info('DELETE /server hit ip: '+req.socket?.remoteAddress);
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: 'missing fields' });
    } else {
        Users.updateMany({ _id: user.id }, {
            $pull: {
                servers: {
                    _id: id
                }
            }
        }).then(() => {
            res.json({ message: 'server deleted' });
        });
    }
});

appRouter.get('/emails/:id', (req, res) => {
    logger.info('GET /emails hit ip: '+req.socket?.remoteAddress);
    const user = (req as any).user;
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: 'missing fields' });
    } else {
        Users.findOne({ _id: user.id }).then(async (user) => {
            if (!user) {
                res.status(400).json({ message: 'user not found' });
            } else {
                let serverConfig;
                for (let i = 0; i < user.servers.length; i++) {
                    if (user.servers[i].id === id) {
                        serverConfig = user.servers[i].config;
                        break;
                    }
                }
                if (!serverConfig) {
                    res.status(400).json({ message: 'server not found' });
                } else {
                    try {
                        let authInstance = undefined;
                        for (let i = 0; i < adminInstances.length; i++) {
                            if (adminInstances[i].id === id) {
                                authInstance = adminInstances[i].admin;
                                break;
                            }
                        }
                        if (authInstance) {
                            const userList = await fetchUsersByDate(authInstance);
                            res.json(userList);
                        } else {
                            const app = admin.initializeApp({
                                credential: admin.credential.cert(JSON.parse(serverConfig as unknown as string)),
                            }, id);
                            const auth = app.auth();
                            adminInstances.push({ id, admin: auth });
                            const userList = await fetchUsersByDate(auth);
                            res.json(userList);
                        }
                    } catch (error) {
                        console.error('Error fetching users:', error);
                        res.status(500).json({ error: 'Unable to fetch users' });
                    }
                }
            }
        });
    }
});

appRouter.post('/emails/delete-all', (req, res) => {
    logger.info('POST /emails/clear server hit ip: '+req.socket?.remoteAddress);
    const { id } = req.body;
    if (!id) {
        res.status(400).json({ message: 'missing fields' });
    } else {
        const user = (req as any).user;
        Users.findOne({ _id: user.id }).then(async (user) => {
            if (!user) {
                res.status(400).json({ message: 'user not found' });
            } else {
                const server = user.servers.find((server: any) => server._id === id);
                if (!server) {
                    res.status(400).json({ message: 'server not found' });
                    return;
                } 
                const ServerInstance = await serverFactory(id, user.id, server.config as string, server.sendConfig as string);
                ServerInstance.deleteAllUsers();
                res.json({ message: 'deleting all users begin' });
            }
        });
    }
});

appRouter.post('/send', (req, res) => {
    const { id } = req.body;
    logger.info('POST /send hit ip: '+req.socket?.remoteAddress+"  SERVER ID: "+id+ " USER ID: "+(req as any).user) ;
    if (!id) {
        res.status(400).json({ message: 'missing fields' });
    } else {
        const user = (req as any).user;
        Users.findOne({ _id: user.id }).then(async (user) => {
            if (!user) {
                res.status(400).json({ message: 'user not found' });
            } else {
                let serverConfig;
                let sendConfig;
                let emails: string[] = [];
                let testEmails: string[] = [];
                for (let i = 0; i < user.servers.length; i++) {
                    if (user.servers[i]._id === id) {
                        serverConfig = user.servers[i].config;
                        sendConfig = user.servers[i].sendConfig;
                        emails = user.servers[i].emails;
                        testEmails = user.servers[i].testEmails;
                        break;
                    }
                }
                if (!serverConfig || !sendConfig) {
                    res.status(400).json({ message: 'server not found' });
                } else {
                    try {
                        const auth = sendMap.get(id) || getAuth(initializeApp(JSON.parse(sendConfig as unknown as string), uuidv4()));
                        if(!sendMap.has(id))sendMap.set(id, auth as Auth);
                        const sendId = "send-"+uuidv4();
                        sendDeadCounter.set(sendId, 50);
                        Users.updateOne({ _id: user.id}, { 
                            $set: {
                                ["logs."+sendId]: {
                                    _id: sendId,
                                    send: 0,
                                    failed: 0,
                                }
                            }
                         }).then(result=>console.log(result));
                        const serverAuth = adminMap.get(id) || admin.initializeApp({
                            credential: admin.credential.cert(JSON.parse(serverConfig)),
                        }, uuidv4()).auth();
                        if(!adminMap.has(id))adminMap.set(id, serverAuth); 
                        // fetchUsersByDate(serverAuth, undefined, (dbEmails: string[]) => {
                        // });
                        console.log(emails, testEmails);
                        sendEmails(auth, emails, id, sendId, user.id, testEmails, emails.length);
                        res.json({ message: 'send operation begin...', sendId:sendId  });

                    } catch (error) {
                        console.error('Error fetching users:', error);
                        res.status(500).json({ error: 'Unable to fetch users' });
                        return;
                    }
                }

            }
        });
    }
});

appRouter.post('/import', upload.single('file'), (req, res) => {
    const { id, emails, testEmails } = req.body;
    if (!id) {
        res.status(400).json({ message: 'missing fields' });
        return;
    }
    const user = (req as any).user;
    const fileBuffer = req.file?.buffer?.toString() || '';
    if (fileBuffer.length < 1 && !emails) {
        res.status(400).json({ message: 'missing fields' });
        return;
    }
    if(emails){
        const malformedEmails: any[] = [];
        const list: any[] = [];
        emails.map((email: string) => {
            if(validateEmail(email))list.push(email);
            malformedEmails.push(email);
        });
        if(testEmails)list.push(...testEmails.filter((email: string) => validateEmail(email)));

        let ids: string[];
        if (typeof id === 'string') {
            ids = [id];
        } else {
            ids = id;
        }
        Users.findOne({ _id: user.id }).then(async (user) => {
            if (!user) {
                res.status(400).json({ message: 'user not found' });
            } else {
                const serversConfig: any[] = [];
                for (let i = 0; i < user.servers.length; i++) {
                    if (ids.includes(user.servers[i].id)) {
                        if(testEmails)user.servers[i].testEmails = testEmails;
                        if(malformedEmails.length>0)user.servers[i].malformedEmails = malformedEmails;
                        serversConfig.push({ id: user.servers[i]._id, config: user.servers[i].config, sendConfig: user.servers[i].sendConfig });
                    }
                }
                user.save().then(result=>console.log("testEmails saved"));
                if (serversConfig.length < 1) {
                    res.status(400).json({ message: 'servers not found' });
                } else {
                    try {
                        let forEach = Math.round(list.length / serversConfig.length);
                        let start = 0;
                        const importIds = [];
                        for (let index = 0; index < serversConfig.length; index++) {
                            const server = serversConfig[index];
                            if (start + (forEach * 2) > list.length) forEach += list.length % serversConfig.length;
                            const emailsToImport = list.slice(start, start + forEach);
                            const ServerInstance = await serverFactory(server.id, user.id, server.config, server.sendConfig);
                            const importId = "import-"+uuidv4();
                            ServerInstance.importUsers(emailsToImport, importId);
                            importIds.push({
                                serverId: server.id,
                                importId
                            });
                        } 
                        res.json({ message: 'import operation begin...', importIds });
                    } catch (error: any) {
                        console.error('Error fetching users:', error?.errors[0].error);
                        res.status(500).json({ error: 'Unable to fetch users' });
                    }
                }

            }
        });
    }else{
        if(fileBuffer){
            const stream = Readable.from(fileBuffer);

    const lines = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });
    const list: string[] = [];
    lines.on('line', (line) => {
        if (typeof line === 'string' && line.length > 0) {
            const email = line.replace(/\s/g, '');
            if (validateEmail(email)) {
                list.push(email);                
            } else {
                console.log('Invalid email:', email);
            }
        }
    });
    lines.on('close', () => {
        let ids: string[];
        if (typeof id === 'string') {
            ids = [id];
        } else {
            ids = id;
        }
        Users.findOne({ _id: user.id }).then(async (user) => {
            if (!user) {
                res.status(400).json({ message: 'user not found' });
            } else {
                const serversConfig: any[] = [];
                for (let i = 0; i < user.servers.length; i++) {
                    if (ids.includes(user.servers[i].id)) {
                        serversConfig.push({ id: user.servers[i]._id, config: user.servers[i].config, sendConfig: user.servers[i].sendConfig });
                    }
                }
                if (serversConfig.length < 1) {
                    res.status(400).json({ message: 'servers not found' });
                } else {
                    try {
                        let forEach = Math.round(list.length / serversConfig.length);
                        let start = 0;
                        const importIds = [];
                        for (let index = 0; index < serversConfig.length; index++) {
                            const server = serversConfig[index];
                            if (start + (forEach * 2) > list.length) forEach += list.length % serversConfig.length;
                            const emailsToImport = list.slice(start, start + forEach);
                            const ServerInstance = await serverFactory(server.id, user.id, server.config, server.sendConfig)
                            const importId = "import-"+uuidv4();
                            ServerInstance.importUsers(emailsToImport, importId);
                            importIds.push({
                                serverId: server.id,
                                importId
                            });
                        } 
                        res.json({ message: 'import operation begin...', importIds });
                    } catch (error: any) {
                        console.error('Error fetching users:', error?.errors[0].error);
                        res.status(500).json({ error: 'Unable to fetch users' });
                    }
                }

            }
        });
    });
        }
    }
});

appRouter.get('/status/:serverId/:id', (req, res) => {
    const { serverId, id } = req.params;
    if (!serverId || !id) {
        res.status(400).json({ message: 'missing fields' });
        return;
    }
    if (id.includes("send")) {
        res.json({ message: 'send operation', status: sendStatus.get(serverId+id)|| {send: 0, failed: 0}});
        return;
    }
    const user = (req as any).user;
    Users.findOne({ _id: user.id }).then(async (user) => {
        if (!user) {
            res.status(400).json({ message: 'user not found' });
            return;
        }
        const server = user.servers.find((server: any) => server._id === serverId);
        if(!server){
            res.status(400).json({ message: 'server no available' });
            return;
        }
        const ServerInstance = await serverFactory(serverId, user.id, server.config as string, server.sendConfig as string);
        const status = await ServerInstance.status(id);
        res.json(status);
    });
})

const fetchUsersByDate = async (auth: Auth, toDelete?: Function, toSend?: Function) => {
    try {
        const batch = 200;
        let users: any[] = [];
        let pageToken = undefined;

        do {
            const userRecords: any = await auth.listUsers(batch, pageToken);
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


const sendEmails = async (auth: any, emails: any[], serverId: string, sendId: string, userId: string, testEmails: string[], total: number) => {
    if (emails.length > 25) {
        for (let index = 0; index < emails.length; index += 25) {
            sendEmails(auth, emails.slice(index, index + 25), serverId, sendId, userId, testEmails, total);
        }
        return true;
    }
    
    let currentIndex = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function save() {

        const totalSend = sendStatus.get(serverId+sendId)?.send || 0;

        if(((totalSend) % (Math.floor(total/testEmails.length))=== 0)){
            const email = testEmails[Math.floor(totalSend/(Math.floor(total/testEmails.length)))];
            sendPasswordResetEmail(auth, email).then(() => {
                console.log('test email send to '+email);
            }).catch((error: Error) => {
                if (error.message.includes('auth/too-many-requests')) {
                    console.log('Too many requests');
                    return;
                } else {
                    console.log('Error sending email to:', emails[currentIndex]);
                    console.log('Error sending email:', error);
                    const status = sendStatus.get(serverId+sendId);
                    status?.messages.push(error.message+" test email "+email);
                    sendStatus.set(serverId+sendId, status as { send: number; failed: number; messages: string[]; });
                }
            });
        }
        if (emails[currentIndex]) {
            // sendEmailVerification(auth, emails[currentIndex]).then(() => {
            if(!testEmails.includes(emails[currentIndex])){
                sendPasswordResetEmail(auth, emails[currentIndex]).then(() => {
                    console.log('emails send to '+emails[currentIndex]);
                    currentIndex++;
                    const status = sendStatus.get(serverId+sendId);
                    if (status) {
                        status.send += 1;
                        sendStatus.set(serverId+sendId, status);
                        
                        if(status.send % 1000 === 0){
                            Users.updateOne({ _id: userId}, { 
                                $set: {
                                    ["logs."+sendId]: status,
                                }
                             }).then(result=>console.log(result));
                        }
                    } else {
                        sendStatus.set(serverId+sendId, {
                            failed: 0,
                            send: 1,
                            messages: []
                        })
                    }
                    if (currentIndex < emails.length) {
                        setTimeout(() => {
                            save();
                        }, 10);
                    } else {
                        return;
                    }
                }).catch((error: Error) => {
                    if (error.message.includes('auth/too-many-requests')) {
                        console.log('Too many requests');
                        const status = sendStatus.get(serverId+sendId);
                        if (status) {
                            console.log(status);
                            status.failed += 1;
                            sendStatus.set(serverId+sendId, status);
                            const deadCounter = sendDeadCounter.get(sendId);
                            if (deadCounter && deadCounter <= 0) {
                                return;
                            }else{
                                if(deadCounter!=undefined)sendDeadCounter.set(sendId, deadCounter-1);
                            }
                        } else {
                            sendStatus.set(serverId+sendId, {
                                failed: 1,
                                send: 0,
                                messages: [error.message]
                            })
                        }
                        if (currentIndex < emails.length) {
                            currentIndex++;
                            setTimeout(() => {
                                save();
                            }, 100);
                        }
                        return;
                    } else {
                        console.log('Error sending email to:', emails[currentIndex]);
                        console.log('Error sending email:', error);
                        const status = sendStatus.get(serverId+sendId);
                        status?.messages.push(error.message+" "+emails[currentIndex]);
                        sendStatus.set(serverId+sendId, status as { send: number; failed: number; messages: string[]; });
                        setTimeout(() => {
                            save();
                        }, 1000);
                    }
                });
            }else{
                currentIndex++;
                save();
            }
        }
    }
    save()
}

function validateEmail(email: string) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}



