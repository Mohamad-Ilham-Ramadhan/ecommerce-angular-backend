import express from 'express';
import bodyParser from 'body-parser';
import { db } from './database/db.js';
import { Admin } from './database/models/admin.js';
const app = express();
const port = 3000;

// Middleware for parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
}) 