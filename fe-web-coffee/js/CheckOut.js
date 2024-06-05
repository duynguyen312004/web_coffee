document.addEventListener("DOMContentLoaded", function () {
    updateCartDisplay();
    loadCartDropdown();
    updateWallet();
    document.querySelector('.dropdown-action[onclick = "logout()"]').addEventListener('click', logout);
    const customerData = JSON.parse(sessionStorage.getItem('customer'));
    if (customerData) {
        document.getElementById('full-name').value = customerData.name;
        document.getElementById('phone').value = customerData.phone;
        document.getElementById('address').value = customerData.address;
    }
});

function updateCartDisplay() {
    console.log("updateCartDisplay called");
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const cartList = document.querySelector('.cart-info__list');
    cartList.innerHTML = ''; // Đảm bảo làm sạch nội dung cũ

    cart.forEach(async (item) => {
        const productDetails = await getProductDetails(item.id);
        const cartItem = document.createElement('article');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <a href="./product-detail.html?id=${item.id}">
                <img src="data:image/jpeg;base64,${item.img_path}" alt="" class="cart-item__thumb" />
            </a>
            <div class="cart-item__content">
                <div class="cart-item__content-left">
                    <h3 class="cart-item__title">
                        <a href="./product-detail.html?id=${item.id}">
                            ${item.name}
                        </a>
                    </h3>
                    <p class="cart-item__price-wrap">
                        ${formatPrice(item.price)} đ |
                        <span class="cart-item__status">Còn lại: ${productDetails.inventory}</span>
                    </p>
                    <div class="cart-item__ctrl cart-item__ctrl--md-block">
                        <div class="cart-item__input">
                            <button class="cart-item__input-btn" onclick="updateQuantity(${item.id}, -1)">
                                <img class="icon" src="../assets/icons/minus.svg" alt="Decrease" />
                            </button>
                            <span>${item.quantity}</span>
                            <button class="cart-item__input-btn" onclick="updateQuantity(${item.id}, 1)">
                                <img class="icon" src="../assets/icons/plus.svg" alt="Increase" />
                            </button>
                        </div>
                    </div>
                </div>
                <div class="cart-item__content-right">
                    <p class="cart-item__total-price">${formatPrice(item.price * item.quantity)} đ</p>
                    <div class="cart-item__ctrl">
                        <button class="cart-item__ctrl-btn" onclick="removeFromCart(${item.id})">
                            <img src="../assets/icons/trash.svg" alt="Remove" />
                        </button>
                    </div>
                </div>
            </div>
        `;

        cartList.appendChild(cartItem);
    });

    updateTotalPrice();
}

async function getProductDetails(productId) {
    try {
        const response = await axios.get(`http://localhost:8080/api/products/${productId}`);
        return response.data;
    } catch (error) {
        console.log('Failed to get product details for: ${productId}: ', error);
        return { inventory: 'N/A' }
    }
}

function updateQuantity(productId, change) {
    console.log(`updateQuantity called with productId: ${productId}, change: ${change}`);
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const productIndex = cart.findIndex(item => item.id == productId); // Dùng '==' để so sánh kiểu chuỗi và số
    if (productIndex !== -1) {
        cart[productIndex].quantity += change;
        if (cart[productIndex].quantity <= 0) {
            cart.splice(productIndex, 1);
        }
        sessionStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        loadCartDropdown();
    } else {
        console.log(`Product with id ${productId} not found in cart`);
    }
}

function removeFromCart(productId) {
    console.log(`removeFromCart called with productId: ${productId}`);
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const productIndex = cart.findIndex(item => item.id == productId); // Dùng '==' để so sánh kiểu chuỗi và số
    if (productIndex !== -1) {
        cart.splice(productIndex, 1);
        sessionStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        loadCartDropdown();
    } else {
        console.log(`Product with id ${productId} not found in cart`);
    }
}

function updateTotalPrice() {
    console.log("updateTotalPrice called");
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    let totalPrice = 0;
    cart.forEach(item => {
        totalPrice += item.price * item.quantity;
    });
    document.getElementById('total-price').textContent = `${formatPrice(totalPrice)} đ`;
    document.getElementById('final-price').textContent = `${formatPrice(totalPrice + 15)} đ`; // Thêm phí vận chuyển
}

// Định dạng giá tiền
function formatPrice(price) {
    return parseInt(price * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '').trim();
}

function loadCartDropdown() {
    console.log("loadCartDropdown called");
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const cartDropdown = document.getElementById('cart-dropdown');
    cartDropdown.innerHTML = ''; // Xóa nội dung cũ trước khi thêm mới
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
function updateWallet() {
    const customerData = JSON.parse(sessionStorage.getItem('customer'));
    if (customerData && customerData.wallet) {
        document.getElementById('Wallet').textContent = "Ví của tôi: " + (customerData.wallet) + ' đ';
    }
}
function logout() {
    sessionStorage.clear();
    alert("Bạn đã đăng xuất thành công!");
    window.location.href = '../index.html'; // Redirect to home page after logout
}

function placeOrder() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const customerData = JSON.parse(sessionStorage.getItem('customer'));
    if (!cart.length) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }
    if (!customerData) {
        alert("Vui lòng nhập thông tin nhận hàng");
        return;
    }
    const receiverPhone = document.getElementById('phone').value;
    const receiverAddress = document.getElementById('address').value;
    const receiverName = document.getElementById('full-name').value;
    const order = {
        customerId: customerData.id,
        items: cart,
        receiverPhone,
        receiverAddress,
        receiverName
    };
    sendOrder(order);
}

function sendOrder(order) {
    axios.post('http://localhost:8080/api/createOrder', order)
        .then(response => {
            if (response.data.message === 'Đặt hàng thành công!') {
                alert("Đơn hàng của bạn đã được đặt thành công!");
                sessionStorage.removeItem('cart');
                const customerData = response.data.customer;
                sessionStorage.setItem('customer', JSON.stringify(customerData));
                updateWallet();
                window.location.href = 'index-logined.html';
            } else {
                alert(`Có lỗi xảy ra: ${response.data.message}`);
            }
        })
        .catch(error => {
            console.error('Đặt hàng thất bại: ', error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`${error.response.data.message}`);
            } else {
                alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại');
            }
        });
}