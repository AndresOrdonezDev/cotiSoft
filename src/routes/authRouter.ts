import {Router} from "express"
import { authController } from "../controllers/authController"
import { authenticate } from "../middlewares/auth"
import { validatePermissions } from "../middlewares/validatePermissions"

const router = Router()

router.post('/create-account',authenticate,authController.createAccount)
router.get('/user/:id',authController.getUser)
router.put('/user/:id',authenticate,validatePermissions,authController.updateUser)
router.post('/login',authController.login)
router.get('/logout',authenticate,authController.logout)
router.get('/user',
    authenticate,
    authController.user
)
router.post('/forgot-Password',authController.sendTokenForgotPassword)
router.post('/update-Password-token',authController.updatePasswordToken)
router.post('/update-Password',authenticate,authController.updatePassword)
router.get('/users',authenticate,authController.getUsers)
router.get('/user-status/:id',authenticate,validatePermissions,authController.toggleUserStatus)
export default router