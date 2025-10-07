import { Router } from "express";
import { quoteProductTransaction } from "../controllers/quoteProductTransaction";
import { quoteController } from "../controllers/quoteController";
import { quoteProductController } from "../controllers/quoteProductController";

const router = Router()

router.post('/',quoteProductTransaction.createQuoteWithProducts)
router.get('/',quoteController.getQuotes)
router.get('/:id',quoteProductController.getProductsByQuote)
router.get('/generate-pdf/:id',quoteProductController.generatePdfQuote)

export default router