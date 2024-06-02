document.addEventListener("DOMContentLoaded", function () {
<<<<<<< HEAD
=======
    loadCartDropdown();
    updateWallet();
>>>>>>> f040e7ad9767c8adc53f98c04ac28d4384e4126a
    document.querySelector('.dropdown-action[onclick = "logout()"]').addEventListener('click', logout);
    // Gọi API để lấy danh sách sản phẩm
    axios
        .get("http://localhost:8080/api/products") // Thay URL bằng URL API thực tế của bạn
        .then((response) => {
            const products = response.data;
            // Render danh sách sản phẩm lên trang
            renderProducts(products);
        })
        .catch((error) => console.error("Error fetching products:", error));
    updateWallet();
});

function renderProducts(products) {
    const containers = document.querySelectorAll(
        ".row.row-cols-4.row-cols-md-1"
    );

    if (containers.length === 0) {
        console.error('No containers found with the class .row.row-cols-4.row-cols-md-1');
        return;
    }

    containers.forEach((container) => {
        container.innerHTML = ""; // Clear existing content
    });

    products.forEach((product, index) => {
        const containerIndex = index % containers.length;
        const container = containers[containerIndex];

        const productElement = `
            <div class="col">
                <article class="cate-item" data-product-id = "${product.id}">
                    <img src="data:image/jpeg;base64,${product.img_path}" alt="${product.name}" class="cate-item__thumb" />
                    <section class="cate-item__info">
                        <a href="javascript:void(0);" class="cate-item__title">${product.name}</a>
                        <p class="cate-item__desc">${formatPrice(product.price)} đ</p>
                    </section>
                </article>
            </div>
        `;

        container.innerHTML += productElement;
    });

    const productElements = document.querySelectorAll('.cate-item');
    productElements.forEach(productElement => {
        productElement.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');
            window.location.href = `../view/product-detail.html?id=${productId}`;
        })
    })
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