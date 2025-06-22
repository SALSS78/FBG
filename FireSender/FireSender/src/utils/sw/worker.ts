// @/src/sw/worker.ts

/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

const hashedEmailsToProcess: string[] = [];
const emailsListToProcess: string[] = [];

export const suppressionListWorker = async (hashedEmails: string[], emailsList: string[], isLoadingFinish: boolean = false, max?: number) => {
  
 
  if(hashedEmails.length > 0){
    hashedEmailsToProcess.push(...hashedEmails);
    console.log("hashedEmailsToProcess", hashedEmailsToProcess.length)
  }
  if(emailsList.length > 0){
    emailsListToProcess.push(...emailsList);
    console.log("emailsListToProcess", emailsListToProcess.length)
  }
  if(isLoadingFinish){
    const module = await import("../worker")
    const result = module.suppressionList(hashedEmailsToProcess, emailsListToProcess, max);
    return result;
  }

}