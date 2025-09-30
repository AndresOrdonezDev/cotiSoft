import {Router} from "express"
import { clientController } from "../controllers/clientController"

const router = Router()

router.post('/',clientController.createClient)
router.get('/',clientController.getClients)
router.get('/:id',clientController.getClientById)
router.post('/:id',clientController.toggleClientStatus)
router.put('/:id',clientController.updateClient)
router.get('/quote/:search',clientController.getClientToQuote)
export default router