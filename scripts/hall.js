import { Data } from './data.js';

async function fetchHallConfig(seanceId, date) {
    const dataInstance = new Data();
    const path = `${dataInstance.URL}/hallconfig?seanceId=${seanceId}&date=${date}`;
    try {
        const response = await fetch(path, {
            method: 'GET',
            headers: dataInstance.header,
        });
        console.log('Ответ сервера:', response);
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log('JSON ответ сервера:', jsonResponse);
            return jsonResponse;
        } else {
            console.error('Ошибка при получении данных:', response.status, response.statusText);
            return null;
        }
    } catch (e) {
        console.error('Ошибка при выполнении запроса:', e);
        return null;
    }
}

function updateSeatingChart(hallConfig, priceStandart, priceVip) {
    const seatsContainer = document.getElementById('seats-container');
    seatsContainer.innerHTML = '';

    if (Array.isArray(hallConfig)) {
        hallConfig.forEach((row, rowIndex) => {
            console.log(`Обработка ряда ${rowIndex + 1}:`, row);
            const rowElement = document.createElement('div');
            rowElement.classList.add('row');
            row.forEach((seat, seatIndex) => {
                console.log(`Обработка места ${rowIndex + 1}-${seatIndex + 1}:`, seat);
                const seatElement = document.createElement('div');
                seatElement.classList.add('seat');
                seatElement.dataset.seat = `${rowIndex + 1}-${seatIndex + 1}`;
                seatElement.dataset.seatType = seat;
                seatElement.dataset.row = rowIndex + 1;
                seatElement.dataset.place = seatIndex + 1;
                seatElement.dataset.coast = seat === 'vip' ? priceVip : priceStandart;

                switch (seat) {
                    case 'standart':
                        seatElement.classList.add('available');
                        break;
                    case 'vip':
                        seatElement.classList.add('vip');
                        break;
                    case 'taken':
                        seatElement.classList.add('reserved');
                        break;
                    case 'disabled':
                        seatElement.classList.add('empty');
                        break;
                }

                seatElement.addEventListener('click', () => {
                    if (seatElement.classList.contains('available') || seatElement.classList.contains('vip')) {
                        seatElement.classList.toggle('selected');
                    }
                });

                rowElement.appendChild(seatElement);
            });
            seatsContainer.appendChild(rowElement);
        });
    } else {
        console.error('hallConfig должен быть массивом, но получено:', hallConfig);
    }
}

function updateLegend(priceStandart, priceVip) {
    const standartLegend = document.querySelector('.legend-item .available');
    const vipLegend = document.querySelector('.legend-item .vip');

    if (standartLegend) {
        standartLegend.nextSibling.textContent = ` Свободно (${priceStandart}руб)`;
    }
    if (vipLegend) {
        vipLegend.nextSibling.textContent = ` Свободно VIP (${priceVip}руб)`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const dataInstance = new Data();
    const allDataResponse = await dataInstance.getAllData();
    const allData = allDataResponse.result;
    console.log('All Data:', allData);

    const urlParams = new URLSearchParams(window.location.search);
    const seanceId = urlParams.get('seanceId');
    const date = urlParams.get('date');
    const movieTitle = decodeURIComponent(urlParams.get('movieTitle'));
    const movieTime = decodeURIComponent(urlParams.get('movieTime'));
    const movieHall = decodeURIComponent(urlParams.get('movieHall'));

    console.log('ID сеанса:', seanceId);
    console.log('Дата:', date);

    // Найдем текущий зал по имени
    const currentHall = allData.halls.find(hall => hall.hall_name === movieHall);
    if (!currentHall) {
        console.error('Зал не найден:', movieHall);
        return;
    }

    if (seanceId && date) {
        const hallConfigResponse = await fetchHallConfig(seanceId, date);
        if (hallConfigResponse && hallConfigResponse.success) {
            console.log('Конфигурация зала:', hallConfigResponse.result);
            updateSeatingChart(hallConfigResponse.result, currentHall.hall_price_standart, currentHall.hall_price_vip);
            updateLegend(currentHall.hall_price_standart, currentHall.hall_price_vip);
        } else {
            console.error('Не удалось получить конфигурацию зала.');
        }
    } else {
        console.error('Не указан ID сеанса или дата.');
    }

    document.getElementById('movie-title').textContent = movieTitle;
    document.getElementById('movie-time').textContent = movieTime;
    document.getElementById('movie-hall').textContent = movieHall;

    const reserveButton = document.getElementById('reserve-button');
    reserveButton.addEventListener('click', () => {
        const selectedSeats = Array.from(document.querySelectorAll('.seat.selected')).map(seat => ({
            row: parseInt(seat.dataset.row, 10),
            place: parseInt(seat.dataset.place, 10),
            coast: parseInt(seat.dataset.coast, 10)
        }));

        if (selectedSeats.length > 0) {
            console.log('Выбранные места:', selectedSeats);

            localStorage.setItem('seanceId', seanceId);
            localStorage.setItem('movieTitle', movieTitle);
            localStorage.setItem('hallName', movieHall);
            localStorage.setItem('seanceTime', movieTime);
            localStorage.setItem('ticketDate', date);
            localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));

            window.location.href = 'accept.html';
        } else {
            alert('Пожалуйста, выберите хотя бы одно место.');
        }
    });
});