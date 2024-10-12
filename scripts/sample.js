document.addEventListener('DOMContentLoaded', () => {
    const movieTitleText = localStorage.getItem('movieTitle');
    const hallName = localStorage.getItem('hallName');
    const seanceTime = localStorage.getItem('seanceTime');
    const ticketDate = localStorage.getItem('ticketDate');
    const selectedSeatsArray = JSON.parse(localStorage.getItem('selectedSeats'));

    // Проверяем, что selectedSeatsArray не содержит элементов с null значениями
    const validSeatsArray = selectedSeatsArray.filter(seat => seat.row !== null && seat.place !== null);

    // Логируем отфильтрованные места
    console.log('Отфильтрованные места:', validSeatsArray);

    const totalTicketCost = validSeatsArray.reduce((total, seat) => total + seat.coast, 0);

    const seatNumber = validSeatsArray.map(seat => `Ряд ${seat.row}, Место ${seat.place}`).join(', ');

    document.getElementById('movie-title').textContent = movieTitleText;
    document.getElementById('selected-seats').textContent = seatNumber;
    document.getElementById('movie-hall').textContent = hallName;
    document.getElementById('movie-time').textContent = seanceTime;
    document.getElementById('ticket-price').textContent = `Цена: ${totalTicketCost} руб.`;
    document.getElementById('ticket-date').textContent = `Дата: ${ticketDate}`;

    const qrCodeText = `Фильм: ${movieTitleText}, Место: ${seatNumber}, Зал: ${hallName}, Время: ${seanceTime}, Цена: ${totalTicketCost} руб., Дата: ${ticketDate}, Билет действителен строго на свой сеанс`;

    const qrcode = QRCreator(qrCodeText, {
        mode: 4,
        eccl: 0,
        version: -1,
        mask: -1,
        image: 'html',
        modsize: -1,
        margin: 0
    });

    const content = (qrcode) => {
        return qrcode.error ? `недопустимые исходные данные ${qrcode.error}` : qrcode.result;
    };

    document.getElementById('qrcode').append(content(qrcode));
});