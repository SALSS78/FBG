import crypto from "crypto-js"

let currentIndexOfEmails = 0;
let pause = false;


function calculateMD5Hash(input: string) {
    const hash = crypto.MD5(input);
    const hexHash = hash.toString(crypto.enc.Hex);
    return hexHash;
}

export const suppressionList = (hashedEmails: string[], emailsList: string[], max = 10, index = 0) => {
    if(hashedEmails.length === 0 || emailsList.length === 0)return {positiveEmails: [], negativeEmails: []};
    let positiveEmailsCounter = 0;
    const negativeEmails = [];
    const positiveEmails = [];
    for (index; (index < emailsList.length) && positiveEmailsCounter < max; index++) {
        const email = emailsList[index];
        const md5Hash = calculateMD5Hash(email);
        if (hashedEmails.includes(md5Hash)) {
            negativeEmails.push(email);
        }else{
            positiveEmails.push(email);
            positiveEmailsCounter++;
        }
        if(pause){
            currentIndexOfEmails = index;
            return {positiveEmails, negativeEmails, currentIndexOfEmails};
        }
    }
    return {positiveEmails, negativeEmails};
};

export const workerInstance = new ComlinkWorker<typeof import("./sw/worker")>(
    new URL("./sw/worker", import.meta.url)
  );
