const pool = require('../config/database');

const getAllCustomer = async () => {
    try {
        const res = await pool.query('SELECT * FROM product');
        return res.rows;
    } catch (err) {
        console.error('Query error:', err);
    }
}

const handleCustomerLogin = async (sdt, password) => {
    return new Promise(async (resolve, reject) => {
        let response = {};
        try {
            let exist = await checkCusSdt(sdt);
            if (exist) {
                const result = await pool.query('SELECT id, phone, password FROM customer WHERE phone = $1', [sdt]);
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

const handleUpdateCus = async (cusId, name, address) => {
    try {
        await pool.query("UPDATE customer SET name = $1, address = $2 WHERE id = $3", [name, address, cusId]);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllCustomer,
    handleCustomerLogin,
    handleCusRegister,
    handleUpdateCus
}