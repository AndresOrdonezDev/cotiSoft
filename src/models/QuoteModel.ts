import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import Client from "./ClientModel";
import QuoteProduct from "./QuoteProductModel";

@Table({
  tableName: "quotes",
  timestamps: true,
})
class Quote extends Model {
  @ForeignKey(() => Client)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare client_id: number;

  @BelongsTo(() => Client)
  declare client: Client;

  @HasMany(() => QuoteProduct)
  declare quoteProducts: QuoteProduct[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare total: number;

  @Column({
    type: DataType.STRING,
    defaultValue:"Pendiente"
  })
  declare status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string;
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare createdBy: string;
}

export default Quote;
