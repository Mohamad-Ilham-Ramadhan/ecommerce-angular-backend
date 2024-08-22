import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken'
import {Seller} from '../database/models/seller.js';

const secret = 'seller';

const upload = multer({dest: 'uploads/'})
const router = express.Router();

// list of sellers
router.get('/', async (req, res) => {
   const adminToken = req.headers.authorization.split(' ')[1];
   setTimeout(async () => {
      let token;
      try {
         token = jwt.verify(adminToken, 'admin');
      } catch (error) {
         return res.status(401).json({message: "You're unauthorized bitch!"});
      }
      try {
         if (token.role === 'admin') {
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

router.post('/create', upload.single('image'), async (req, res) => {
   console.log('request', req.body)
   console.log('req.file', req.file);
   setTimeout(async () => {
      try {
         const newSeller = await Seller.create({
            name: req.body.name,
            email: req.body.email, 
            password: req.body.password,
         })
         res.json({
            message: 'Create new seller, success!',
            seller: newSeller,
            token: jwt.sign({id: newSeller.id, role: 'seller'}, secret)
         })
      } catch (error) {
         res.status(500).json({
            message: 'Something broken in the server!'
         })
      }
   }, 1500)
});

router.post('/login', upload.single('image'), async (req, res) => {
   setTimeout(async () => {
      console.log('login req.body', req.body)
      try {
         const seller = await Seller.findOne({
            where: {
               email: req.body.email,
               password: req.body.password,
            }
         });
         res.json({seller, token: jwt.sign({id: seller.id}, secret)})
      } catch (error) {
         res.status(500).json({
            message: 'Something broken in the server! asdf',
            error,
         })
      }
   }, 1000);
});

router.get('/:id', async (req, res) => {
   console.log('req.params', req.params);
   setTimeout(async () => {
      try {
         const seller = await Seller.findByPk(req.params.id);
         console.log('seller by id', seller)
         return res.json(seller)
      } catch (error) {
         console.log(error)
      }
   }, 1000)
});

router.delete('/truncate', async (req, res) => {
   try {
      await Seller.destroy({
         truncate: true
      });
      res.json({
         message: 'Delete all success!'
      })
   } catch (e) {
      res.status(500).json({
         message: 'Delete failed!, problem in the server!'
      })
   }
});

router.delete('/:id', async (req, res) => {
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



export default router;