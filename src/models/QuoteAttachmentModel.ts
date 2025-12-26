import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "Attachment",
    timestamps: true
})
class Attachment extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare name: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        comment: "1: Producto, 2: Servicio, 3: Productos y Servicios"
    })
    declare attachmentType: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare url: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true
    })
    declare isActive: boolean;
}

export default Attachment;