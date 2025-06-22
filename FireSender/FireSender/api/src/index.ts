import express from 'express';
import cors from 'cors';
import { environment } from './utils/loadEnvironment';
import mongoose from 'mongoose';
import { appRouter } from './routes/app.route';
import { authRouter } from './routes/auth.route';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { suppressionList } from './utils/suppressionList';
import { toolsRouter } from './routes/tools.route';


// initial the express server
const app = express();



// middlewares 
app.use(cors());
app.use(express.json());
app.use(authRouter);
app.use(AuthMiddleware);
app.use('/api/tools', toolsRouter);
app.use('/api', appRouter);


// retrieve mongodb connection info 
const uri = environment.MONGODB_URI

mongoose.connect(uri as string).then(() => { 
    console.log('connected to mongodb');
    // start the Express server
app.listen(environment.PORT, () => {
    console.log(`🚀 Server is running on port: ${environment.PORT}`);
});
}).catch((err) => { 
    console.log('error connecting to mongodb', err);
});


const emailsHashed = [
    ""
    // "08a298308a9e73e0999e056428ed89ac",
    // "09251155a55aec64b99bea7f65b60b52",
    // "0f43847f943297f69b08977600c7478b",
    // "20150de962846b976cdea02065548e06"
]

const emails = [
    ""
    // "cindymello18@icloud.com",
    // "duggeyo@msn.com",
    // "gabycalderon07@ymail.com",
    // "chiaravj@optonline.net",
    // "luice@gmail.com"
];

console.log(suppressionList(emailsHashed, emails));
