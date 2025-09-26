import {Router} from "express"
import { productController } from "../controllers/productController"

const router = Router()

router.get('/',productController.getProducts)
router.get('/:id',productController.getProductById)
router.put('/:id',productController.updateProduct)
router.post('/:id',productController.toggleProductStatus)
router.post('/',productController.createProduct)

export default router