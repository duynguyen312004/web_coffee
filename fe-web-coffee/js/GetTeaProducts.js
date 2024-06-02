document.addEventListener("DOMContentLoaded", function () {
    loadCartDropdown();
    updateWallet();
    document.querySelector('.dropdown-action[onclick="logout()"]').addEventListener('click', logout);
    axios.get('http://localhost:8080/api/getProductTea') // Thay URL bằng API endpoint thực tế của bạn
        .then(response => {
            const teaProducts = response.data;
            renderProducts(teaProducts);
        })
        .catch(error => console.error('Error fetching products:', error));
    updateWallet();
});

function renderProducts(products) {
    const container = document.querySelector('.tea__container .row');
    container.innerHTML = ''; // Xóa nội dung hiện có

    products.forEach(product => {
        const productElement = `
                <div class="col">
                    <article class="cate-item">
                        <a href="../view/product-detail.html?id=${product.id}">
                            <img src="data:image/jpeg;base64,${product.img_path}" alt="${product.name}" class="cate-item__thumb" />
                        </a>
                        <section class="cate-item__info">
                            <a href="../view/product-detail.html?id=${product.id}" class="cate-item__title">${product.name}</a>
                            <p class="cate-item__desc">${formatPrice(product.price)} đ</p>
                        </section>
                    </article>
                </div>
            `;

        container.innerHTML += productElement;
    });
}

function updateWallet() {
    const customerData = JSON.parse(sessionStorage.getItem('customer'));
    if (customerData && customerData.wallet) {
        document.getElementById('Wallet').textContent = "Ví của tôi: " + customerData.wallet + ' Đ';
    }
}

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

function logout() {
    sessionStorage.clear();
    alert("Bạn đã đăng xuất thành công!");
    window.location.href = '../index.html'; // Redirect to home page after logout
}
