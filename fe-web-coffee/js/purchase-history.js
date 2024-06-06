document.addEventListener("DOMContentLoaded", function () {
    loadCustomerData();
    updateWallet();
    const fetchButton = document.getElementById("fetch-orders");

    if (fetchButton) {
        fetchButton.addEventListener("click", function () {
            const startDate = document.getElementById("start-date").value;
            const endDate = document.getElementById("end-date").value;

            if (startDate && endDate) {
                fetchOrderHistory(startDate, endDate);
            } else {
                alert("Vui lòng chọn cả hai ngày.");
            }
        });
    } else {
        console.error("Element with id 'fetch-orders' not found");
    }
});

function loadCustomerData() {
    const customerData = JSON.parse(sessionStorage.getItem('customer'));
    if (customerData) {
        const fullNameElement = document.getElementById('full-name');
        const phoneElement = document.getElementById('phone');
        const addressElement = document.getElementById('address');
        const profileNameElement = document.getElementById('profile-name');

        if (fullNameElement) fullNameElement.value = customerData.name || '';
        if (phoneElement) phoneElement.value = customerData.phone || '';
        if (addressElement) addressElement.value = customerData.address || '';
        if (profileNameElement) profileNameElement.textContent = customerData.name || '';
    } else {
        console.log('No customer data found in session storage');
    }
}

function formatPrice(price) {
    return parseInt(price).toLocaleString('vi-VN');
}

function updateWallet() {
    const customerData = JSON.parse(sessionStorage.getItem('customer'));
    const walletElement = document.getElementById('Wallet');
    if (customerData && customerData.wallet && walletElement) {
        walletElement.textContent = "Ví của tôi: " + formatPrice(customerData.wallet) + ' đ';
    }
}

function fetchOrderHistory(startDate, endDate) {
    console.log(`Fetching orders from ${startDate} to ${endDate}`);
    axios.get(`http://localhost:8080/api/orders?start=${startDate}&end=${endDate}`)
        .then(response => {
            console.log('Orders received:', response.data);
            const orders = response.data;
            displayOrderHistory(orders);
        })
        .catch(error => {
            console.error('Error fetching order history:', error);
        });
}

function displayOrderHistory(orders) {
    const purchaseHistory = document.getElementById("purchase-history");
    purchaseHistory.innerHTML = "";

    if (orders.length === 0) {
        purchaseHistory.innerHTML = "<p>Không có đơn hàng nào trong khoảng thời gian này.</p>";
        return;
    }

    orders.forEach(order => {
        let totalOrderValue = 0;

        let orderHTML = `
            <div class="purchase-details-container">
                <div class="purchase-date" onclick="toggleDetails(this)">
                    Đơn hàng lúc ${new Date(order.date).toLocaleString('vi-VN')}
                </div>
                <div class="purchase-details">
                    <div class="row row-cols-1 row-cols-md-1">
        `;

        order.details.forEach(detail => {
            totalOrderValue += detail.unit_price * detail.quantity;

            orderHTML += `
                <div class="col-10">
                    <div class="purchased-item">
                        <img src="${detail.img_url}" alt="${detail.name}" class="purchased-item__thumb" />
                        <div class="purchased-item__content">
                            <a href="#" class="purchased-item__title">${detail.name}</a>
                            <div class="purchased-item__desc">
                                <p class="purchased-item__price-wrap">
                                    ${formatPrice(detail.unit_price)} đ | 
                                    <span class="purchased-item__status">Số lượng:
                                        <p class="purchased-item__number">${detail.quantity}</p>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        orderHTML += `
                    </div>
                    <div class="total-order-value">
                        Tổng giá trị đơn hàng: ${formatPrice(totalOrderValue)} đ
                    </div>
                </div>
            </div>
        `;

        purchaseHistory.innerHTML += orderHTML;
    });
}

function toggleDetails(element) {
    const selectedContainer = element.closest('.purchase-details-container');
    const purchaseHistory = document.getElementById("purchase-history");
    const isAlreadyAtTop = purchaseHistory.firstChild === selectedContainer;
    const detailsElement = selectedContainer.querySelector('.purchase-details');

    if (detailsElement.style.display === 'block') {
        detailsElement.style.display = 'none';
    } else {
        detailsElement.style.display = 'block';
        if (!isAlreadyAtTop) {
            purchaseHistory.prepend(selectedContainer);
        }
    }
}

function logout() {
    sessionStorage.clear();
    alert("Bạn đã đăng xuất thành công!");
    window.location.href = '../index.html'; // Redirect to home page after logout
}
