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
    const containers = document.querySelectorAll('.row.row-cols-4.row-cols-md-1');
    containers.forEach(container => {
        container.innerHTML = ''; // Clear existing content
    });

    products.forEach((product, index) => {
        const containerIndex = index % containers.length;
        const container = containers[containerIndex];

        const productElement = `
            <div class="col">
                <article class="cate-item">
                    <img src="./assets/img/category-item-3.webp" alt="${product.name}" class="cate-item__thumb" onclick="location.href='view/sign-in.html';" />
                    <section class="cate-item__info">
                        <a href="http://127.0.0.1:5501/fe-web-coffee/view/sign-in.html" class="cate-item__title">${product.name}</a>
                        <p class="cate-item__desc">${product.price} đ</p>
                    </section>
                </article>
            </div>
        `;

        container.innerHTML += productElement;
    });
}
