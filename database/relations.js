import { db } from "./init.js";
import { Admin } from './models/admin.js';
import { Seller } from "./models/seller.js";
import { Product } from "./models/product.js";
import { ProductReview } from "./models/productReview.js";
import { User } from "./models/user.js";

export const relations = () => {
   // associations/relations
   Seller.hasMany(Product);
   Product.belongsTo(Seller);
   
   Product.hasMany(ProductReview);
   ProductReview.belongsTo(Product);
   
   User.hasOne(ProductReview);
   ProductReview.belongsTo(User);

   console.log('creating relationship')
}

db.sync();
