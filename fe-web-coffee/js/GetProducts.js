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
    const productContainer1 = document.querySelector('.row.row-cols-4.row-cols-md-1:first-of-type');
    const productContainer2 = document.querySelector('.row.row-cols-4.row-cols-md-1:nth-of-type(2)');
    productContainer1.innerHTML = ''; // Clear existing content
    productContainer2.innerHTML = ''; // Clear existing content

    products.forEach((product, index) => {
        const productElement = `
            <div class="col">
                <article class="cate-item">
                    <img src="./assets/img/category-item-2.webp
                    " alt="${product.name}" class="cate-item__thumb" />
                    <section class="cate-item__info">
                        <a href="#!" class="cate-item__title">${product.name}</a>
                        <p class="cate-item__desc">${product.price} đ</p>
                    </section>
                </article>  
            </div>
        `;
        if (index < 4) {
            productContainer1.innerHTML += productElement;
        } else {
            productContainer2.innerHTML += productElement;
        }
    });
}
