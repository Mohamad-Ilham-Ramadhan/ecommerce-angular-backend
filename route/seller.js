import express from 'express';
import multer from 'multer';
import {Seller} from '../database/models/seller.js'

const upload = multer({dest: 'uploads/'})
const router = express.Router();

router.get('/', async (req, res) => {
   const sellers = await Seller.findAll();
   res.json(sellers);
});

router.post('/create', upload.single('image'), async (req, res) => {
   console.log('request', req.body)

   try {
      const newSeller = await Seller.create({
         name: req.body.name,
         email: req.body.email, 
         password: req.body.password,
      })
      res.json({
         message: 'Create new seller, success!',
         seller: newSeller,
      })
   } catch (error) {
      res.status(500).json({
         message: 'Something broke!'
      })
   }
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



export default router;