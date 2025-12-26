import multer from "multer";
import path from "path";
import { Request } from "express";

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, path.join(__dirname, "../public/attachment"));
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Generar nombre único con timestamp
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
    }
});

// Filtro de archivos (opcional - puedes agregar validaciones de tipo)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Aceptar solo ciertos tipos de archivos si lo deseas
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Tipo de archivo no permitido"));
    }
};

// Configuración de multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Límite de 10MB por archivo
    }
});