import {Router} from "express"
import { authController } from "../controllers/authController"
import { authenticate } from "../middlewares/auth"

const router = Router()

router.post('/create-account',authController.createAccount)
router.post('/login',authController.login)
router.get('/logout',authenticate,authController.logout)
router.get('/user',
    authenticate,
    authController.user
)
router.get('/users',authController.getUsers)
router.get('/user/:id',authController.toggleUserStatus)
export default router