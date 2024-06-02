document.addEventListener("DOMContentLoaded", function () {
    // Hàm lấy tất cả sản phẩm và lọc sản phẩm có tên bắt đầu bằng "trà "
    function fetchteaProducts() {
        axios.get('http://localhost:8080/api/products') // Thay URL bằng API endpoint thực tế của bạn
            .then(response => {
                const allProducts = response.data;
                // Lọc các sản phẩm có tên bắt đầu bằng "trà"
                const teaProducts = allProducts.filter(product => product.name.toLowerCase().startsWith('trà'));
                // Render danh sách sản phẩm trà lên trang
                renderProducts(teaProducts);
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    function renderProducts(products) {
        const container = document.querySelector('.tea__container .row');
        container.innerHTML = ''; // Xóa nội dung hiện có

        products.forEach(product => {
            const productElement = `
                <div class="col">
                    <article class="cate-item">
                        <img src="data:image/jpeg;base64,${product.img_path}" alt="${product.name}" class="cate-item__thumb" />
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

    function formatPrice(price) {
        return parseInt(price * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '').trim();
    }

    fetchteaProducts();
});