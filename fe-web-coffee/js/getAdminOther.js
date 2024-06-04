document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('.dropdown-action[onclick="logout()"]').addEventListener('click', logout);

    axios.get('http://localhost:8080/api/getProductOther') // Thay URL bằng API endpoint thực tế của bạn
        .then(response => {
            const allProducts = response.data;
            renderProducts(allProducts);
        })
        .catch(error => console.error('Error fetching products:', error));
});

function renderProducts(products) {
    const container = document.querySelector('.menu__container .row');
    if (container) {
        container.innerHTML = ''; // Xóa nội dung hiện có

        products.forEach(product => {
            const statusText = product.status ? product.status : "Còn hàng";
            const productElement = `
                <div class="col-12">
                    <div class="others-item">
                        <a href="./product-detail.html?id=${product.id}">
                            <img src="data:image/jpeg;base64,${product.img_path}" alt="${product.name}" class="others-item__thumb" />
                        </a>
                        <div class="others-item__content">
                            <div class="others-item__content-left">
                                <h3 class="others-item__title">
                                    <a href="./product-detail.html?id=${product.id}">${product.name}</a>
                                </h3>
                                <p class="others-item__price-wrap">
                                    ${formatPrice(product.price)} đ | <span class="others-item__status">${statusText}</span>
                                </p>
                            </div>
                            <div class="others-item__content-right">
                                <p class="others-item__total-price">${formatPrice(product.price)} đ</p>
                                <div class="others-item__ctrl">
                                    <button class="others-item__ctrl-btn" onclick="removeFromOther(${product.id})">
                                        <img src="../assets/icons/trash.svg" alt="Remove" />
                                    </button>
                                    <button class="coffee-item__edit-btn">
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
    } else {
        console.error('Container element not found for rendering products');
    }
}

function formatPrice(price) {
    return parseInt(price * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '').trim();
}

function removeFromOther(productId) {
    // Implement the logic to remove the product from other products
    console.log(`Remove product with ID: ${productId}`);
    // You can call an API to remove the product from the server
}

function logout() {
    sessionStorage.clear();
    alert("Bạn đã đăng xuất thành công!");
    window.location.href = '../index.html'; // Redirect to home page after logout
}
