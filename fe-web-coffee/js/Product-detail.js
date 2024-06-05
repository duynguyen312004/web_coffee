document.addEventListener("DOMContentLoaded", function () {
    loadCartDropdown();
    updateWallet();
    document.querySelector('.dropdown-action[onclick = "logout()"]').addEventListener('click', logout);
    // Lấy ID sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        // Gọi API để lấy thông tin chi tiết sản phẩm
        axios
            .get(`http://localhost:8080/api/products/${productId}`) // Thay URL bằng URL API thực tế của bạn
            .then((response) => {
                const product = response.data;
                // Hiển thị thông tin sản phẩm
                displayProductDetails(product);
            })
            .catch((error) => console.error("Error fetching product details:", error));
    }

    const addToCartButton = document.querySelector('.add-to-cart');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', function () {
            addToCart(productId);
        });
    }
});

function redirectToProductDetail(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function displayProductDetails(product) {
    // Cập nhật các phần tử trên trang với thông tin sản phẩm
    document.querySelector('.prod-info__heading').textContent = product.name;
    document.querySelector('.prod-info__price').textContent = formatPrice(product.price) + ' VNĐ';
    document.querySelector('.prod-preview__img').src = `data:image/jpeg;base64,${product.img_path}`;
    document.querySelector('.prduct-desc__detail').textContent = product.description;
    // Thêm các phần tử khác nếu cần
}

function addToCart(productId) {
    axios.get(`http://localhost:8080/api/products/${productId}`).then((response) => {
        const product = response.data;
        const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === productId);
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                quantity: 1,
                img_path: product.img_path
            });
        }
        sessionStorage.setItem('cart', JSON.stringify(cart));
    }).catch((error) => console.log("Error fetching product: ", error));
}

// Định dạng giá tiền
function formatPrice(price) {
    return parseInt(price * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '').trim();
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
function updateWallet() {
    const customerData = JSON.parse(sessionStorage.getItem('customer'));
    if (customerData && customerData.wallet) {
        document.getElementById('Wallet').textContent = "Ví của tôi: " + customerData.wallet + ' Đ';
    }
}
function logout() {
    sessionStorage.clear();
    alert("Bạn đã đăng xuất thành công!");
    window.location.href = '../index.html'; // Redirect to home page after logout
}