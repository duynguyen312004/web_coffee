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
    const mainContainer = document.querySelector('.home__container');
    mainContainer.innerHTML = ''; // Clear existing content

    let rowContainer = createNewRowContainer();

    products.forEach((product, index) => {
        if (index % 4 === 0 && index !== 0) {
            mainContainer.appendChild(rowContainer);
            rowContainer = createNewRowContainer();
        }

        const productElement = `
            <div class="col">
                <article class="cate-item">
                    <img src="data:image/jpeg;base64,${product.img_path}" alt="${product.name}" class="cate-item__thumb" onclick="location.href='view/sign-in.html';" />
                    <section class="cate-item__info">
                        <a href="http://127.0.0.1:5501/fe-web-coffee/view/sign-in.html" class="cate-item__title">${product.name}</a>
                        <p class="cate-item__desc">${formatPrice(product.price)} đ</p>
                    </section>
                </article>
            </div>
        `;

        rowContainer.innerHTML += productElement;
    });

    // Append the last row container
    mainContainer.appendChild(rowContainer);
}

function createNewRowContainer() {
    const rowContainer = document.createElement('div');
    rowContainer.className = 'row row-cols-4 row-cols-md-1';
    return rowContainer;
}

function formatPrice(price) {
    return parseInt(price).toLocaleString('vi-VN');
}
