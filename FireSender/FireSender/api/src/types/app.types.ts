interface IUser {
    id: string,
    name: string,
    email: string,
    created_at: string,
    updated_at: string,
}

interface ISend {
    send: number,
    date: Date,
}

interface IPhone {
    _id: string,
    app: string,
    sendToday?: number,
    successSendToday?: number,
    history?: Array<ISend>,
    lastConnection?: Date,
}

interface Email {
    email: string,
    status: string
}

interface IMessage {
    from: string,
    to: string,
    subject: string,
    body: string,
    file: string,
}