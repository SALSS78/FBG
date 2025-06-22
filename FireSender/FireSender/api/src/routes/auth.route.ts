import { Router } from 'express';
import { Users } from '../db/schema.mongoDB';
import jwt from 'jsonwebtoken';

export const authRouter = Router()
const secretKey = "g9GHcWJqjlFmsF5OlwgOr7Iy24O1SktIpx";

authRouter.post('/login', async (req, res) => {
  const { name, password } = req.body
  if (!name || !password) {
    res.status(400).json({ message: 'field missing' })
    return
  }
  const user = await Users.findOne({ name, password })
    if (user) {
        const token = generateToken({ id: user.id, name: user.name }, secretKey);
        res.status(200).json({ message: "auth success", token })
        }
    else {
        res.status(401).json({ message: 'Invalid credentials' })
    }
}
)

function generateToken(payload:any, secretKey:string) {
    return jwt.sign(payload, secretKey);
}

export function validateToken(token: string) {
    return jwt.verify(token, secretKey);
}