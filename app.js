import express from 'express';
import bodyParser from 'body-parser';
import { db } from './database/db.js';
import { relations } from './database/relations.js';
// route
import userRoute from './route/user.js';

db.sync()

const app = express();
const port = 3000;

// Middleware for parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// route [start]
app.use('/users', userRoute);
// route [end]

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/admin/create', async (req, res) => {
  const yancuk = Admin.build({
    username: 'admin',
    password: 'asdf1234',
    email: 'ilhamyancuk@gmail.com',
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