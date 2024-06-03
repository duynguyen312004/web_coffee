const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const getAllProduct = async () => {
    try {
        const res = await pool.query('SELECT * FROM product');
        return res.rows;
    } catch (err) {
        console.error('Query error:', err);
        throw err;
    }
}


const handleCustomerLogin = async (sdt, password) => {
    return new Promise(async (resolve, reject) => {
        let response = {};
        try {
            let exist = await checkCusSdt(sdt);
            if (exist) {
                const result = await pool.query('SELECT id, phone, password, wallet, address, name FROM customer WHERE phone = $1', [sdt]);
                if (result.rows.length > 0) {
                    let customer = result.rows[0];
                    if (customer.password === password) {
                        response.errCode = 0;
                        response.errMessage = "OK";
                        response.data = customer;
                    } else {
                        response.errCode = 3;
                        response.errMessage = "Wrong Password";
                    }
                } else {
                    response.errCode = 2;
                    response.errMessage = "Your phone isn't exist.";
                }
            } else {
                response.errCode = 2;
                response.errMessage = "Your phone isn't exist.";
            }
            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
}

const checkCusSdt = async (sdt) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Sửa query để trả về kết quả đúng định dạng
            const result = await pool.query('SELECT * FROM customer WHERE phone = $1', [sdt]);
            if (result.rows.length > 0) resolve(true);
            else resolve(false);
        } catch (e) {
            console.error('Error in checkCusSdt:', e); // Log the error
            reject(e);
        }
    });
}

const handleCusRegister = async (cusProfile) => {
    return new Promise(async (resolve, reject) => {
        try {
            await pool.query('INSERT INTO customer (phone, password, name, address, wallet) VALUES ($1, $2, $3, $4, $5)',
                [cusProfile.sdt, cusProfile.password, cusProfile.name, cusProfile.address, cusProfile.wallet]);
            resolve();
        } catch (e) {
            reject(e)
        }
    })
}

const handleUpdateCus = async (phone, name, address) => {
    try {
        await pool.query("UPDATE customer SET name = $1, address = $2 WHERE phone = $3", [name, address, phone]);
    } catch (error) {
        throw error;
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

const saveImageToDatabase = async (pool, productId, filePath) => {
    try {
        const base64Image = await fileToBase64(filePath);
        const query = 'UPDATE product SET img_path = ($1) WHERE id = ($2)';
        const values = [base64Image, productId];
        await pool.query(query, values);
        console.log('Image saved to database successfully for ID: ', productId);
    } catch (error) {
        console.error('Error saving image to database:', error);
    }
};

const getProductInfor = async (productId) => {

    try {
        let res = await pool.query("SELECT * FROM product WHERE id = $1", [productId]);
        return res.rows;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

const getProductCoffeeInfor = async () => {
    try {
        let res = await pool.query("SELECT * FROM product WHERE category ILIKE '%Cà Phê%'");
        return res.rows;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

const getProductTeaInfor = async () => {
    try {
        let res = await pool.query("SELECT * FROM product WHERE category ILIKE '%Trà%'");
        return res.rows;
    } catch (e) {
        console.log(e);
        throw e;
    }
}


module.exports = {
    getAllProduct,
    handleCustomerLogin,
    handleCusRegister,
    handleUpdateCus,
    saveImageToDatabase,
    getProductInfor,
    getProductCoffeeInfor,
    getProductTeaInfor
}