import { Sequelize } from "sequelize-typescript";
import colors from 'colors'
import dotenv from 'dotenv'
dotenv.config()
export const db = new Sequelize(process.env.DB_URL!,
    {
        models: [__dirname + '/../models/**/*'],
        logging:false
    }
    
)
async function connectDB(){
    try {
        await db.authenticate()
        db.sync()
        console.log(colors.bgMagenta('The connection to the db was successful'));
        
    } catch (error) {
        console.log(error);
        
    }
}

export default connectDB