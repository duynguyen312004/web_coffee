const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { getAllProduct, handleCustomerLogin, handleCusRegister, handleUpdateCus, saveImageToDatabase, getProductInfor, getProductCoffeeInfor, getProductTeaInfor } = require('../services/CRUDservices');
const { error } = require('console');

const imageFileMapping = {
    1: 'Phin Sữa Tươi Bánh Flan.webp',
    2: 'Trà Xanh Espresso Marble.webp',
    3: 'Đường Đen Sữa Đá.webp',
    4: 'The Coffee House Sữa Đá.webp',
    5: 'Cà Phê Sữa Đá.webp',
    6: 'Cà Phê Sữa Nóng.webp',
    7: 'Bạc Sỉu.webp',
    8: 'Bạc Sỉu Nóng.webp',
    9: 'Cà Phê Đen Đá.jpg',
    10: 'Cà Phê Đen Nóng.webp',
    11: 'Cà Phê Sữa Đá Chai Fresh 250ML.webp',
    12: 'Đường Đen Marble Latte.webp',
    13: 'Caramel Macchiato Đá.webp',
    14: 'Caramel Macchiato Nóng.webp',
    15: 'Latte Đá.webp',
    16: 'Latte Nóng.webp',
    17: 'Americano Đá.webp',
    18: 'Cappuccino Nóng.webp',
    19: 'Espresso Đá.webp',
    20: 'Espresso Nóng.webp',
    21: 'Cold Brew Phúc Bồn Tử.webp',
    22: 'Cold Brew Sữa Tươ.webp',
    23: 'Cold Brew Truyền Thống.webp',
    24: 'Oolong Tứ Quý Kim Quất Trân Châu.webp',
    25: 'Oolong Tứ Quý Vải.webp',
    26: 'Trà Đào Cam Sả - Đá.webp',
    27: 'Trà Đào Cam Sả - Nóng.webp',
    28: 'Trà Hạt Sen - Đá.webp',
    29: 'Trà Hạt Sen - Nóng.webp',
    30: 'Trà Đào Cam Sả Chai Fresh 500ML.webp',
    31: 'Hồng Trà Sữa Trân Châu.webp',
    32: 'Trà Đen Macchiato.webp',
    33: 'Hồng Trà Sữa Nóng.webp',
    34: 'Trà sữa Oolong Nướng Trân Châu.webp',
    35: 'Trà sữa Oolong Nướng (Nóng.webp',
    36: 'Trà Sữa Oolong Nướng Trân Châu Chai Fresh 500ML.webp',
    37: 'CloudFee Hạnh Nhân Nướng.webp',
    38: 'CloudFee Caramel.webp',
    39: 'CloudFee Hà Nội.webp',
    40: 'CloudTea Oolong Berry.webp',
    41: 'CloudTea Trà Xanh Tây Bắc.webp',
    42: 'Hi-Tea Đào Kombucha.webp',
    43: 'Hi-Tea Yuzu Kombucha.webp',
    44: 'Hi-Tea Yuzu Trân Châu.webp',
    45: 'Trà Xanh Latte.webp',
    46: 'Trà Xanh Latte (Nóng).webp',
    47: 'Trà Xanh Đường Đen.webp',
    48: 'Frosty Trà Xanh.webp',
    49: 'Chocolate Nóng.webp',
    50: 'Chocolate Đá.webp',
    51: 'Smoothie Xoài Nhiệt Đới Granola.webp',
    52: 'Smoothie Phúc Bồn Tử Granola.webp',
    53: 'Frosty Phin-Gato.png',
    54: 'Frosty Cà Phê Đường Đen.webp',
    55: 'Frosty Caramel Arabica.webp',
    56: 'Frosty Bánh Kem Dâu.webp',
    57: 'Frosty Choco Chip.webp',
    58: 'Bánh Mì Que Pate.webp',
    59: 'Bánh Mì Que Pate Cay.webp',
    60: 'Bánh Mì VN Thịt Nguội.webp',
    61: 'Croissant trứng muối.webp',
    62: 'Butter Croissant Sữa Đặc.webp',
    63: 'Chà Bông Phô Mai.webp',
    64: 'Mochi Kem Phúc Bồn Tử.webp',
    65: 'Mochi Kem Việt Quất.webp',
    66: 'Mochi Kem Dừa Dứa.webp',
    67: 'Mochi Kem Chocolate.webp',
    68: 'Mochi Kem Matcha.webp',
    69: 'Mochi Kem Xoài.webp',
    70: 'Mousse Tiramisu.webp',
    71: 'Mousse Gấu Chocolate.webp',
    72: 'Butter Croissant.webp',
    73: 'Choco Croffle.webp',
    74: 'Pate Chaud.webp',
    75: 'Cà Phê Đen Đá Túi (30 gói x 16g).webp',
    76: 'Cà Phê Sữa Đá Hòa Tan (10 gói x 22g).webp',
    77: 'Cà Phê Sữa Đá Hòa Tan Túi 25x22G.webp',
    78: 'Cà Phê Hoà Tan Đậm Vị Việt (18 gói x 16 gam).webp',
    79: 'Cà Phê Sữa Đá Pack 6 Lon.webp',
    80: 'Thùng 24 Lon Cà Phê Sữa Đá.jpg'
};
const getHomePage = async (req, res) => {
    let products = await getAllProduct();
    return res.json(products);
}

const getProduct = async (req, res) => {
    try {
        let productId = req.params.id;
        let product = await getProductInfor(productId);
        if (product.length > 0) {
            return res.json(product[0]);
        } else {
            return res.status(404).json({ message: "Product not found" });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Interal server error" });
    }
}

const handleLogin = async (req, res) => {
    let sdt = req.body.sdt;
    let password = req.body.password;
    if (!sdt || !password) {
        return res.status(500).json({
            errCode: 1,
            message: "Missing input parameters",
        })
    }

    let customer = await handleCustomerLogin(sdt, password);
    return res.status(200).json({
        errCode: customer.errCode,
        message: customer.errMessage,
        customer: customer.data ? customer.data : {}
    });
}

const handleRegister = async (req, res) => {
    let sdt = req.body.sdt;
    let password = req.body.password;
    let address = req.body.address;
    let name = req.body.name;
    let wallet = 1000000;
    if (!sdt || !password || !address || !name) {
        return res.status(500).json({
            errCode: 1,
            message: "Missing parameters",
        })
    }
    let cusProfile = {
        sdt, password, address, name, wallet
    }
    await handleCusRegister(cusProfile);
    return res.status(200).json({
        errCode: 0,
        message: "Đăng ký thành công",
    })
}

const handleUpdate = async (req, res) => {
    let phone = req.body.phone;
    let name = req.body.name;
    let address = req.body.address;
    if (!phone || !name || !address) {
        return res.status(400).json({
            errCode: 1,
            message: "Missing parameters"
        })
    }
    try {
        await handleUpdateCus(phone, name, address);
        return res.status(200).json({
            errCode: 0,
            message: "Update thành công",
        })
    }
    catch (e) {
        return res.status(500).json({
            errCode: 2,
            message: "Error Updating Customer",
        })
    }
}
const loadImagesToDatabase = async () => {
    try {
        // Directory containing the images
        const directoryPath = path.join(__dirname, '..', 'img-database');

        for (const productId in imageFileMapping) {
            const file = imageFileMapping[productId];
            const filePath = path.join(directoryPath, file);
            await saveImageToDatabase(pool, productId, filePath); // Ensure to pass the pool
        }

        console.log('All images loaded and saved to the database successfully.');
    } catch (error) {
        console.error('Error loading and saving images to the database:', error);
    }
};

const getProductCoffee = async (req, res) => {
    try {
        let products = await getProductCoffeeInfor();
        if (products.length > 0) {
            return res.json(products);
        } else {
            return res.status(404).json({ message: "Product not found" });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getProductTea = async (req, res) => {
    try {
        let products = await getProductTeaInfor();
        if (products.length > 0) {
            return res.json(products);
        } else {
            return res.status(404).json({ message: "Product not found" });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getHomePage,
    handleLogin,
    handleRegister,
    handleUpdate,
    loadImagesToDatabase,
    getProduct,
    getProductCoffee,
    getProductTea
}