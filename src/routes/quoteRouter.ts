import { Router } from "express";
import { quoteProductTransaction } from "../controllers/quoteProductTransaction";
import { quoteController } from "../controllers/quoteController";
import { quoteProductController } from "../controllers/quoteProductController";
import { authenticate } from "../middlewares/auth";
import { validatePermissions } from "../middlewares/validatePermissions";

const router = Router()

router.post('/',authenticate, quoteProductTransaction.createQuoteWithProducts)
router.get('/',authenticate,quoteController.getQuotes)
router.get('/:id',authenticate,quoteProductController.getProductsByQuote)
router.get('/generate-pdf/:id',quoteProductController.generatePdfQuote)
router.post('/send-quote-email',authenticate,authenticate,quoteProductController.sendQuoteByEmail)
router.put('/:id',authenticate,quoteProductTransaction.updateQuoteWithProducts)
router.post('/update-status/:id',authenticate, quoteController.toggleQuoteStatus)
router.delete('/:id',authenticate, validatePermissions, quoteProductTransaction.deleteQuoteWithProducts)
export default router