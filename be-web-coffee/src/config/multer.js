const multer = require('multer');
const path = require('path');

// Thiết lập lưu trữ ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'img-database')); // Đặt thư mục lưu trữ ảnh tải lên
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Đặt tên file là tên gốc của file
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
