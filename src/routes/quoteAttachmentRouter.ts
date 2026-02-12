import { Router } from "express";
import { AttachmentController } from "../controllers/quoteAttachmentController";
import { upload } from "../config/multerConfig";

const router = Router();

// get all attachments with search params (isActive, search)
router.get("/", AttachmentController.getAttachments);

// get attachment by ID
router.get("/:id", AttachmentController.getAttachmentById);

// Create new attachment
router.post("/", upload.single("file"), AttachmentController.createAttachment);

// Update attachment
router.put("/:id", upload.single("file"), AttachmentController.updateAttachment);

// Toggle isActive (active/inactive)
router.post("/:id", AttachmentController.toggleAttachmentActive);

// delete attachment by id
router.delete("/:id", AttachmentController.deleteAttachment);

export default router;
