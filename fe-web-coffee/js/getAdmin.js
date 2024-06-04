document.addEventListener('DOMContentLoaded', function () {
    // Gọi API để lấy danh sách sản phẩm
    axios.get('http://localhost:8080/api/products')  // Thay URL bằng URL API thực tế của bạn
        .then(response => {
            const products = response.data;
            // Render danh sách sản phẩm lên trang
            renderProducts(products);
        })
        .catch(error => console.error('Error fetching products:', error));
});

function renderProducts(products) {
    const container = document.querySelector('.home__container .row');
    if (container) {
        container.innerHTML = ''; // Xóa nội dung hiện có

        products.forEach(product => {
            const statusText = product.status ? product.status : "Còn hàng";
            const productElement = `
             <div class="col-12">
                    <div class="admin-item">
                        <a href="./product-detail.html?id=${product.id}">
                            <img src="data:image/jpeg;base64,${product.img_path}" alt="${product.name}" class="admin-item__thumb" />
                        </a>
                        <div class="admin-item__content">
                            <div class="admin-item__content-left">
                                <h3 class="admin-item__title">
                                    <a href="./product-detail.html?id=${product.id}">${product.name}</a>
                                </h3>
                                <p class="admin-item__price-wrap">
                                    ${formatPrice(product.price)} đ | <span class="admin-item__status">${statusText}</span>
                                </p>
                            </div>
                            <div class="admin-item__content-right">
                                <p class="admin-item__total-price">${formatPrice(product.price)} đ</p>
                                <div class="admin-item__ctrl">
                                    <button class="admin-item__ctrl-btn" onclick="removeFromAdmin(${product.id})">
                                        <img src="../assets/icons/trash.svg" alt="Remove" />
                                    </button>
                                    <button class="admin-item__edit-btn">
                                        <img src="../assets/icons/edit.svg" alt="Edit" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        `;

        container.innerHTML += productElement;
    });
}
function formatPrice(price) {
    return parseInt(price * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '').trim();
}

function logout() {
    sessionStorage.clear();
    alert("Bạn đã đăng xuất thành công!");
    window.location.href = '../index.html'; // Redirect to home page after logout
}

function removeFromAdmin(productId){
    // Implement the logic to remove the product from coffee
    console.log(`Remove product with ID: ${productId}`);
    // You can call an API to remove the product from the server
}