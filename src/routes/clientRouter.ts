import { Router } from "express"
import { clientController } from "../controllers/clientController"

const router = Router()

router.post('/', clientController.createClient)
router.get('/', clientController.getClients)
router.get('/:id', clientController.getClientById)
router.post('/:id', clientController.toggleClientStatus)
router.put('/:id', clientController.updateClient)
router.get('/quote/:search', clientController.getClientToQuote)

//Routes to manage the client email list
router.post('/:id/emails', clientController.addListEmail)
router.get('/:id/emails', clientController.getClientEmails)
router.delete('/:id/emails', clientController.deleteEmailFromList)

export default router