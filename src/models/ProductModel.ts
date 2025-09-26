import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "products",
  timestamps: true,
})
class Product extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productType: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare tax: number;
  
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare stock: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;
}

export default Product;
