document.addEventListener('DOMContentLoaded', () => {
    loadCustomerData();
    document.getElementById('full-name').addEventListener('input', updateCustomer);
    document.getElementById('address').addEventListener('input', updateCustomer);

});




function loadCustomerData() {
    const customerData = JSON.parse(localStorage.getItem('customer'));
    if (customerData) {
        // Hiển thị thông tin khách hàng lên trang
        document.getElementById('full-name').value = customerData.name;
        document.getElementById('phone').value = customerData.phone;
        document.getElementById('address').value = customerData.address;

        // Hiển thị thông tin ví (wallet)
        document.getElementById('wallet').textContent = customerData.wallet + ' đ';
    } else {
        console.log('No customer data found in local storage');
    }
}

function updateCustomer() {
    const name = document.getElementById('full-name').value;
    const address = document.getElementById('address').value;
    const customerData = JSON.parse(localStorage.getItem('customer')) || {};
    customerData.name = name;
    customerData.address = address;
    localStorage.setItem('customer', JSON.stringify(customerData));
    loadCustomerData();
}