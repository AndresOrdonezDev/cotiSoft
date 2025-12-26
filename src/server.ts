import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import connectDB from './config/db'
import authRouter from './routes/authRouter'
import productRouter from './routes/productRouter'
import clientRouter from './routes/clientRouter'
import quoteRouter from './routes/quoteRouter'
import quoteAttachmentRouter from './routes/quoteAttachmentRouter'
import { corsConfig } from './config/cors'
dotenv.config()

const app = express()
//connect to DB
connectDB()
//cors config
app.use(cors(corsConfig))
//to enable reading of data in JSON format
app.use(express.json())
//serve static files from public/attachment
app.use('/attachment', express.static(path.join(__dirname, 'public/attachment')))
//routing
app.use('/api/auth',authRouter)
app.use('/api/product',productRouter)
app.use('/api/client',clientRouter)
app.use('/api/quote',quoteRouter)
app.use('/api/quote-attachment',quoteAttachmentRouter)

export default app