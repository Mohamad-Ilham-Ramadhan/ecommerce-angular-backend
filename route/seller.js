import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import {Seller} from '../database/models/seller.js';
import { Product } from '../database/models/product.js';
import { getAuthToken } from '../utils/getAuthToken.js';

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

function verifyTokenMiddleware(secret) {
   return (req, res, next) => {
      let jwtError = null;
      let token = null;
      console.log('bearer token', getAuthToken(req.headers.authorization))
      // verify token
      jwt.verify(getAuthToken(req.headers.authorization), secret, function(error, decoded) {
         jwtError = error; token = decoded;
      });
   
      req.token = token;
      req.jwtError = jwtError;
      next();
   }
}

function delayMiddleware(miliseconds) {
   return (req, res, next) => {
      setTimeout(() => {
         next();
         console.log('delay executed');
      }, miliseconds);
   }
}

// list of sellers
router.get('/',verifyTokenMiddleware('admin'), async (req, res) => {
   // get all seller
   setTimeout(async () => {
      console.log('req.token', req.token);
      if (req.jwtError)  return res.status(401).json({message: "You're unauthorized bitch!"});
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
router.post('/create', sellerUpload.single('image'), async (req, res) => {
   console.log('request', req.body)
   console.log('req.file', req.file);

   setTimeout(async () => {
      try {
         const newSeller = await Seller.create({
            name: req.body.name,
            email: req.body.email, 
            password: req.body.password,
            image: req.file.filename
         });

         let jwtError = null;
         let token = null;
         jwt.sign({id: newSeller.id, role: 'seller'}, secret, function(err, encoded) {
            jwtError = err;
            token = encoded;
            if (jwtError) return res.status(401).json(jwtError);
            
            console.log('inside jwt.sign() callback just right before return res.json()');
            return res.json({
               message: 'Create new seller, success!',
               seller: newSeller,
               token,
            })
         });

         console.log('outside jwt.sign() callback')
      } catch (error) {
         return res.status(500).json({
            message: 'Something broken in the server!'
         })
      }
   }, 1500)
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
router.get('/find-one', verifyTokenMiddleware(secret), async (req, res) => {

   setTimeout(async () => {
      if (req.jwtError) return res.status(401).json(req.jwtError);

      try {
         const seller = await Seller.findByPk(req.token.id);
         seller.password = null;
         const products = await seller.getProducts();
         return res.json({seller, products})
      } catch (error) {
         console.log('error', error.name, error.message);
         return res.status(500).json({message: 'Something wrong on the server.'})
      }
   }, 1000)
});
router.patch('/edit', sellerUpload.single('image'), async (req, res) => {
   let jwtError = false;
   let token = undefined;
   // token verify
   jwt.verify(getAuthToken(req.headers.authorization), secret, function(error, decoded) {
      jwtError = error; 
      token = decoded; 
   });

   if (jwtError) {
      return res.status(401).json(jwtError)
   };

   try {
      const seller = await Seller.findByPk(token.id);
      
      // console.log('seller edit', seller);
   
      if (req.file) {
         // delete existings photo
         if (fs.existsSync(`./images/seller/${seller.image}`)) {
            fs.promises.unlink(`./images/seller/${seller.image}`).then(val => {
               console.log('fs.promises.unlink ', val);
            })
         }
         await Seller.update({image: req.file.filename}, {where: {id: token.id}})
      }
       
      await Seller.update({
         name: req.body.name,
         email: req.body.email,
      }, {where: {id: token.id}})
      
      console.log('outside fs.unlink')
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
router.get('/get-all-products', async (req, res) => {
   let jwtError;
   let token;
   // verify token
   jwt.verify(getAuthToken(req.headers.authorization), secret, function(error, decoded) {
      jwtError = error; token = decoded;
   });

   if (jwtError) return res.status(401).json(jwtError);
   
   try {
      const products = await Seller.findByPk(token.id).getProducts();
      return res.json(products);
   } catch (error) {
      return res.json(error);
   }
});
router.post('/create-product', delayMiddleware(1000), productUpload.single('image'), async (req, res) => {
   let jwtError = null;
   let token = null;
   console.log('bearer token', getAuthToken(req.headers.authorization))
   // verify token
   jwt.verify(getAuthToken(req.headers.authorization), secret, function(error, decoded) {
      jwtError = error; token = decoded;
   });
   
   console.log('jwtError', jwtError)
   console.log('decoded token', token)
   if (jwtError) {
      if (fs.existsSync(`./images/product/${req.file.filename}`)) {
         fs.promises.unlink(`./images/product/${req.file.filename}`).then(val => {
            console.log('fs.promises.unlink ', val);
         })
      }
      return res.status(401).json(jwtError)
   };

   try {

      console.log('req.file', req.file);
      
      const seller = await Seller.findByPk(token.id);
      await seller.createProduct({
         name: req.body.name,
         description: req.body.description,
         stock: req.body.stock,
         price: req.body.price,
         image: req.file.filename,
      });
      console.log('seller.getProducts()', await seller.countProducts())
      return res.json({message: 'Create product success!'})
   } catch (error) {
      return res.json(error)
   }

   // relationship save 
});
router.patch('/edit-product', delayMiddleware(1000), verifyTokenMiddleware(secret), productUpload.single('image'), async (req, res) => {
 
   if (req.jwtError) {
      if (req.file && fs.existsSync(`./images/product/${req.file.filename}`)) {
         fs.promises.unlink(`./images/product/${req.file.filename}`).then(val => {
            console.log('fs.promises.unlink ', val);
         })
      }
      return res.status(401).json(req.jwtError)
   };

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
   // verify token 
   if (req.jwtError) return res.status(401).json(req.jwtError);

   try {

      const products = await (await Seller.findByPk(req.token.id)).getProducts();
      return res.json(products);
   } catch (error) {
      return res.status(500).json(error)
   }
});
router.delete('/delete-product',delayMiddleware(1000), verifyTokenMiddleware(secret), async (req, res) => {
   if (req.jwtError) return res.status(401).json(req.jwtError);

   try {
      const seller = await Seller.findByPk(req.token.id);
      const product = await Product.findByPk(req.body.productId);
      if (await seller.hasProduct(product)) {
         console.log('seller has product!')
         await product.destroy()
         const products = await seller.getProducts()
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