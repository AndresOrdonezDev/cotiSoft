import { Router } from "express";
import { AttachmentController } from "../controllers/quoteAttachmentController";
import { upload } from "../config/multerConfig";

const router = Router();

// Listar todos los adjuntos con filtros (isActive, search)
router.get("/", AttachmentController.getAttachments);

// Obtener un adjunto por ID
router.get("/:id", AttachmentController.getAttachmentById);

// Crear un adjunto (con archivo)
router.post("/", upload.single("file"), AttachmentController.createAttachment);

// Actualizar un adjunto (archivo opcional)
router.put("/:id", upload.single("file"), AttachmentController.updateAttachment);

// Toggle isActive (activar/desactivar)
router.post("/:id", AttachmentController.toggleAttachmentActive);

// Eliminar un adjunto (opcional - si quieren eliminar físicamente)
router.delete("/:id", AttachmentController.deleteAttachment);

export default router;
