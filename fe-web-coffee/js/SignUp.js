let state = {
    sdt: '',
    password: '',
    address: '',
    name: '',
    re_password: '',
    errMessage: '',
}

document.getElementById('sdt').addEventListener('input', OnChangeSDT);
document.getElementById('password').addEventListener('input', OnChangePassword);
document.getElementById('name').addEventListener('input', OnChangeName);
document.getElementById('address').addEventListener('input', OnChangeAddress);
document.getElementById('re_password').addEventListener('input', OnChangeRePassword);
document.getElementById('signUpForm').addEventListener('submit', handleRegister);

function OnChangeSDT(event) {
    state.sdt = event.target.value;
}

function OnChangePassword(event) {
    state.password = event.target.value;
}

function OnChangeRePassword(event) {
    state.re_password = event.target.value;
}

function OnChangeName(event) {
    state.name = event.target.value;
}

function OnChangeAddress(event) {
    state.address = event.target.value;
}

async function handleRegister(event) {
    event.preventDefault();
    state.errMessage = '';

    // Check if password and confirm password match
    if (state.password !== state.re_password) {
        state.errMessage = 'Mật khẩu và xác nhận mật khẩu không khớp';
        document.getElementById('signUpResult').textContent = state.errMessage;
        return;
    }

    try {
        let response = await axios.post('http://localhost:8080/api/register', {
            sdt: state.sdt,
            password: state.password,
            address: state.address,
            name: state.name
        });

        console.log('Response received:', response.data);
        let data = response.data;
        if (data && data.errCode !== 0) {
            state.errMessage = data.message;
            document.getElementById('signUpResult').textContent = state.errMessage;
        }
        if (data && data.errCode === 0) {
            document.getElementById('signUpResult').textContent = "Sign Up Successful!";
            window.location.href = 'sign-in.html';
        }
    } catch (error) {
        if (error.response && error.response.data) {
            state.errMessage = error.response.data.message;
            document.getElementById('signUpResult').textContent = state.errMessage;
        } else {
            console.error('Error:', error);
        }
    }
}
