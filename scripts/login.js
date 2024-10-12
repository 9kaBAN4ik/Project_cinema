import { Data } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const dataInstance = new Data();
        const result = await dataInstance.login(email, password);

        if (result) {
            console.log('Авторизация пройдена успешно!', result);
            window.location.href = '/adminhall.html';
        } else {
            console.error('Неверный логин или пароль.');
            alert('Неверный логин или пароль.');
        }
    });
});
