import { DataTypes } from "sequelize";
import { db } from "../db.js";

export const Admin = db.define(
   'Admin',
   {
      id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true
      },
      username: {
         type: DataTypes.STRING,
      },
      password: {
         type: DataTypes.STRING,
      },
      name: {
         type: DataTypes.STRING
      },
      email: {
         type: DataTypes.STRING
      }
   }
);

db.sync();