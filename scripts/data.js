export class Data {
    constructor() {
        this.URL = 'https://shfe-diplom.neto-server.ru';
        this.header = {
            'Content-Type': 'application/json;charset=utf-8'
        };
        this.cache = {
            allData: null,
            hallConfigs: {},
            films: null,
            seances: null
        };
    }

    async getAllData() {
        if (this.cache.allData) {
            return this.cache.allData;
        }
        try {
            const path = `${this.URL}/alldata`;
            const result = await fetch(path, {
                method: 'GET',
                headers: this.header,
            });
            if (result.ok) {
                this.cache.allData = await result.json();
                return this.cache.allData;
            } else {
                console.error('Ошибка при получении данных:', result.status, result.statusText);
                return null;
            }
        } catch (e) {
            console.error('Ошибка при выполнении запроса:', e);
            return null;
        }
    }

    async getHallConfig(hallId) {
        if (this.cache.hallConfigs[hallId]) {
            return this.cache.hallConfigs[hallId];
        }
        try {
            const path = `${this.URL}/hallconfig?hallId=${hallId}`;
            const result = await fetch(path, {
                method: 'GET',
                headers: this.header,
            });
            if (result.ok) {
                this.cache.hallConfigs[hallId] = await result.json();
                return this.cache.hallConfigs[hallId];
            } else {
                console.error('Ошибка при получении данных:', result.status, result.statusText);
                return null;
            }
        } catch (e) {
            console.error('Ошибка при выполнении запроса:', e);
            return null;
        }
    }

    async login(email, password) {
        try {
            const path = `${this.URL}/login`;
            const result = await fetch(path, {
                method: 'POST',
                headers: this.header,
                body: JSON.stringify({ login: email, password: password })
            });
            if (result.ok) {
                return result.json();
            } else {
                console.error('Ошибка при авторизации:', result.status, result.statusText);
                return null;
            }
        } catch (e) {
            console.error('Ошибка при выполнении запроса:', e);
            return null;
        }
    }

    async addHall(hallName) {
        try {
            const params = new FormData();
            params.set('hallName', hallName);

            const result = await fetch(`${this.URL}/hall`, {
                method: 'POST',
                body: params
            });

            if (result.ok) {
                this.cache.allData = null; // Сброс кэша после изменения данных
                return result.json();
            } else {
                console.error('Ошибка при добавлении зала:', result.status, result.statusText);
                return null;
            }
        } catch (e) {
            console.error('Ошибка при выполнении запроса:', e);
            return null;
        }
    }

    async deleteHall(hallId) {
        try {
            const result = await fetch(`${this.URL}/hall/${hallId}`, {
                method: 'DELETE'
            });

            if (result.ok) {
                this.cache.allData = null; // Сброс кэша после изменения данных
                return result.json();
            } else {
                console.error('Ошибка при удалении зала:', result.status, result.statusText);
                return null;
            }
        } catch (e) {
            console.error('Ошибка при выполнении запроса:', e);
            return null;
        }
    }

    async updateHallConfig(hallId, rowCount, placeCount, config) {
        try {
            const params = new FormData();
            params.set('rowCount', rowCount);
            params.set('placeCount', placeCount);
            params.set('config', JSON.stringify(config));

            const result = await fetch(`${this.URL}/hall/${hallId}`, {
                method: 'POST',
                body: params
            });

            if (result.ok) {
                this.cache.allData = null; // Сброс кэша после изменения данных
                this.cache.hallConfigs[hallId] = null; // Сброс кэша конкретного зала
                return result.json();
            } else {
                console.error('Ошибка при изменении конфигурации зала:', result.status, result.statusText);
                return null;
            }
        } catch (e) {
            console.error('Ошибка при выполнении запроса:', e);
            return null;
        }
    }

    async updateHallPrices(hallId, priceStandart, priceVip) {
        try {
            const params = new FormData();
            params.set('priceStandart', priceStandart);
            params.set('priceVip', priceVip);

            const result = await fetch(`${this.URL}/price/${hallId}`, {
                method: 'POST',
                body: params
            });

            if (result.ok) {
                this.cache.allData = null; // Сброс кэша после изменения данных
                return result.json();
            } else {
                console.error('Ошибка при изменении стоимости билетов:', result.status, result.statusText);
                return null;
            }
        } catch (e) {
            console.error('Ошибка при выполнении запроса:', e);
            return null;
        }
    }

    async toggleHallSales(hallId, hallOpen) {
        try {
            const params = new FormData();
            params.set('hallOpen', hallOpen.toString());

            const result = await fetch(`${this.URL}/open/${hallId}`, {
                method: 'POST',
                body: params
            });

            if (result.ok) {
                this.cache.allData = null; // Сброс кэша после изменения данных
                return result.json();
            } else {
                console.error('Ошибка при изменении статуса зала:', result.status, result.statusText);
                return null;
            }
        } catch (e) {
            console.error('Ошибка при выполнении запроса:', e);
            return null;
        }
    }

    async addFilm(formData) {
        try {
            const result = await fetch(`${this.URL}/film`, {
                method: 'POST',
                body: formData
            });

            if (result.ok) {
                this.cache.allData = null; // Сброс кэша после изменения данных
                this.cache.films = null; // Сброс кэша фильмов
                return result.json();
            } else {
                console.error('Ошибка при добавлении фильма:', result.status, result.statusText);
                return null;
            }
        } catch (e) {
            console.error('Ошибка при выполнении запроса:', e);
            return null;
        }
    }

    async deleteFilm(filmId) {
        try {
            const result = await fetch(`${this.URL}/film/${filmId}`, {
                method: 'DELETE'
            });

            if (result.ok) {
                this.cache.allData = null; // Сброс кэша после изменения данных
                this.cache.films = null; // Сброс кэша фильмов
                return result.json();
            } else {
                console.error('Ошибка при удалении фильма:', result.status, result.statusText);
                return null;
            }
        } catch (e) {
            console.error('Ошибка при выполнении запроса:', e);
            return null;
        }
    }

    async addSeance(formData) {
    try {
        const result = await fetch(`${this.URL}/seance`, {
            method: 'POST',
            body: formData
        });

        if (result.ok) {
            this.cache.allData = null; // Сброс кэша после изменения данных
            this.cache.seances = null; // Сброс кэша сеансов

            const jsonResponse = await result.json();
            console.log('Server response:', jsonResponse);

            return jsonResponse;
        } else {
            console.error('Ошибка при добавлении сеанса:', result.status, result.statusText);
            return null;
        }
    } catch (e) {
        console.error('Ошибка при выполнении запроса:', e);
        return null;
    }
}

    async deleteSeance(seanceId) {
        try {
            const result = await fetch(`${this.URL}/seance/${seanceId}`, {
                method: 'DELETE'
            });

            if (result.ok) {
                this.cache.allData = null; // Сброс кэша после изменения данных
                this.cache.seances = null; // Сброс кэша сеансов
                return result.json();
            } else {
                console.error('Ошибка при удалении сеанса:', result.status, result.statusText);
                return null;
            }
        } catch (e) {
            console.error('Ошибка при выполнении запроса:', e);
            return null;
        }
    }
}