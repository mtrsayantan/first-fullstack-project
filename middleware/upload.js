const multer = require('multer');
const path = require('path');
//image
var Storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function(req, file, cb) {
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
});
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);    
    }else{
        req.errMimetype = 'wrong mimetype'
        cb(null, false, req.errMimetype);
    }
};
const upload = multer({
    storage: Storage,
    fileFilter: fileFilter
}).single('file');

module.exports = upload;
 