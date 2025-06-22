import mongoose, { Schema } from "mongoose";



const emailSchema = new Schema({
  _id: String, 
  profile: { type: String, default: "" },
  updated_at: { type: Date, default: Date.now }
});

const emailsCollection = new Schema({
  _id : String, // the label
  list: [emailSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const importSchema = new Schema({
  _id: String,
  total: Number,
  remaining: Number,
  messages: [String]
});

const sendSchema = new Schema({
  _id: String,
  total: Number,
  remaining: Number,
  messages: [String]
});

const ServerSchema = new Schema({
  _id: String,
  name: String,
  config: String,
  sendConfig: String,
  isp:String,
  updated_at: { type: Date, default: Date.now },
  data: { type: [String], default: [] },
  emails: { type: [String], default: [] },
  testEmails: { type: [String], default: [] },
  malformedEmails: { type: [String], default: [] },
  testData: { type: [String], default: [] },
  state: {
    import: { type: [importSchema], default: [] },
    send: { type: [sendSchema], default: [] }
  },
  created_at: { type: Date, default: Date.now }
});

const logSchema = new Schema({
  _id: String,
  send: Number,
  failed: Number,
  created_at: { type: Date, default: Date.now }
});


const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  logs: { type: Map, of: logSchema,  default: []},
  emailsData: [emailsCollection],
  servers: [ServerSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});



export const Users = mongoose.model('Users', userSchema);
