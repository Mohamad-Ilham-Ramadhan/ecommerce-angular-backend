import { DataTypes } from "sequelize";
import { db } from "../init.js";
import { Product } from "./product.js";
import { User } from './user.js';

export const Cart = db.define(
   'Cart',
   {
      id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true
      },
   }
);

export const CartProducts = db.define('CartProducts', {
   CartId: {
     type: DataTypes.INTEGER,
     references: {
       model: Cart, // 'Movies' would also work
       key: 'id',
     },
   },
   ProductId: {
     type: DataTypes.INTEGER,
     references: {
       model: Product, // 'Actors' would also work
       key: 'id',
     },
   },
   ProductCount: {
      type: DataTypes.INTEGER,
      allowNull: false
   }
});

Cart.hasOne(User);
User.belongsTo(Cart);
Cart.belongsToMany(Product, { through: CartProducts});
Product.belongsToMany(Cart, { through: CartProducts});
// db.sync();