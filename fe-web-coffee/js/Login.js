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
        console.log('Login response data:', data); // Thêm dòng này để kiểm tra dữ liệu trả về
        if (data && data.errCode !== 0) {
            state.errMessage = data.message;
            document.getElementById('loginResult').textContent = state.errMessage;
        }
        if (data && data.errCode === 0) {
            document.getElementById('loginResult').textContent = 'Login successful!';
            sessionStorage.setItem('customer', JSON.stringify(data.data)); // Lưu thông tin người dùng vào sessionStorage
            console.log('User role:', data.data.role); // Thêm dòng này để kiểm tra giá trị role
            if (data.data && data.data.role === 'ADMIN') {
                window.location.href = 'admin.html';
            } else if (data.data && data.data.role === 'Customer') {
                window.location.href = 'index-logined.html';
            } else {
                state.errMessage = 'Invalid user role';
                document.getElementById('loginResult').textContent = state.errMessage;
            }
        }
    } catch (error) {
        if (error.response && error.response.data) {
            state.errMessage = error.response.data.message;
            document.getElementById('loginResult').textContent = state.errMessage;
        } else {
            console.error('Error:', error);
            state.errMessage = 'An unexpected error occurred';
            document.getElementById('loginResult').textContent = state.errMessage;
        }
    }
}

function handleShowHidePassword() {
    state.isShowPassword = !state.isShowPassword;
    document.getElementById('password').type = state.isShowPassword ? 'text' : 'password';
}
