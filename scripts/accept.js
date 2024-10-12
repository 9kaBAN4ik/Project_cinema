document.addEventListener('DOMContentLoaded', () => {
    const movieTitle = document.getElementById('movie-title');
    const selectedSeats = document.getElementById('selected-seats');
    const movieHall = document.getElementById('movie-hall');
    const movieTime = document.getElementById('movie-time');
    const totalCost = document.getElementById('total-cost');
    const bookingButton = document.querySelector('.button');
    const movieTitleText = localStorage.getItem('movieTitle');
    const hallName = localStorage.getItem('hallName');
    const seanceTime = localStorage.getItem('seanceTime');
    const selectedSeatsArray = JSON.parse(localStorage.getItem('selectedSeats'));

    // Проверяем, что selectedSeatsArray не содержит элементов с null значениями
    const validSeatsArray = selectedSeatsArray.filter(seat => seat.row !== null && seat.place !== null);

    // Логируем отфильтрованные места
    console.log('Отфильтрованные места:', validSeatsArray);

    const totalTicketCost = validSeatsArray.reduce((total, seat) => total + seat.coast, 0);

    movieTitle.textContent = movieTitleText;
    selectedSeats.textContent = validSeatsArray.map(seat => `Ряд ${seat.row}, Место ${seat.place}`).join(', ');
    movieHall.textContent = hallName;
    movieTime.textContent = seanceTime;
    totalCost.textContent = `${totalTicketCost} рублей`;

    bookingButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = 'qrcode.html';
    });
});