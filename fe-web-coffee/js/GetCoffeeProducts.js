document.addEventListener("DOMContentLoaded", function () {


    axios.get('http://localhost:8080/api/getProductCoffee') // Thay URL bằng API endpoint thực tế của bạn
        .then(response => {
            const allProducts = response.data;
            renderProducts(allProducts);
        })
        .catch(error => console.error('Error fetching products:', error));

});

function renderProducts(products) {
    const container = document.querySelector('.coffee__container .row');
    if (container) {
        container.innerHTML = ''; // Xóa nội dung hiện có

        products.forEach(product => {
            const productElement = `
               <div class="col">
                <article class="cate-item">
                    <img src="data:image/jpeg;base64,${product.img_path}" alt="${product.name}" class="cate-item__thumb" onclick="location.href='sign-in.html';" />
                    <section class="cate-item__info">
                        <a href="http://127.0.0.1:5501/fe-web-coffee/view/sign-in.html" class="cate-item__title">${product.name}</a>
                        <p class="cate-item__desc">${formatPrice(product.price)} đ</p>
                    </section>
                </article>
            </div>
            `;
            container.innerHTML += productElement;
        });
    } else {
        console.error('Container element not found for rendering products');
    }
}


function formatPrice(price) {
    return parseInt(price).toLocaleString('vi-VN');
}

