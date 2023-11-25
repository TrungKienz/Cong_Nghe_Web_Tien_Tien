const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    console.log(req.files);
    // fs.rename(oldpath, newpath, function (err) {
    //   if (err) throw err;
    res.write('File uploaded and moved!');
    return res.end();
    // });
    // });
});
module.exports = router;
