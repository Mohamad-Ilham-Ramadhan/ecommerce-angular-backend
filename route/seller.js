import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import {Seller} from '../database/models/seller.js';
import { Product } from '../database/models/product.js';
import { getAuthToken } from '../utils/getAuthToken.js';
import { delayMiddleware } from '../middlewares/delayMiddleware.js';
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware.js';
import { db } from '../database/init.js';

// relations
Seller.hasMany(Product);
Product.belongsTo(Seller);


const secret = 'seller';

const upload = multer({dest: 'images/seller/'});
const sellerUpload = multer({storage: multer.diskStorage({
   destination: 'images/seller/',
   filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 10000);
      let filetype = file.originalname.slice(file.originalname.lastIndexOf('.'))
      cb(null, uniqueSuffix + filetype)
   }
})});
const productUpload = multer({storage: multer.diskStorage({
   destination: 'images/product/',
   filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 10000);
      let filetype = file.originalname.slice(file.originalname.lastIndexOf('.'))
      cb(null, uniqueSuffix + filetype)
   }
})});

const router = express.Router();


// list of sellers
router.get('/', verifyTokenMiddleware('admin'), async (req, res) => {
   // get all seller
   setTimeout(async () => {
      try {
         if (req.token.role === 'admin') {
            const sellers = await Seller.findAll();
            return res.json(sellers);
         } else {
            return res.status(401).json({message: "You're unauthorized bitch!"});
         }
      } catch (error) {
         return res.status(500).json({
            message: error,
         });
      }
   }, 1000)
});
router.post('/create', delayMiddleware(300), sellerUpload.single('image'), async (req, res) => {
   console.log('request', req.body)
   console.log('req.file', req.file);

   try {
      const newSeller = await Seller.create({
         name: req.body.name,
         email: req.body.email, 
         password: req.body.password,
         image: req.file?.filename
      });

      const token = jwt.sign({id: newSeller.id, role: 'seller'}, secret)
      
      return res.json({
         message: 'Create new seller, success!',
         seller: newSeller,
         token: token,
      })
   } catch (error) {
      console.log(error)
      if (fs.existsSync(`./images/seller/${req.file.filename}`)) {
         fs.promises.unlink(`./images/seller/${req.file.filename}`).then(val => {
            console.log('fs.promises.unlink ', val);
         })
      }
      return res.status(500).json({
         error,
         message: 'Something broken in the server!'
      })
   }
});
router.post('/login', sellerUpload.single('image'), async (req, res) => {
   setTimeout(async () => {
      console.log('login req.body', req.body)
      try {
         const seller = await Seller.findOne({
            where: {
               email: req.body.email,
               password: req.body.password,
            }
         });
         console.log('seller', seller)
         if (seller) {
            return res.json({
               seller, 
               token: jwt.sign({id: seller.id}, secret),
               message: "Login success!"
            })
         } else {
            return res.status(401).json({message: "Wrong credentials!, check your email or password, make sure it is correct."});
         }
      } catch (error) {
         console.log('/login catch error', error);
         res.status(500).json({
            message: 'Something broken in the server! asdf',
            error,
         })
      }
   }, 1000);
});
router.get('/find-one', delayMiddleware(1), verifyTokenMiddleware(secret), async (req, res) => {

   try {
      const seller = await Seller.findByPk(req.token.id);
      seller.password = null;
      const products = await seller.getProducts();
      return res.json({seller, products})
   } catch (error) {
      console.log('error', error.name, error.message);
      return res.status(500).json({message: 'Something wrong on the server.'})
   }
});
router.patch('/edit', delayMiddleware(300), verifyTokenMiddleware('seller'), sellerUpload.single('image'), async (req, res) => {
   try {
      let seller = await Seller.findByPk(req.token.id);
      
      if (req.file) {
         // delete existings photo
         if (fs.existsSync(`./images/seller/${seller.image}`)) {
            fs.promises.unlink(`./images/seller/${seller.image}`).then(val => {
               console.log('fs.promises.unlink ', val);
            })
         }
         await Seller.update({image: req.file.filename}, {where: {id: req.token.id}})
      }
       
      await Seller.update({
         name: req.body.name,
         email: req.body.email,
      }, {where: {id: req.token.id}})
      
      seller = await Seller.findByPk(req.token.id);
      return res.json({seller, message: 'testing'});
   } catch (error) {
      return res.status(500).json({message: 'Something wrong on the server!'});
   }

});
router.delete('/delete/:id', async (req, res) => {
   console.log('request.params', req.params)
   setTimeout(async () => {
      try {
         await Seller.destroy({
            where: {
               id: req.params.id
            }
         });
         const sellers = await Seller.findAll()
         res.json({
            message: 'Delete seller, success!',
            sellers
         })
      } catch (error) {
         res.status(500).json({
            message: 'Something broken in the server!'
         })
      }
   }, 1000)
});
router.delete('/truncate', async (req, res) => {
   try {
      await Seller.destroy({
            truncate: true,
         });
         // await Seller.destroy();
         const sellers = await Seller.findAll();
      res.json({
         message: 'Delete all success!',
         sellers
      })
   } catch (e) {
      res.status(500).json({
         message: 'Truncate failed!, problem in the server!'
      })
   }
});

// related with Product
router.get('/get-all-products', verifyTokenMiddleware(secret), async (req, res) => {
   try {
      const products = await Seller.findByPk(token.id).getProducts();
      return res.json(products);
   } catch (error) {
      return res.json(error);
   }
});
router.post('/create-product', delayMiddleware(1000), verifyTokenMiddleware(secret), productUpload.single('image'), async (req, res) => {
   await db.transaction( async t => {
      try {
   
         console.log('req.file', req.file);
         
         const seller = await Seller.findByPk(req.token.id);
         await seller.createProduct({
            name: req.body.name,
            description: req.body.description,
            stock: req.body.stock,
            price: req.body.price,
            image: req.file.filename,
         }, {transaction: t});
         return res.json({message: 'Create product success!'})
      } catch (error) {
         console.log('error', error)
         if (fs.existsSync(`./images/product/${req.file.filename}`)) {
            fs.promises.unlink(`./images/product/${req.file.filename}`).then(val => {
               console.log('fs.promises.unlink ', val);
            })
         }
         return res.status(500).json(error)
      }
   })

   // relationship save 
});
router.patch('/edit-product', delayMiddleware(1000), verifyTokenMiddleware(secret), productUpload.single('image'), async (req, res) => {

   try {

      console.log('req.file', req.file);
      
      const product = await Product.findByPk(req.body.id);

      if (req.file) {
         // delete existings photo
         if (fs.existsSync(`./images/product/${product.image}`)) {
            fs.promises.unlink(`./images/product/${product.image}`).then(val => {
               console.log('fs.promises.unlink ', val);
            })
         }
         // await Product.update({image: req.file.filename}, {where: {id: token.id}})
         await product.update({image: req.file.filename});
      }

      await product.update({
         name: req.body.name,
         description: req.body.description,
         stock: req.body.stock,
         price: req.body.price,
      });
      return res.json({message: 'Edit product success!'})
   } catch (error) {
      return res.json(error)
   }
});
router.get('/products', verifyTokenMiddleware(secret), async (req, res) => {
   try {

      const products = await (await Seller.findByPk(req.token.id)).getProducts();
      return res.json(products);
   } catch (error) {
      return res.status(500).json(error)
   }
});
router.delete('/delete-product', delayMiddleware(300), verifyTokenMiddleware(secret), async (req, res) => {
   try {
      const seller = await Seller.findByPk(req.token.id);
      const product = await Product.findByPk(req.body.productId);
      if (await seller.hasProduct(product)) {
         console.log('seller has product!')
         await product.destroy()
         const products = await seller.getProducts()
         console.log('/sellers/delete-product/', product.image)
         if (fs.existsSync(`./images/product/${product.image}`)) {
            fs.promises.unlink(`./images/product/${product.image}`).then(val => {
               console.log('fs.promises.unlink ', val);
            })
         }
         return res.json({
            message: 'Delete product success!',
            products,
         })
      }
      
      return res.status(500).json({
         message: "Seller doesn't has the product"
      })
   } catch (error) {
      console.log(error)
      return res.status(500).json(error)
   }
});


export default router;