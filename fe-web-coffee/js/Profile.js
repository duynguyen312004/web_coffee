document.addEventListener('DOMContentLoaded', () => {
    loadCustomerData();
    document.getElementById('full-name').addEventListener('input', updateCustomer);
    document.getElementById('address').addEventListener('input', updateCustomer);
    document.getElementById('save-infor-btn').addEventListener('click', saveCustomer);
});

function loadCustomerData() {
    const customerData = JSON.parse(localStorage.getItem('customer'));
    if (customerData) {
        // Hiển thị thông tin khách hàng lên trang
        document.getElementById('full-name').value = customerData.name || '';
        document.getElementById('phone').value = customerData.phone || '';
        document.getElementById('address').value = customerData.address || '';
        document.getElementById('profile-name').textContent = customerData.name || '';
        // document.getElementById('wallet').textContent = customerData.wallet ? customerData.wallet + ' đ' : '';
    } else {
        console.log('No customer data found in local storage');
    }
}

function updateCustomer() {
    const name = document.getElementById('full-name').value;
    const address = document.getElementById('address').value;
    const customerData = JSON.parse(localStorage.getItem('customer')) || {};

    // Cập nhật thông tin mới nhưng giữ nguyên các thông tin khác
    customerData.name = name;
    customerData.address = address;

    // Lưu lại vào localStorage
    localStorage.setItem('customer', JSON.stringify(customerData));
}

async function saveCustomer() {
    const name = document.getElementById('full-name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const customerData = JSON.parse(localStorage.getItem('customer')) || {};

    // Cập nhật thông tin mới nhưng giữ nguyên các thông tin khác
    customerData.name = name;
    customerData.address = address;
    customerData.phone = phone;

    try {
        const response = await axios.post('http://localhost:8080/api/update', customerData);
        if (response.status === 200) {
            localStorage.setItem('customer', JSON.stringify(customerData));
            loadCustomerData();
            alert('Thông tin đã được lưu thành công!');
            window.location.reload();
        } else {
            alert('Đã xảy ra lỗi khi lưu thông tin.');
        }
    } catch (error) {
        console.error('Error saving customer data:', error);
        alert('Đã xảy ra lỗi khi lưu thông tin.');
    }
}
