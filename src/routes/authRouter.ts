import {Router} from "express"

const router = Router()

router.get('/',(req, res)=>{
    res.send('getting routing from router auth')
})

export default router