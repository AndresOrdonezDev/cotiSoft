import { Request, Response } from "express";
import { db } from "../config/db"; // importa tu instancia de sequelize
import Quote from "../models/QuoteModel";
import QuoteProduct from "../models/QuoteProductModel";

export class quoteProductTransaction {
  static createQuoteWithProducts = async (req: Request, res: Response) => {
    const t = await db.transaction();
    try {
      const { client_id, notes, products, total } = req.body;
      const createdBy = req.user.username
      // 1. create quote
      const quote = await Quote.create(
        { client_id, notes, total, createdBy },
        { transaction: t }
      );

      // 2. insert product into quote
      const quoteProductsData = products.map((p: any) => ({
        quote_id: quote.id,
        product_id: p.product_id,
        price: p.price,
        quantity: p.quantity,
        tax: p.tax,
      }));

      await QuoteProduct.bulkCreate(quoteProductsData, { transaction: t });

      //confirm transaction
      await t.commit();

      return res.status(200).json({ message: "Cotización creada", quoteId: quote.id });
    } catch (error) {
      await t.rollback();
      console.error("Error al crear cotización con productos:", error);
      return res.status(500).json({
        message: "Error al crear cotización con productos",
      });
    }
  };

  static updateQuoteWithProducts = async (req: Request, res: Response) => {
    const t = await db.transaction();
    try {
      const { id } = req.params; // ID de la cotización a editar
      const { client_id, notes, products, total, status } = req.body;

      // 1️⃣ Verificar que la cotización exista
      const quote = await Quote.findByPk(id);
      if (!quote) {
        return res.status(404).json({ message: "Cotización no encontrada" });
      }

      // 2️⃣ Actualizar la información principal de la cotización
      await Quote.update(
        { client_id, notes, total, status },
        { where: { id }, transaction: t }
      );

      // 3️⃣ Eliminar los productos actuales asociados a la cotización
      await QuoteProduct.destroy({
        where: { quote_id: id },
        transaction: t,
      });

      // 4️⃣ Insertar los nuevos productos de la cotización
      const quoteProductsData = products.map((p: any) => ({
        quote_id: Number(id),
        product_id: p.product_id,
        price: p.price,
        quantity: p.quantity,
        tax: p.tax,
      }));

      await QuoteProduct.bulkCreate(quoteProductsData, { transaction: t });

      // 5️⃣ Confirmar la transacción
      await t.commit();

      return res
        .status(200)
        .json({ message: "Cotización actualizada", quoteId: id });
    } catch (error) {
      await t.rollback();
      console.error("Error al actualizar cotización con productos:", error);
      return res.status(500).json({
        message: "Error al actualizar cotización con productos",
      });
    }
  };

  static deleteQuoteWithProducts = async (req: Request, res: Response) => {
  const t = await db.transaction();
  try {
    const { id } = req.params; // ID de la cotización a eliminar

    // 1️⃣ Verificar que la cotización exista
    const quote = await Quote.findByPk(id);
    if (!quote) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    // 2️⃣ Eliminar los productos asociados a la cotización
    await QuoteProduct.destroy({
      where: { quote_id: id },
      transaction: t,
    });

    // 3️⃣ Eliminar la cotización
    await Quote.destroy({
      where: { id },
      transaction: t,
    });

    // 4️⃣ Confirmar la transacción
    await t.commit();

    return res.status(200).json({ message: "Cotización eliminada" });
  } catch (error) {
    await t.rollback();
    console.error("Error al eliminar cotización:", error);
    return res.status(500).json({
      message: "Error al eliminar la cotización",
    });
  }
};

}
