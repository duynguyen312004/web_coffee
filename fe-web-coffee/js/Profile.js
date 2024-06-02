document.addEventListener('DOMContentLoaded', () => {
    loadCartDropdown();
    loadCustomerData();
    updateWallet();
    document.getElementById('full-name').addEventListener('input', updateCustomer);
    document.getElementById('address').addEventListener('input', updateCustomer);
    document.getElementById('save-infor-btn').addEventListener('click', saveCustomer);
});

function loadCustomerData() {
    const customerData = JSON.parse(sessionStorage.getItem('customer'));
    if (customerData) {
        // Hiển thị thông tin khách hàng lên trang
        document.getElementById('full-name').value = customerData.name || '';
        document.getElementById('phone').value = customerData.phone || '';
        document.getElementById('address').value = customerData.address || '';
        document.getElementById('profile-name').textContent = customerData.name || '';
        // document.getElementById('wallet').textContent = customerData.wallet ? customerData.wallet + ' đ' : '';
    } else {
        console.log('No customer data found in session storage');
    }
}

function updateCustomer() {
    const name = document.getElementById('full-name').value;
    const address = document.getElementById('address').value;
    const customerData = JSON.parse(sessionStorage.getItem('customer')) || {};

    // Cập nhật thông tin mới nhưng giữ nguyên các thông tin khác
    customerData.name = name;
    customerData.address = address;

    // Lưu lại vào sessionStorage
    sessionStorage.setItem('customer', JSON.stringify(customerData));
}

async function saveCustomer() {
    const name = document.getElementById('full-name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const customerData = JSON.parse(sessionStorage.getItem('customer')) || {};

    // Cập nhật thông tin mới nhưng giữ nguyên các thông tin khác
    customerData.name = name;
    customerData.address = address;
    customerData.phone = phone;

    try {
        const response = await axios.post('http://localhost:8080/api/update', customerData);
        if (response.status === 200) {
            sessionStorage.setItem('customer', JSON.stringify(customerData));
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

function formatPrice(price) {
    return parseInt(price * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '').trim();
}

function updateWallet() {
    const customerData = JSON.parse(sessionStorage.getItem('customer'));
    if (customerData && customerData.wallet) {
        document.getElementById('Wallet').textContent = "Ví của tôi: " + customerData.wallet + ' Đ';
    }
}

function loadCartDropdown() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const cartDropdown = document.getElementById('cart-dropdown');
    cartDropdown.innerHTML = ''; // Clear existing content

    if (cart.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Giỏ hàng của bạn đang trống';
        cartDropdown.appendChild(emptyMessage);
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('article');
        cartItem.classList.add('dropdown-item');
        cartItem.innerHTML = `
            <img src="data:image/jpeg;base64,${item.img_path}" alt="${item.name}" class="dropdown-item__thumb" />
            <section class="dropdown-item__info">
                <a href="../view/product-detail.html?id=${item.id}" class="dropdown-item__title">${item.name}</a>
                <p class="dropdown-item__desc">${formatPrice(item.price)} đ</p>
                <p class="dropdown-item__quantity">Số lượng: ${item.quantity}</p>
            </section>
        `;
        cartDropdown.appendChild(cartItem);
    });
}
