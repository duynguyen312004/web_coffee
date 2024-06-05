if (document.body.getAttribute('data-page') === 'tea') {
    let currentProducts = []; // Biến toàn cục để lưu trữ kết quả tìm kiếm hiện tại

    document.addEventListener("DOMContentLoaded", function () {
        const buttons = document.querySelectorAll(".order-options .btn");
        const searchInput = document.getElementById('search-input');
        const searchForm = document.querySelector('.search');

        buttons.forEach((button) => {
            button.addEventListener("click", function () {
                // Xóa lớp 'active' khỏi tất cả các nút
                buttons.forEach((btn) => btn.classList.remove("active"));

                // Thêm lớp 'active' vào nút đã được bấm
                this.classList.add("active");

                // Lấy loại sắp xếp từ nút đã bấm
                const sortType = this.getAttribute('data-sort');

                // Sắp xếp các sản phẩm hiện tại theo loại sắp xếp đã chọn
                sortAndRenderProducts(sortType);
            });
        });

        fetchSortedProducts('name'); // Hiển thị các sản phẩm ban đầu
        searchForm.addEventListener('submit', function (event) { // Thêm dòng này
            event.preventDefault(); // Ngăn chặn form submit mặc định
        });
        searchInput.addEventListener('keyup', function (event) {
            if (event.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    searchProductsByName(query);
                } else {
                    fetchSortedProducts('name'); // Hiển thị lại các sản phẩm ban đầu nếu ô tìm kiếm trống
                }
                // Xóa lớp 'active' khỏi tất cả các nút sau khi tìm kiếm
                buttons.forEach((btn) => btn.classList.remove("active"));
            }
        });

        // Lắng nghe sự kiện submit của form chỉnh sửa sản phẩm
        document.getElementById('editProductForm').addEventListener('submit', function (event) {
            event.preventDefault(); // Ngăn chặn form submit mặc định
            const productId = document.getElementById('editProductId').value;
            const name = document.getElementById('editProductName').value;
            const price = document.getElementById('editProductPrice').value;
            const inventory = document.getElementById('editProductInventory').value;
            const category = document.getElementById('editProductCategory').value;
            const description = document.getElementById('editProductDescription').value;

            editProduct(productId, { name, price, inventory, category, description });
        });

        // Lắng nghe sự kiện submit của form thêm sản phẩm
        document.getElementById('addProductForm').addEventListener('submit', function (event) {
            event.preventDefault(); // Ngăn chặn form submit mặc định
            const formData = new FormData();
            formData.append('name', document.getElementById('addProductName').value);
            formData.append('price', document.getElementById('addProductPrice').value);
            formData.append('inventory', document.getElementById('addProductInventory').value);
            formData.append('category', document.getElementById('addProductCategory').value);
            formData.append('description', document.getElementById('addProductDescription').value);
            formData.append('image', document.getElementById('addProductImage').files[0]);

            axios.post('http://localhost:8080/api/addProduct', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(response => {
                    alert(response.data.message);
                    hideAddModal();
                    fetchSortedProducts('name'); // Tải lại danh sách sản phẩm sau khi thêm
                })
                .catch(error => console.error('Lỗi khi thêm sản phẩm:', error));
        });
    });

    function fetchSortedProducts(sortType) {
        axios.get(`http://localhost:8080/api/getProductTeaSorted?sort=${sortType}`)
            .then(response => {
                currentProducts = response.data;
                renderProducts(currentProducts);
            })
            .catch(error => console.error('Lỗi khi lấy sản phẩm:', error));
    }

    function searchProductsByName(query) {
        axios.get(`http://localhost:8080/api/searchProducts?name=${query}`)
            .then(response => {
                currentProducts = response.data;
                renderProducts(currentProducts);
            })
            .catch(error => console.error('Lỗi khi tìm kiếm sản phẩm:', error));
    }

    function sortAndRenderProducts(sortType) {
        const sortedProducts = [...currentProducts]; // Tạo bản sao của currentProducts để sắp xếp
        switch (sortType) {
            case 'name':
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price_asc':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }
        renderProducts(sortedProducts);
    }

    function renderProducts(products) {
        const container = document.querySelector('.tea__container .row'); // Thay đổi lớp để phù hợp với HTML của bạn
        if (container) {
            container.innerHTML = ''; // Xóa nội dung hiện có

            products.forEach(product => {
                const productElement = `
                <div class="col-12">
                    <div class="tea-item">
                        <a href="#">
                            <img src="data:image/jpeg;base64,${product.img_path}" alt="${product.name}" class="tea-item__thumb" />
                        </a>
                        <div class="tea-item__content">
                            <div class="tea-item__content-left">
                                <h3 class="tea-item__title">
                                    <a href="#">${product.name}</a>
                                </h3>
                                <p class="tea-item__price-wrap">
                                    ${formatPrice(product.price)} đ | <span class="tea-item__status">Còn lại: ${product.inventory}</span> | <span class="tea-item__category">${product.category}</span>
                                </p>
                            </div>
                            <div class="tea-item__content-right">
                                <p class="tea-item__total-price">${formatPrice(product.price)} đ</p>
                                <div class="tea-item__ctrl">
                                    <button class="tea-item__ctrl-btn" onclick="removeFromTea(${product.id})">
                                        <img src="../assets/icons/trash.svg" alt="Remove" />
                                    </button>
                                    <button class="tea-item__edit-btn" onclick="showEditModal(${product.id}, '${product.name}', ${product.price}, ${product.inventory}, '${product.category}', '${product.description}')">
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
            console.error('Không tìm thấy phần tử container để hiển thị sản phẩm');
        }
    }

    async function getProductDetails(productId) {
        try {
            const response = await axios.get(`http://localhost:8080/api/products/${productId}`);
            return response.data;
        } catch (error) {
            console.log(`Không thể lấy chi tiết sản phẩm cho: ${productId}: `, error);
            return { inventory: 'N/A' };
        }
    }

    function formatPrice(price) {
        return parseInt(price).toLocaleString('vi-VN');
    }

    function logout() {
        sessionStorage.clear();
        alert("Bạn đã đăng xuất thành công!");
        window.location.href = '../index.html'; // Chuyển hướng đến trang chủ sau khi đăng xuất
    }

    function removeFromTea(productId) {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
            axios.delete(`http://localhost:8080/api/deleteProduct/${productId}`)
                .then(response => {
                    alert(response.data.message);
                    fetchSortedProducts('name'); // Tải lại danh sách sản phẩm sau khi xóa
                })
                .catch(error => console.error('Lỗi khi xóa sản phẩm:', error));
        }
    }

    function showEditModal(productId, name, price, inventory, category, description) {
        document.getElementById('editProductId').value = productId;
        document.getElementById('editProductName').value = name;
        document.getElementById('editProductPrice').value = price;
        document.getElementById('editProductInventory').value = inventory;
        document.getElementById('editProductCategory').value = category;
        document.getElementById('editProductDescription').value = description;
        document.getElementById('editProductModal').style.display = 'block';
        document.getElementById('modalOverlay').style.display = 'block'; // Hiển thị lớp phủ
    }

    function hideEditModal() {
        document.getElementById('editProductModal').style.display = 'none';
        document.getElementById('modalOverlay').style.display = 'none'; // Ẩn lớp phủ
    }

    function showAddModal() {
        document.getElementById('addProductModal').style.display = 'block';
        document.getElementById('modalOverlay').style.display = 'block'; // Hiển thị lớp phủ
    }

    function hideAddModal() {
        document.getElementById('addProductModal').style.display = 'none';
        document.getElementById('modalOverlay').style.display = 'none'; // Ẩn lớp phủ
    }

    function editProduct(productId, updatedData) {
        axios.put(`http://localhost:8080/api/updateProduct/${productId}`, updatedData)
            .then(response => {
                alert(response.data.message);
                hideEditModal();
                fetchSortedProducts('name'); // Tải lại danh sách sản phẩm sau khi chỉnh sửa
            })
            .catch(error => console.error('Lỗi khi cập nhật sản phẩm:', error));
    }
}
