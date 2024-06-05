document.addEventListener("DOMContentLoaded", function () {
    axios.get('http://localhost:8080/api/getProductTea') // Thay URL bằng API endpoint thực tế của bạn
        .then(response => {
            const teaProducts = response.data;
            renderProducts(teaProducts);
        })
        .catch(error => console.error('Error fetching products:', error));
});

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
                    <a href="../view/sign-in.html">
                        <img src="data:image/jpeg;base64,${product.img_path}" alt="${product.name}" class="cate-item__thumb" />
                    </a>
                    <section class="cate-item__info">
                        <a href="../view/sign-in.html" class="cate-item__title">${product.name}</a>
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

function formatPrice(price) {
    return parseInt(price).toLocaleString('vi-VN');
}
