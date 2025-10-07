import { Request, Response } from "express";
import { db } from "../config/db"; // importa tu instancia de sequelize
import Quote from "../models/QuoteModel";
import QuoteProduct from "../models/QuoteProductModel";

export class quoteProductTransaction {
  static createQuoteWithProducts = async (req: Request, res: Response) => {
    const t = await db.transaction();
    try {
      const { client_id, notes, products, total } = req.body;
      
      // 1. create quote
      const quote = await Quote.create(
        { client_id, notes,total },
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
      
      return res.status(200).json({message: "Cotización creada",quoteId:quote.id});
    } catch (error) {
      await t.rollback();
      console.error("Error al crear cotización con productos:", error);
      return res.status(500).json({
        message: "Error al crear cotización con productos",
      });
    }
  };
}
