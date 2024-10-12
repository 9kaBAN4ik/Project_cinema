import { Data } from './data.js';

document.addEventListener('DOMContentLoaded', async () => {
    const dataInstance = new Data();
    await loadInitialData();

    const hallModal = document.getElementById('hallModal');
    const hallNameInput = document.getElementById('hallName');
    const confirmAddHallButton = document.getElementById('confirmAddHall');
    const cancelAddHallButton = document.getElementById('cancelAddHall');
    const createHallButton = document.getElementById('createHall');
    const closeModalButtons = document.querySelectorAll('.close');
    const hallButtonsContainer = document.getElementById('hallButtonsContainer');
    const toggleSalesButton = document.getElementById('toggleSalesButton');
    const salesStatus = document.getElementById('salesStatus');
    const salesHallButtonsContainer = document.getElementById('salesHallButtonsContainer');
    
    let selectedHallId = null;
    let currentHallStatus = null;

    const rowsInput = document.getElementById('rowsInput');
    const seatsInput = document.getElementById('seatsInput');
    const saveConfigButton = document.getElementById('saveConfig');
    const seatMap = document.getElementById('seatMap');
    

    const regularPriceInput = document.getElementById('regularPrice');
    const vipPriceInput = document.getElementById('vipPrice');
    const savePriceConfigButton = document.getElementById('savePriceConfig');

    const movieModal = document.getElementById('movieModal');
    const movieNameInput = document.getElementById('movieName');
    const movieDurationInput = document.getElementById('movieDuration');
    const movieDescriptionInput = document.getElementById('movieDescription');
    const movieCountryInput = document.getElementById('movieCountry');
    const moviePosterInput = document.getElementById('moviePoster');
    const confirmAddMovieButton = document.getElementById('confirmAddMovie');
    const cancelAddMovieButton = document.getElementById('cancelAddMovie');
    const addMovieButton = document.getElementById('addMovieButton');
    const uploadPosterButton = document.getElementById('uploadPoster');

    const seanceModal = document.getElementById('seanceModal');
    const seanceHallSelect = document.getElementById('seanceHallSelect');
    const seanceFilmSelect = document.getElementById('seanceFilmSelect');
    const seanceTimeInput = document.getElementById('seanceTime');
    const confirmAddSeanceButton = document.getElementById('confirmAddSeance');
    const cancelAddSeanceButton = document.getElementById('cancelAddSeance');
    
    const toggleButtons = [
        { buttonId: 'toggleSection', sectionId: 'hallList' },
        { buttonId: 'toggleConfigSection', sectionId: 'configSection' },
        { buttonId: 'togglePriceConfigSection', sectionId: 'priceConfigSection' },
        { buttonId: 'toggleScheduleConfigSection', sectionId: 'scheduleConfigSection' },
        { buttonId: 'toggleSalesSection', sectionId: 'salesSection' }
    ];

    toggleButtons.forEach(({ buttonId, sectionId }) => {
        const button = document.getElementById(buttonId);
        const section = document.getElementById(sectionId);
        const parentSection = button.closest('section');

        if (button && section) {
            button.addEventListener('click', () => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                button.setAttribute('aria-expanded', !isExpanded);
                section.classList.toggle('hidden');
                parentSection.classList.toggle('collapsed');
                button.innerHTML = isExpanded ? '▼' : '▲';
            });
        }
    });

    if (createHallButton) {
        createHallButton.addEventListener('click', () => {
            hallModal.style.display = 'block';
        });
    } 
    if (addMovieButton) {
        addMovieButton.addEventListener('click', () => {
            movieModal.style.display = 'block';
        });
    } 

    if (uploadPosterButton && moviePosterInput) {
        uploadPosterButton.addEventListener('click', () => {
            moviePosterInput.click();
        });

        moviePosterInput.addEventListener('change', () => {
            const file = moviePosterInput.files[0];
            if (file) {
                const validFormats = ['image/png'];
                if (!validFormats.includes(file.type) || file.size > 3145728) {
                    moviePosterInput.value = ''; // Сбросить поле ввода файла
                } 
            }
        });
    } 

    if (closeModalButtons) {
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                hallModal.style.display = 'none';
                movieModal.style.display = 'none';
                seanceModal.style.display = 'none';
            });
        });
    } 

    if (cancelAddHallButton) {
        cancelAddHallButton.addEventListener('click', () => {
            hallModal.style.display = 'none';
        });
    } 

    if (confirmAddHallButton) {
        confirmAddHallButton.addEventListener('click', async () => {
            const hallName = hallNameInput.value.trim();

            if (hallName) {
                try {
                    const result = await dataInstance.addHall(hallName);
                    if (result && result.success) {
                        hallModal.style.display = 'none';
                        updateHallList(result.result.halls);
                        populateHallButtons(result.result.halls, 'hallButtonsContainerConfig');
                    } 
                } catch (error) {
                }
            }
        });
    }

    if (saveConfigButton) {
    saveConfigButton.addEventListener('click', async () => {
        const rowCount = parseInt(rowsInput.value, 10);
        const placeCount = parseInt(seatsInput.value, 10);

        if (rowCount > 12 || placeCount > 12) {
            alert('Максимальный размер зала 12х12.');
            return;
        }

        updateHallConfiguration(rowCount, placeCount);

        const config = generateSeatConfig();

        const isValidConfig = validateConfig(config, rowCount, placeCount);
        if (!isValidConfig) {
            return;
        }

        const selectedHallId = getSelectedHallId();
        if (selectedHallId) {
            try {
                const params = new FormData();
                params.set('rowCount', rowCount.toString());
                params.set('placeCount', placeCount.toString());
                params.set('config', JSON.stringify(config));

                const response = await fetch(`https://shfe-diplom.neto-server.ru/hall/${selectedHallId}`, {
                    method: 'POST',
                    body: params
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result && result.hall_config) {
                        updateSeatingChart(result.hall_config); // Обновляем отображение сидений после сохранения конфигурации
                    }
                }
            } catch (error) {
                // Обработка ошибки
            }
        }
    });
}

function validateConfig(config, rowCount, placeCount) {
    if (!Array.isArray(config) || config.length !== rowCount) {
        return false;
    }
    for (let row of config) {
        if (!Array.isArray(row) || row.length !== placeCount) {
            return false;
        }
        for (let seat of row) {
            if (!['standart', 'vip', 'disabled'].includes(seat)) {
                return false;
            }
        }
    }
    return true;
}

if (savePriceConfigButton) {
    savePriceConfigButton.addEventListener('click', async () => {
        const priceStandart = regularPriceInput.value;
        const priceVip = vipPriceInput.value;

        const selectedHallId = getSelectedHallId();
        if (selectedHallId) {
            try {
                const result = await dataInstance.updateHallPrices(selectedHallId, priceStandart, priceVip);
                if (result) {
                }
            } catch (error) {
            }
        }
    });
}

if (confirmAddMovieButton) {
    confirmAddMovieButton.addEventListener('click', async () => {
        const movieName = movieNameInput.value.trim();
        const movieDuration = movieDurationInput.value;
        const movieDescription = movieDescriptionInput.value.trim();
        const movieCountry = movieCountryInput.value.trim();
        const moviePoster = moviePosterInput.files[0];

        if (movieName && movieDuration && movieDescription && movieCountry && moviePoster) {
            if (moviePoster.size > 3145728 || moviePoster.type !== 'image/png') {
                return;
            }

            const formData = new FormData();
            formData.append('filmName', movieName);
            formData.append('filmDuration', movieDuration);
            formData.append('filmDescription', movieDescription);
            formData.append('filmOrigin', movieCountry);
            formData.append('filePoster', moviePoster);

            try {
                const response = await fetch('https://shfe-diplom.neto-server.ru/film', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    movieModal.style.display = 'none';
                    updateMovieList(result.films);
                }
            } catch (error) {
            }
        }
    });
}

if (cancelAddMovieButton) {
    cancelAddMovieButton.addEventListener('click', () => {
        movieModal.style.display = 'none';
    });
}

if (confirmAddSeanceButton) {
    confirmAddSeanceButton.addEventListener('click', async () => {
        const seanceHallId = seanceHallSelect.value;
        const seanceFilmId = seanceFilmSelect.value;
        const seanceTime = seanceTimeInput.value.trim();

        if (seanceHallId && seanceFilmId && seanceTime) {
            const formData = new FormData();
            formData.append('seanceHallId', seanceHallId);
            formData.append('seanceFilmId', seanceFilmId);
            formData.append('seanceTime', seanceTime);

            try {
                const result = await dataInstance.addSeance(formData);
                if (result && result.seances) {
                    seanceModal.style.display = 'none';
                    updateSeanceList(result.seances);
                }
            } catch (error) {
            }
        }
    });
}

if (cancelAddSeanceButton) {
    cancelAddSeanceButton.addEventListener('click', () => {
        seanceModal.style.display = 'none';
    });
}

if (salesStatus && toggleSalesButton) {
    toggleSalesButton.addEventListener('click', async () => {
        if (selectedHallId !== null) {
            try {
                const newStatus = currentHallStatus === 1 ? 0 : 1;
                const result = await dataInstance.toggleHallSales(selectedHallId, newStatus);
                if (result) {
                    currentHallStatus = newStatus;
                    salesStatus.textContent = `Текущий статус: ${newStatus === 1 ? 'Открыт' : 'Закрыт'}`;
                    toggleSalesButton.textContent = newStatus === 1 ? 'Закрыть продажу билетов' : 'Открыть продажу билетов';
                }
            } catch (error) {
            }
        }
    });
}



function updateHallList(halls) {
    const hallsList = document.getElementById('halls');
    hallsList.innerHTML = '';

    halls.forEach(hall => {
        const hallItem = document.createElement('li');
        hallItem.style.display = 'flex';
        hallItem.style.alignItems = 'center';
        hallItem.style.justifyContent = 'space-between';
        hallItem.style.marginBottom = '10px';

        const hallName = document.createElement('span');
        hallName.textContent = hall.hall_name;
        hallName.style.flexGrow = '1';

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.classList.add('delete-hall');
        deleteButton.addEventListener('click', async () => {
            const result = await dataInstance.deleteHall(hall.id);
            if (result && result.success) {
                updateHallList(result.result.halls);
                populateHallButtons(result.result.halls, 'hallButtonsContainerConfig');
            }
        });

        hallItem.appendChild(hallName);
        hallItem.appendChild(deleteButton);
        hallsList.appendChild(hallItem);
    });
}

function updateMovieList(films) {
    const movieList = document.getElementById('movieList');
    movieList.innerHTML = '';

    films.forEach(film => {
        const filmItem = document.createElement('div');
        filmItem.className = 'movie-item';
        filmItem.draggable = true;
        filmItem.dataset.filmId = film.id;

        const filmPoster = document.createElement('img');
        filmPoster.src = film.film_poster;
        filmPoster.alt = `Постер фильма ${film.film_name}`;

        const movieDetails = document.createElement('div');
        movieDetails.className = 'movie-details';

        const movieTitle = document.createElement('div');
        movieTitle.className = 'movie-title';
        movieTitle.textContent = film.film_name;

        const movieDuration = document.createElement('div');
        movieDuration.className = 'movie-duration';
        movieDuration.textContent = `${film.film_duration} минут`;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-movie';
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', async () => {
            const result = await dataInstance.deleteFilm(film.id);
            if (result && result.films) {
                updateMovieList(result.films);
            }
        });

        movieDetails.appendChild(movieTitle);
        movieDetails.appendChild(movieDuration);
        filmItem.appendChild(filmPoster);
        filmItem.appendChild(movieDetails);
        filmItem.appendChild(deleteButton);
        movieList.appendChild(filmItem);

        // Добавляем обработчики событий для перетаскивания
        filmItem.addEventListener('dragstart', handleDragStart);
        filmItem.addEventListener('dragend', handleDragEnd);
    });

    // Добавляем обработчики событий для таймлайнов
    const timelines = document.querySelectorAll('.timeline');
    timelines.forEach(timeline => {
        timeline.addEventListener('dragover', handleDragOver);
        timeline.addEventListener('drop', handleDrop);
    });
}

function updateSeanceList(seances) {
    const seancesList = document.getElementById('seances');
    if (!seancesList) {
        return;
    }

    seancesList.innerHTML = '';

    seances.forEach(seance => {
        const seanceItem = document.createElement('li');
        seanceItem.textContent = `Сеанс ${seance.id}: ${seance.seance_time}`;
        seancesList.appendChild(seanceItem);
    });
}

function generateSeatConfig() {
    const config = [];
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => {
        const seats = row.querySelectorAll('.seat');
        const rowConfig = [];
        seats.forEach(seat => {
            rowConfig.push(seat.dataset.seatType);
        });
        config.push(rowConfig);
    });
    return config;
}

function getSelectedHallId() {
    const selectedHallButton = document.querySelector('.hall-button.active');
    return selectedHallButton ? selectedHallButton.dataset.hallId : null;
}

function updateSeatingChart(hallConfig) {
    const seatsContainer = document.getElementById('seats-container');
    if (!seatsContainer) {
        return;
    }
    seatsContainer.innerHTML = '';
    if (Array.isArray(hallConfig)) {
        hallConfig.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.classList.add('row');
            row.forEach((seat, seatIndex) => {
                const seatElement = document.createElement('div');
                seatElement.classList.add('seat');
                seatElement.dataset.seat = `${rowIndex + 1}-${seatIndex + 1}`;
                seatElement.dataset.seatType = seat;
                seatElement.dataset.row = rowIndex + 1;
                seatElement.dataset.place = seatIndex + 1;

                seatElement.classList.add(seat);

                seatElement.addEventListener('click', () => {
                    toggleSeatType(seatElement);
                });

                rowElement.appendChild(seatElement);
            });
            seatsContainer.appendChild(rowElement);
        });
    }
}

function toggleSeatType(seatElement) {
    const types = ['standart', 'vip', 'disabled'];
    let currentType = seatElement.dataset.seatType;
    let nextTypeIndex = (types.indexOf(currentType) + 1) % types.length;
    let nextType = types[nextTypeIndex];

    seatElement.dataset.seatType = nextType;
    seatElement.className = 'seat ' + nextType;
}

function populateHallButtons(halls, containerId) {
    const hallButtonsContainer = document.getElementById(containerId);

    if (!hallButtonsContainer) {
        return;
    }

    hallButtonsContainer.innerHTML = '';
    halls.forEach(hall => {
        const button = document.createElement('button');
        button.classList.add('hall-button');
        button.dataset.hallId = hall.id;
        button.textContent = hall.hall_name;

        button.addEventListener('click', async () => {
            document.querySelectorAll(`#${containerId} .hall-button`).forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedHallId = hall.id;

            // Обновляем цены в полях ввода
            if (regularPriceInput && vipPriceInput) {
                regularPriceInput.value = hall.hall_price_standart || 0;
                vipPriceInput.value = hall.hall_price_vip || 0;
            }

            // Если это секция конфигурации залов, обновляем статус и карту мест
            if (containerId === 'hallButtonsContainerConfig') {
                currentHallStatus = hall.hall_open;
                salesStatus.textContent = `Текущий статус: ${hall.hall_open === 1 ? 'Открыт' : 'Закрыт'}`;
                toggleSalesButton.textContent = hall.hall_open === 1 ? 'Закрыть продажу билетов' : 'Открыть продажу билетов';
                updateSeatingChart(hall.hall_config);
            }
        });

        hallButtonsContainer.appendChild(button);
    });
}
function updateHallConfiguration(rowCount, placeCount) {
    const seatsContainer = document.getElementById('seats-container');
    let currentRows = seatsContainer.querySelectorAll('.row');

    // Удаляем лишние ряды, если их больше чем rowCount
    while (currentRows.length > rowCount) {
        seatsContainer.removeChild(currentRows[currentRows.length - 1]);
        currentRows = seatsContainer.querySelectorAll('.row');
    }

    // Добавляем недостающие ряды, если их меньше чем rowCount
    while (currentRows.length < rowCount) {
        const newRow = document.createElement('div');
        newRow.classList.add('row');
        for (let i = 0; i < placeCount; i++) {
            const seatElement = document.createElement('div');
            seatElement.classList.add('seat');
            seatElement.dataset.seat = `${currentRows.length + 1}-${i + 1}`;
            seatElement.dataset.seatType = 'standart';
            seatElement.dataset.row = currentRows.length + 1;
            seatElement.dataset.place = i + 1;

            seatElement.addEventListener('click', () => {
                toggleSeatType(seatElement);
            });

            newRow.appendChild(seatElement);
        }
        seatsContainer.appendChild(newRow);
        currentRows = seatsContainer.querySelectorAll('.row');
    }

    // Обновляем количество мест в существующих рядах
    currentRows.forEach((row, rowIndex) => {
        let currentSeats = row.querySelectorAll('.seat');

        // Удаляем лишние места, если их больше чем placeCount
        while (currentSeats.length > placeCount) {
            row.removeChild(currentSeats[currentSeats.length - 1]);
            currentSeats = row.querySelectorAll('.seat');
        }

        // Добавляем недостающие места, если их меньше чем placeCount
        while (currentSeats.length < placeCount) {
            const seatElement = document.createElement('div');
            seatElement.classList.add('seat');
            seatElement.dataset.seat = `${rowIndex + 1}-${currentSeats.length + 1}`;
            seatElement.dataset.seatType = 'standart';
            seatElement.dataset.row = rowIndex + 1;
            seatElement.dataset.place = currentSeats.length + 1;

            seatElement.addEventListener('click', () => {
                toggleSeatType(seatElement);
            });

            row.appendChild(seatElement);
            currentSeats = row.querySelectorAll('.seat');
        }
    });
}
async function loadInitialData() {
    try {
        const allData = await dataInstance.getAllData();

        if (allData && allData.success && allData.result) {
            const { halls, films, seances } = allData.result;

            // Сохранение фильмов в dataInstance
            dataInstance.films = films;

            if (halls && halls.length > 0) {
                updateHallList(halls);
                populateHallButtons(halls, 'hallButtonsContainerConfig'); // Для конфигурации залов
                populateHallButtons(halls, 'hallButtonsContainerPrice'); // Для конфигурации цен
                populateSalesHallButtons(halls); // Для открытия/закрытия продаж
                updateSeatingChart(halls[0].hall_config);
                displayHallsAndSeances(halls, seances, films);
            }

            if (films && films.length > 0) {
                updateMovieList(films);
            }

            if (seances && seances.length > 0) {
                updateSeanceList(seances);
            }
        }
    } catch (error) {
    }
}

function displayHallsAndSeances(halls, seances, films) {
    const scheduleContainer = document.getElementById('schedule');
    scheduleContainer.innerHTML = '';

    halls.forEach(hall => {
        const hallElement = document.createElement('div');
        hallElement.className = 'hall';
        hallElement.dataset.hallId = hall.id;

        const hallTitle = document.createElement('h3');
        hallTitle.textContent = hall.hall_name;
        hallElement.appendChild(hallTitle);

        const timeline = document.createElement('div');
        timeline.className = 'timeline';
        timeline.dataset.hallId = hall.id;

        const hallSeances = seances.filter(seance => seance.seance_hallid === hall.id);
        hallSeances.forEach(seance => {
            const film = films.find(film => film.id === seance.seance_filmid);

            if (film) {
                const seanceElement = document.createElement('div');
                seanceElement.className = 'seance';
                seanceElement.draggable = true;
                seanceElement.dataset.seanceId = seance.id;
                seanceElement.textContent = `${film.film_name} (${seance.seance_time})`;

                // Вычисляем позицию и ширину сеанса на таймлайне
                const startTime = seance.seance_time.split(':');
                const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
                const duration = film.film_duration;
                const endMinutes = startMinutes + duration;

                seanceElement.style.left = `${(startMinutes / 1440) * 100}%`; // 1440 минут в сутках
                seanceElement.style.width = `${(duration / 1440) * 100}%`;

                // Добавляем значок удаления
                const deleteIcon = document.createElement('span');
                deleteIcon.className = 'delete-icon';
                deleteIcon.innerHTML = '🗑️';
                deleteIcon.addEventListener('click', async () => {
                    const confirmDelete = confirm('Вы точно хотите удалить сеанс?');
                    if (confirmDelete) {
                        try {
                            const result = await dataInstance.deleteSeance(seance.id);
                            if (result && result.seances) {
                                displayHallsAndSeances(result.halls, result.seances, dataInstance.films);
                            }
                        } catch (error) {
                        }
                    }
                });

                seanceElement.appendChild(deleteIcon);
                seanceElement.addEventListener('dragstart', handleDragStart);
                seanceElement.addEventListener('dragend', handleDragEnd);

                timeline.appendChild(seanceElement);
            }
        });

        hallElement.appendChild(timeline);
        scheduleContainer.appendChild(hallElement);
    });

    const timelines = document.querySelectorAll('.timeline');
    timelines.forEach(timeline => {
        timeline.addEventListener('dragover', handleDragOver);
        timeline.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(event) {
    const draggedElement = event.target;
    event.dataTransfer.setData('text/plain', draggedElement.dataset.filmId || draggedElement.dataset.seanceId);
    draggedElement.classList.add('dragging');
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
}

async function handleDrop(event) {
    event.preventDefault();
    const timeline = event.currentTarget;
    const filmId = event.dataTransfer.getData('text/plain');
    const hallId = timeline.dataset.hallId;

    if (filmId && hallId) {
        const seanceTime = prompt('Введите время сеанса (например, 14:30):');
        if (seanceTime) {
            const seanceData = new URLSearchParams();
            seanceData.append('seanceHallid', hallId);
            seanceData.append('seanceFilmid', filmId);
            seanceData.append('seanceTime', seanceTime);

            try {
                const response = await fetch('https://shfe-diplom.neto-server.ru/seance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: seanceData.toString()
                });

                const result = await response.json();

                if (result.success) {
                    if (result.seances) {
                        displayHallsAndSeances(result.halls, result.seances, dataInstance.films);
                    }
                }
            } catch (error) {
            }
        }
    }
}

async function handleDeleteSeance(seanceId) {
    try {
        const response = await fetch(`https://shfe-diplom.neto-server.ru/seance/${seanceId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            if (result.seances) {
                updateSeanceList(result.seances);
                displayHallsAndSeances(result.halls, result.seances, dataInstance.films);
            }
        }
    } catch (error) {
    }
}

async function handleDeleteDrop(event) {
    event.preventDefault();
    const seanceId = event.dataTransfer.getData('text/plain');

    if (seanceId) {
        const confirmDelete = confirm('Вы точно хотите удалить сеанс?');
        if (confirmDelete) {
            try {
                const result = await dataInstance.deleteSeance(seanceId);
                if (result && result.seances) {
                    updateSeanceList(result.seances);
                    displayHallsAndSeances(result.halls, result.seances, dataInstance.films);
                }
            } catch (error) {
            }
        }
    }
}

function populateSalesHallButtons(halls) {
    const salesHallButtonsContainer = document.getElementById('salesHallButtonsContainer');
    if (!salesHallButtonsContainer) {
        return;
    }

    salesHallButtonsContainer.innerHTML = '';
    halls.forEach(hall => {
        const button = document.createElement('button');
        button.classList.add('hall-button');
        button.dataset.hallId = hall.id;
        button.textContent = hall.hall_name;

        button.addEventListener('click', () => {
            document.querySelectorAll('#salesHallButtonsContainer .hall-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedHallId = hall.id;
            currentHallStatus = hall.hall_open;
            salesStatus.textContent = `Текущий статус: ${hall.hall_open === 1 ? 'Открыт' : 'Закрыт'}`;
            toggleSalesButton.textContent = hall.hall_open === 1 ? 'Закрыть продажу билетов' : 'Открыть продажу билетов';
        });

        salesHallButtonsContainer.appendChild(button);
    });
}

// Запуск начальной загрузки данных
loadInitialData();
});