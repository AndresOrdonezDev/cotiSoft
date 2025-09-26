import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import Quote from "./QuoteModel";
import Product from "./ProductModel";

@Table({
  tableName: "quote_products",
  timestamps: true,
})
class QuoteProduct extends Model {
  @ForeignKey(() => Quote)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quote_id: number;
  @BelongsTo(() => Quote)
  declare quote: Quote;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare product_id: number;
  @BelongsTo(() => Product)
  declare products: Product;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quantity: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare tax: number;
}

export default QuoteProduct;
