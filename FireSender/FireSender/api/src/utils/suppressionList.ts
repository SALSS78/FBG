import crypto from 'crypto';


function calculateMD5Hash(input: string) {
    return crypto.createHash('md5').update(input).digest('hex');
}

export const suppressionList = async (hashedEmails: string[], emailsList:string[], max: number = 50000) => {
    let positiveEmailsCounter = 0;
    const negativeEmails = [];
    const positiveEmails = [];
    for (let index = 0; (index < emailsList.length) && positiveEmailsCounter < max; index++) {
        const email = emailsList[index];
        const md5Hash = calculateMD5Hash(email);
        if (hashedEmails.includes(md5Hash)) {
            negativeEmails.push(email);
        }else{
            positiveEmails.push(email);
            positiveEmailsCounter++;
        }
    }
    return {positiveEmails, negativeEmails};
};