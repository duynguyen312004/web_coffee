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


const handleAdminLogin = async (sdt, password) => {
    return new Promise(async (resolve, reject) => {
        let response = {};
        try {
            let exist = await checkAdminSdt(sdt);
            if (exist) {
                const result = await pool.query('SELECT * FROM admin WHERE phone = $1', [sdt]);
                if (result.rows.length > 0) {
                    let admin = result.rows[0];
                    if (admin.password === password) {
                        response.errCode = 0;
                        response.errMessage = "OK";
                        response.data = admin;
                    } else {
                        response.errCode = 3;
                        response.errMessage = "Wrong Password";
                    }
                }
                else {
                    response.errCode = 2;
                    response.errMessage = "Your Phone doesn't exist"
                }
            } else {
                response.errCode = 2;
                response.errMessage = "Your phone doesn't exist.";
            }
            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
}

const checkAdminSdt = async (sdt) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Sửa query để trả về kết quả đúng định dạng
            const result = await pool.query('SELECT * FROM admin WHERE phone = $1', [sdt]);
            if (result.rows.length > 0) resolve(true);
            else resolve(false);
        } catch (e) {
            console.error('Error in checkCusSdt:', e); // Log the error
            reject(e);
        }
    });
}

const handleCustomerLogin = async (sdt, password) => {
    return new Promise(async (resolve, reject) => {
        let response = {};
        try {
            let exist = await checkCusSdt(sdt);
            if (exist) {
                const result = await pool.query('SELECT * FROM customer WHERE phone = $1', [sdt]);
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

const getProductOtherInfor = async () => {
    try {
        let res = await pool.query("SELECT * FROM product WHERE category NOT ILIKE '%Cà Phê%' AND category NOT ILIKE '%Trà%'");
        return res.rows;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

const deleteProduct = async (productId) => {
    try {
        await pool.query("DELETE FROM product WHERE id = $1", [productId]);
        return {
            errCode: 0,
            message: "Deleted successfully"
        };
    } catch (e) {
        console.log('Error deleting: ', e);
        return {
            errCode: 1,
            message: "Error Deleting"
        }
    }
}

const deleteImageFile = async (filePath) => {
    try {
        await fs.unlinkSync(filePath);
    } catch (e) {
        console.log(e);
    }
}

const getCustomerById = async (customerId) => {
    try {
        let result = await pool.query("SELECT * FROM customer WHERE id = $1", [customerId]);
        return result.rows[0];
    } catch (e) {
        console.log(e);
    }
}

const createOrderService = async (customerId, items, receiverPhone, receiverAddress, receiverName) => {
    const client = await pool.connect();
    const shippingFee = 15; // phí ship 15000đ
    try {
        await client.query('BEGIN');
        const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0) + shippingFee;

        const orderResult = await client.query(
            `INSERT INTO "order" (date, total_price, customerid, receiver_phone, receiver_address, receiver_name)
             VALUES (NOW(), $1, $2, $3, $4, $5) RETURNING id`,
            [totalPrice, customerId, receiverPhone, receiverAddress, receiverName]
        );
        const orderId = orderResult.rows[0].id;
        //Thêm chi tiết đơn hàng
        for (const item of items) {
            await client.query(
                `INSERT INTO order_detail (unit_price, quantity, orderid, productid)
                 VALUES ($1, $2, $3, $4)`,
                [item.price, item.quantity, orderId, item.id]
            );
            // Cập nhật tồn kho sản phẩm (trigger trg_check_inventory sẽ kiểm tra tồn kho)
        }
        // Cập nhật số dư ví của khách hàng (trigger trg_deduct_wallet_after_order sẽ thực hiện điều này)
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === 'P0001') {
            throw new Error(error.message);
        } else {
            throw error;
        }
    } finally {
        client.release();
    }
}

module.exports = {
    getAllProduct,
    handleCustomerLogin,
    handleAdminLogin,
    handleCusRegister,
    handleUpdateCus,
    saveImageToDatabase,
    getProductInfor,
    getProductCoffeeInfor,
    getProductTeaInfor,
    getProductOtherInfor,
    deleteProduct,
    deleteImageFile,
    createOrderService,
    getCustomerById
}