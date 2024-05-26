
const { getAllProduct, handleCustomerLogin, handleCusRegister, handleUpdateCus } = require('../services/CRUDservices');

const getHomePage = async (req, res) => {
    let products = await getAllProduct();
    return res.json(products);
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
    let wallet = 0;
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
    let cusId = req.body.cusId;
    let name = req.body.name;
    let address = req.body.address;
    if (!cusId || !name || !address) {
        return res.status(400).json({
            errCode: 1,
            message: "Missing parameters"
        })
    }
    try {
        await handleUpdateCus(cusId, name, address);
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

module.exports = {
    getHomePage,
    handleLogin,
    handleRegister,
    handleUpdate
}