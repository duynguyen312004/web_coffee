document.addEventListener("DOMContentLoaded", function () {
    loadCartDropdown();
    updateWallet();
    const buttons = document.querySelectorAll(".order-options .btn");

    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            // Xóa lớp 'active' khỏi tất cả các nút
            buttons.forEach((btn) => btn.classList.remove("active"));
            // Thêm lớp 'active' vào nút đã được bấm
            this.classList.add("active");
            const sortType = this.getAttribute('data-sort');
            fetchSortedProducts(sortType);
        });
    });
    axios.get('http://localhost:8080/api/getProductTea') // Thay URL bằng API endpoint thực tế của bạn
        .then(response => {
            const teaProducts = response.data;
            renderProducts(teaProducts);
        })
        .catch(error => console.error('Error fetching products:', error));
});

function fetchSortedProducts(sortType) {
    axios.get(`http://localhost:8080/api/getProductTeaSorted?sort=${sortType}`)
        .then(response => {
            currentProducts = response.data;
            renderProducts(currentProducts);
        })
        .catch(error => console.error('Lỗi khi lấy sản phẩm:', error));
}

function renderProducts(products) {
    const mainContainer = document.querySelector('.home__container');
    if (!mainContainer) {
        console.error('Container element not found for rendering products');
        return;
    }

    mainContainer.innerHTML = ''; // Xóa nội dung hiện có

    let rowContainer = createNewRowContainer();

    products.forEach((product, index) => {
        if (index % 4 === 0 && index !== 0) {
            mainContainer.appendChild(rowContainer);
            rowContainer = createNewRowContainer();
        }

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

        rowContainer.innerHTML += productElement;
    });

    mainContainer.appendChild(rowContainer); // Thêm container dòng cuối cùng vào container chính
}

function createNewRowContainer() {
    const rowContainer = document.createElement('div');
    rowContainer.className = 'row row-cols-4 row-cols-md-1';
    return rowContainer;
}

function updateWallet() {
    const customerData = JSON.parse(sessionStorage.getItem('customer'));
    if (customerData && customerData.wallet) {
        document.getElementById('Wallet').textContent = "Ví của tôi: " + formatPrice(customerData.wallet) + ' Đ';
    }
}

function formatPrice(price) {
    return parseInt(price).toLocaleString('vi-VN');
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
