import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
// route
import userRoute from './route/user.js';
import sellerRoute from './route/seller.js';
import adminRoute from './route/admin.js';
import productRouter from './route/product.js';

const app = express();
const port = 3000;
const upload = multer({dest: 'uploads/'})

app.use(cors())
// Middleware for parsing request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());

// route [start]
app.use(express.static('images'))
app.use(express.static('uploads'))
app.use('/users', userRoute);
app.use('/sellers', sellerRoute);
app.use('/admin', adminRoute);
app.use('/products', productRouter);
// route [end]

app.get('/', (req, res) => {
  res.json({
    id: '1', 
    name: 'ilham ganteng',
    email: 'ilham@ganteng.com',
  })
});

app.post('/', upload.single('image'), (req, res) => {
  console.log('admin post', req.body);
  res.send(req.body)
});
import { Admin } from './database/models/admin.js';
app.get('/admin/create', async (req, res) => {
  const yancuk = Admin.build({
    username: 'admin',
    password: 'admin',
    email: 'admin@admin.com',
    name: 'Ilham Yancuk',
  })
  await yancuk.save();
  console.log('Yancuk was saved to database');
  res.send('Yancuk was saved to database')
})

app.get('/product-review/create', async (req, res) => {
  const pr = ProductReview.build({
    review: 'Seger nih',
    rate: 6,
  })
  try {
    await pr.save();
    console.log('the review was saved to database');
    res.send('the review was saved to database')
    
  } catch (err) {
    console.log('error', err)
    res.send('ERROR COY')
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
}) 