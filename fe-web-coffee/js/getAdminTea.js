document.addEventListener("DOMContentLoaded", function () {

    document.querySelector('.dropdown-action[onclick="logout()"]').addEventListener('click', logout);
    axios.get('http://localhost:8080/api/getProductTea') // Thay URL bằng API endpoint thực tế của bạn
        .then(response => {
            const allProducts = response.data;
            renderProducts(allProducts);
        })
        .catch(error => console.error('Error fetching products:', error));
});

function renderProducts(products) {
    const container = document.querySelector('.tea__container .row');
    if (container) {
        container.innerHTML = ''; // Xóa nội dung hiện có

        products.forEach(product => {
            
            const statusText = product.status ? product.status : "Còn hàng";
            const productElement = `
                <div class="col-12">
                    <div class="tea-item">
                        <a href="./product-detail.html?id=${product.id}">
                            <img src="data:image/jpeg;base64,${product.img_path}" alt="${product.name}" class="tea-item__thumb" />
                        </a>
                        <div class="tea-item__content">
                            <div class="tea-item__content-left">
                                <h3 class="tea-item__title">
                                    <a href="./product-detail.html?id=${product.id}">${product.name}</a>
                                </h3>
                                <p class="tea-item__price-wrap">
                                    ${formatPrice(product.price)} đ | <span class="tea-item__status">${statusText}</span>
                                </p>
                            </div>
                            <div class="tea-item__content-right">
                                <p class="tea-item__total-price">${formatPrice(product.price)} đ</p>
                                <div class="tea-item__ctrl">
                                    <button class="tea-item__ctrl-btn" onclick="removeFromTea(${product.id})">
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

function removeFromTea(productId) {
    // Implement the logic to remove the product from other products
    console.log(`Remove product with ID: ${productId}`);
    // You can call an API to remove the product from the server
}


function logout() {
    sessionStorage.clear();
    alert("Bạn đã đăng xuất thành công!");
    window.location.href = '../index.html'; // Redirect to home page after logout
}
