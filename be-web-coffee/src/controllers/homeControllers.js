const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { getAllProduct, handleCustomerLogin,
    handleCusRegister, handleUpdateCus, saveImageToDatabase, getProductInfor,
    getProductCoffeeInfor, getProductTeaInfor,
    getProductOtherInfor, handleAdminLogin, deleteProduct, deleteImageFile,
    createOrderService, getCustomerById, getProductCoffeeInforSorted,
    searchProductsByNameFromDB,
    getProductTeaInforSorted,
    getProductOtherInforSorted,
    updateProduct, addProduct, getOrdersByDateRange } = require('../services/CRUDservices');
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
        return res.status(400).json({
            errCode: 1,
            message: "Missing input parameters",
        });
    }
    try {
        let account = await handleAdminLogin(sdt, password);
        if (account.errCode === 2) {
            account = await handleCustomerLogin(sdt, password);
        }
        return res.status(200).json({
            errCode: account.errCode,
            message: account.errMessage,
            data: account.data ? account.data : {}
        });
    } catch (e) {
        res.status(500).json({ message: 'Internal server error' });
    }
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

const getProductOther = async (req, res) => {
    try {
        let products = await getProductOtherInfor();
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

const handleDeleteProduct = async (req, res) => {
    try {
        let productId = req.params.id;
        const product = await getProductInfor(productId);
        if (product.length > 0) {
            const imgFileName = imageFileMapping[productId];
            const imgFilePath = path.join(__dirname, '..', 'img-database', imgFileName);

            await deleteProduct(productId);
            await deleteImageFile(imgFilePath);
            return res.status(200).json({ message: "Product deleted successfully" });
        } else {
            return res.status(404).json({ message: "Cannot find product" });
        }
    } catch (e) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

const createOrder = async (req, res) => {
    const { customerId, items, receiverPhone, receiverAddress, receiverName } = req.body;
    try {
        await createOrderService(customerId, items, receiverPhone, receiverAddress, receiverName);
        const customer = await getCustomerById(customerId);
        return res.status(200).json({ message: "Đặt hàng thành công!", customer });
    } catch (error) {
        console.log("Đặt hàng thất bại: ", error);
        if (error.message.includes('Số dư ví không đủ') || error.message.includes('Không đủ tồn kho cho sản phẩm')) {
            return res.status(400).json({
                message: error.message
            })
        } else {
            return res.status(500).json({ message: "Đặt hàng thất bại" });
        }
    }
}

const getProductCoffeeSorted = async (req, res) => {
    try {
        const sortType = req.query.sort || 'name';
        const products = await getProductCoffeeInforSorted(sortType);
        res.json(products);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const searchProductsByName = async (req, res) => {
    try {
        const name = req.query.name || '';
        const products = await searchProductsByNameFromDB(name);
        res.json(products);
    } catch (error) {
        console.error('Error searching products by name:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getProductTeaSorted = async (req, res) => {
    try {
        const sortType = req.query.sort || 'name';
        const products = await getProductTeaInforSorted(sortType);
        res.json(products);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const getProductOtherSorted = async (req, res) => {
    try {
        const sortType = req.query.sort || 'name';
        const products = await getProductOtherInforSorted(sortType);
        res.json(products);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const handleUpdateProduct = async (req, res) => {
    try {
        let productId = req.params.id;
        let { name, price, inventory, category, description } = req.body;

        await updateProduct(productId, { name, price, inventory, category, description });

        return res.status(200).json({ message: "Product updated successfully" });
    } catch (e) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

const fileToBase64 = file => new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
        if (err) {
            reject(err);
        } else {
            const base64Data = data.toString('base64');
            resolve(base64Data);
        }
    });
});

const handleAddProduct = async (req, res) => {
    try {
        const { name, price, inventory, category, description } = req.body;
        // Kiểm tra các trường bắt buộc
        if (!name || !price || !inventory || !category || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Kiểm tra xem req.file có tồn tại không
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }
        // Sử dụng đường dẫn của ảnh thay vì buffer
        const imgPath = path.resolve(__dirname, '..', 'img-database', req.file.filename);
        console.log(`Image Path: ${imgPath}`);
        const imgBase64 = await fileToBase64(imgPath);
        console.log(`Image Base64: ${imgBase64.substring(0, 30)}...`);
        const result = await addProduct({ name, price, inventory, category, description, imgBase64 });
        console.log(`Database Result: ${JSON.stringify(result)}`);
        res.status(200).json({ message: "Product added successfully", data: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getOrder = async (req, res) => {
    const { start, end } = req.query;

    try {
        const orders = await getOrdersByDateRange(start, end);
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
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
    getProductTea,
    getProductOther,
    handleDeleteProduct,
    createOrder,
    getProductCoffeeSorted,
    searchProductsByName,
    getProductTeaSorted,
    getProductOtherSorted,
    handleUpdateProduct,
    handleAddProduct,
    getOrder
}