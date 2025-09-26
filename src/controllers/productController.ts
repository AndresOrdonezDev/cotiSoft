import { Request, Response } from "express";
import Product from "../models/ProductModel";

export class productController {
    static createProduct = async (req: Request, res: Response) => {
        try {
            await Product.create(req.body)
            return res.status(200).json({ message: "Producto creado" })
        } catch (error) {
            console.error("Error to create product:", error);
            res.status(500).json({ message: "Error al crear el producto" });
            return;
        }
    }
    static getProducts = async (req: Request, res: Response) => {
        try {
            const products = await Product.findAll({
                order: [["createdAt", "DESC"]],
                limit: 10
            });
            res.json(products);
        } catch (error) {
            console.error("Error to get products:", error);
            res.status(500).json({ message: "Error al listar productos" });
            return;
        }
    }
    static getProductById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const productFound = await Product.findByPk(id)
            res.json(productFound);
        } catch (error) {
            console.error("Error to get products:", error);
            res.status(500).json({ message: "Error al listar productos" });
            return;
        }
    }

    static updateProduct = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            const [updated] = await Product.update(req.body, {
                where: { id },
            });

            if (updated === 0) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }
            return res.status(200).json({ message: "Producto actualizado" });
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            return res.status(500).json({ message: "Error al actualizar el producto" });
        }
    }

    static toggleProductStatus = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }
            product.isActive = !product.isActive;
            await product.save();
            return res.status(200).json({
                message: `se ${product.isActive ? 'activó':'desactivó'} el producto`})
        } catch (error) {
            console.error("Error al cambiar estado del producto:", error);
            return res.status(500).json({ message: "Error al cambiar estado del producto" });
        }
    }
}