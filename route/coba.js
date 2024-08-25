import fs from 'fs';

fs.unlink('./uploads/gaby-rosse.jpg', function(err) {
   if (err) {
      throw err;
   }
   console.log('deleted?')
});