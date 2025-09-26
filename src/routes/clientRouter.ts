import {Router} from "express"
import { clientController } from "../controllers/clientController"

const router = Router()

router.post('/',clientController.createClient)
router.get('/',clientController.getClients)
export default router