import { Router } from "express";
import { quoteProductTransaction } from "../controllers/quoteProductTransaction";
import { quoteController } from "../controllers/quoteController";
import { quoteProductController } from "../controllers/quoteProductController";

const router = Router()

router.post('/',quoteProductTransaction.createQuoteWithProducts)
router.get('/',quoteController.getQuotes)
router.get('/:id',quoteProductController.getProductsByQuote)
router.get('/generate-pdf/:id',quoteProductController.generatePdfQuote)
router.post('/send-quote-email',quoteProductController.sendQuoteByEmail)
router.put('/:id',quoteProductTransaction.updateQuoteWithProducts)
router.post('/update-status/:id', quoteController.toggleQuoteStatus)
export default router