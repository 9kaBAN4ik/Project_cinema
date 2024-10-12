import { Data } from './data.js';

let currentWeekStart = new Date();

async function fetchData() {
    const dataInstance = new Data();
    const data = await dataInstance.getAllData();
    console.log('Полученные данные:', data);
    return data;
}

function updateDOM(data) {
    console.log('Данные для обновления DOM:', data);
    const movieList = document.querySelector('.movie-list');
    const selectedDateElement = document.querySelector('.selected');
    let selectedDate = new Date();

    if (selectedDateElement) {
        selectedDate = new Date(selectedDateElement.getAttribute('data-date'));
    }

    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    if (!movieList) {
        console.error('Элемент с классом movie-list не найден.');
        return;
    }

    if (data && data.result && data.result.films && Array.isArray(data.result.films)) {
        movieList.innerHTML = '';  // Очистка списка фильмов перед обновлением

        data.result.films.forEach(film => {
            const filmElement = document.createElement('div');
            filmElement.classList.add('film');

            const filmInfo = document.createElement('div');
            filmInfo.classList.add('film-info');

            filmInfo.innerHTML = `
                <h2>${film.film_name}</h2>
                <p>Длительность: ${film.film_duration} минут</p>
                <p>Страна: ${film.film_origin}</p>
            `;

            const filmImage = document.createElement('img');
            filmImage.src = `${film.film_poster}`;
            filmImage.alt = `${film.film_name} постер`;

            filmElement.appendChild(filmImage);
            filmElement.appendChild(filmInfo);

            const seances = data.result.seances.filter(seance => seance.seance_filmid === film.id);
            seances.forEach(seance => {
                const hall = data.result.halls.find(hall => hall.id === seance.seance_hallid);
                if (hall) {
                    const hallName = document.createElement('h3');
                    hallName.textContent = ` ${hall.hall_name}`;
                    filmInfo.appendChild(hallName);

                    const seanceElement = document.createElement('li');
                    const seanceLink = document.createElement('a');
                    const seanceDateTime = new Date(`${selectedDate.toDateString()} ${seance.seance_time}`);
                    const currentTime = new Date();

                    // Проверка доступности зала и времени сеанса
                    if (hall.hall_open && (!isToday || seanceDateTime > currentTime)) {
                        seanceLink.href = `hall.html?seanceId=${seance.id}&date=${selectedDate.toISOString().split('T')[0]}&movieTitle=${encodeURIComponent(film.film_name)}&movieTime=${encodeURIComponent(seance.seance_time)}&movieHall=${encodeURIComponent(hall.hall_name)}`;
                        seanceLink.textContent = `${seance.seance_time}`;
                        seanceElement.appendChild(seanceLink);
                    } else {
                        seanceElement.textContent = `${seance.seance_time}`;
                        if (!hall.hall_open) {
                            seanceElement.classList.add('hall-closed');
                        } else if (isToday && seanceDateTime <= currentTime) {
                            seanceElement.classList.add('seance-passed');
                        }
                    }

                    const timesList = document.createElement('ul');
                    timesList.classList.add('times');
                    timesList.appendChild(seanceElement);
                    filmInfo.appendChild(timesList);
                } else {
                    console.error(`Зал с ID ${seance.seance_hallid} не найден.`);
                }
            });

            movieList.appendChild(filmElement);
        });
    } else {
        console.error('data.result.films не существует или не является массивом');
    }
}

function updateWeekdays() {
    const weekdays = document.querySelector('.weekdays');
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    if (!weekdays) {
        console.error('Элемент с классом weekdays не найден.');
        return;
    }

    weekdays.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const dayElement = document.createElement('li');
        const day = new Date(currentWeekStart);
        day.setDate(currentWeekStart.getDate() + i);
        dayElement.innerHTML = `${i === 0 ? 'Сегодня' : days[day.getDay()]}<br>${day.getDate()}`;
        dayElement.setAttribute('data-date', day.toISOString().split('T')[0]);
        weekdays.appendChild(dayElement);
    }

    weekdays.addEventListener('click', async (event) => {
        if (event.target.tagName === 'LI') {
            const selected = document.querySelector('.selected');
            if (selected) {
                selected.classList.remove('selected');
            }
            event.target.classList.add('selected');
            const data = await fetchData();
            if (data) {
                updateDOM(data);
            } else {
                console.error('Не удалось получить данные.');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    updateWeekdays();
    const data = await fetchData();
    if (data) {
        updateDOM(data);
    } else {
        console.error('Не удалось получить данные.');
    }
});

document.getElementById("loginButton").addEventListener("click", function() {
    window.location.href = "login.html";
});

document.querySelector('.prev-week').addEventListener("click", async function() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updateWeekdays();
    const data = await fetchData();
    if (data) {
        updateDOM(data);
    } else {
        console.error('Не удалось получить данные.');
    }
});

document.querySelector('.next-week').addEventListener("click", async function() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updateWeekdays();
    const data = await fetchData();
    if (data) {
        updateDOM(data);
    } else {
        console.error('Не удалось получить данные.');
    }
});