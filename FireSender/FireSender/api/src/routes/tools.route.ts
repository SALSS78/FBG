import { Router } from "express";
import { suppressionList } from "../utils/suppressionList";
import multer from 'multer';
import { Readable } from "stream";
import { createInterface } from "readline/promises";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


export const toolsRouter = Router();




toolsRouter.post('/suppression-List', upload.fields([{ name: 'emails', maxCount: 1 }, { name: 'emailsHashed', maxCount: 1 }]), async (req: any, res) => {
    const { emailsHashed, emails, max } = req.body;
    const emailsFile = req?.files?.emails?.[0];
    const emailsHashedFile = req?.files?.emailsHashed?.[0];
    let hashedEmailsToProcess: string[] = [];
    let emailsToProcess: string[] = [];
  
    if (!emailsHashed && !emailsHashedFile || !emails && !emailsFile) {
        res.status(400).json({ message: 'field missing' })
        return
    }
    if(emailsHashedFile){
        const stream = Readable.from(emailsHashedFile.buffer.toString());
        const lines = createInterface({
            input: stream
        });
        for await (const line of lines) {
            hashedEmailsToProcess.push(line);
        }
    }
    if(emailsFile){
        const stream = Readable.from(emailsFile.buffer.toString());
        const lines = createInterface({
            input: stream
        });
        for await (const line of lines) {
            emailsToProcess.push(line);
        }
    }
    if(emails){
        emailsToProcess.concat(emails)
    }
    if(emailsHashed){
        hashedEmailsToProcess.concat(emailsHashed)
    }
    
    const data = await suppressionList(hashedEmailsToProcess, emailsToProcess, max);
    console.log(data);
    res.status(200).json({ message: 'scan completed success', data });
});


