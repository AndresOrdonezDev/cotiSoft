import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "clients",
    timestamps: true,
})
class Client extends Model {

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare identificationType: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare fullname: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare companyName: string;


    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare idNumber: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare contact: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare address: string;
    
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare department: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare city: string;
    
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    declare isActive: boolean;
}

export default Client;
