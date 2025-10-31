import { Table, Column, Model, DataType, ForeignKey} from "sequelize-typescript";
import Client from "./ClientModel";

@Table({
    tableName:"EmailClient",
    timestamps:true
})
class EmailClient extends Model{
    @ForeignKey(() => Client)
    @Column({
        type:DataType.INTEGER,
        allowNull:false
    })
    declare client_id: number;

    @Column({
        type:DataType.STRING,
        allowNull:false
    })
    declare email: string
}
export default EmailClient