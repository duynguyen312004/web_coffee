let state = {
    sdt: '',
    password: '',
    errMessage: '',
    isShowPassword: false
};

document.getElementById('sdt').addEventListener('input', handleOnChangeSDT);
document.getElementById('password').addEventListener('input', handleOnChangePassword);
document.getElementById('loginForm').addEventListener('submit', handleLogIn);

function handleOnChangeSDT(event) {
    state.sdt = event.target.value;
}

function handleOnChangePassword(event) {
    state.password = event.target.value;
}

async function handleLogIn(event) {
    event.preventDefault();  // Ngăn form gửi yêu cầu mặc định
    state.errMessage = '';
    try {
        let response = await axios.post('http://localhost:8080/api/login', {
            sdt: state.sdt,
            password: state.password
        });
        let data = response.data;
        if (data && data.errCode !== 0) {
            state.errMessage = data.message;
            document.getElementById('loginResult').textContent = state.errMessage;
        }
        if (data && data.errCode === 0) {
            // Xử lý đăng nhập thành công (ví dụ: chuyển hướng đến trang khác)
            document.getElementById('loginResult').textContent = 'Login successful!';
            sessionStorage.setItem('customer', JSON.stringify(data.customer)); // Sửa lại phần này
            // Chuyển hướng đến trang index-logined.html
            window.location.href = 'index-logined.html';
        }
    } catch (error) {
        if (error.response && error.response.data) {
            state.errMessage = error.response.data.message;
            document.getElementById('loginResult').textContent = state.errMessage;
        } else {
            console.error('Error:', error);
        }
    }
}

function handleShowHidePassword() {
    state.isShowPassword = !state.isShowPassword;
    document.getElementById('password').type = state.isShowPassword ? 'text' : 'password';
}
