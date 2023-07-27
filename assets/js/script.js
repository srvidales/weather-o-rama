$(function() {
  const key = 'WEATHER_APP_ID';
  const weatherAppId = localStorage.getItem(key);

  const countryCode = 'US';
  const limit = 5;

  let fetchedForecast;
  let searchHistory = [];

  /**
   * fetchGeolocation
   * @param city
   * @param country
   * @param limit
   * @returns {Promise<Response>}
   */
  function fetchGeolocation(city, country, limit) {
    return fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=${limit}&appid=${weatherAppId}`);
  }

  /**
   * fetchForecast
   * @param latitude
   * @param longitude
   * @return {Promise<Response>}
   */
  function fetchForecast(latitude, longitude) {
    return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${weatherAppId}&units=imperial`);
  }

  /**
   * fetchInfo
   */
  async function fetchInfo(city, country, limit, button) {
    let result;

    result = await fetchGeolocation(city, country, limit);
    const fetchedGeolocation = await result.json();
    const lat = fetchedGeolocation[0].lat;
    const lon = fetchedGeolocation[0].lon;
    addLatLonToButton(button, lat, lon);

    result = await fetchForecast(lat, lon);
    fetchedForecast = await result.json();

    const info = {
      name: fetchedForecast.city.name,
      lat: fetchedForecast.city.coord.lat,
      lon: fetchedForecast.city.coord.lon,
    };

    searchHistory.push(info);

    localStorage.setItem('history', JSON.stringify(searchHistory));
    updateCurrentForecast();
    updateFiveDayForecast();
  }

  /**
   *
   */
  function updateCurrentForecast() {
    const weatherDiv = $('#weather');
    const children = weatherDiv.children();

    for (let index = 0; index < children.length; index++) {
      switch (index) {
        case 0:
          children[index].textContent = fetchedForecast.city.name;
          children[index].textContent += ' (' +
            dayjs.unix(fetchedForecast.list[0].dt).format('M/D/YYYY') + ')';
          break;
        case 1:
          children[index].setAttribute('src',
            `https://openweathermap.org/img/w/${fetchedForecast.list[0].weather[0].icon}.png`);
          children[index].setAttribute('alt', fetchedForecast.list[0].weather[0].description);
          break;
        case 2:
          children[index].children[0].textContent =
            fetchedForecast.list[0].main.temp;
          break;
        case 3:
          children[index].children[0].textContent =
            fetchedForecast.list[0].wind.speed;
          break;
        case 4:
          children[index].children[0].textContent =
            fetchedForecast.list[0].main.humidity;
          break;
      }
    }
  }

  /**
   * updateDay
   */
  function updateFiveDayForecast() {
    const elements = $('div[id^="day-"]');

    elements.each(function(index) {
      const dayForecast = getDayForecast(index);
      const element = this;
      const children = element.children;

      for (let index = 0; index < children.length; index++) {
        switch (index) {
          case 0:
            children[index].textContent = dayForecast.date;
            break;
          case 1:
            children[index].setAttribute('src',
              `https://openweathermap.org/img/w/${dayForecast.icon.code}.png`);
            children[index].setAttribute('alt', dayForecast.icon.description);
            break;
          case 2:
            children[index].children[0].textContent = dayForecast.temp;
            break;
          case 3:
            children[index].children[0].textContent = dayForecast.wind;
            break;
          case 4:
            children[index].children[0].textContent = dayForecast.humidity;
            break;
        }
      }
    });
  }

  /**
   *
   * @param dayIndex
   * @return {{date: string, glyph: string, temp: string, humidity: string, wind: string}}
   */
  function getDayForecast(dayIndex) {
    const calculatedIndex = 6 + (8 * dayIndex);
    const listItem = fetchedForecast.list[calculatedIndex];
    return {
      date: dayjs.unix(listItem.dt).format('M/D/YYYY'),
      icon: {
        code: listItem.weather[0].icon,
        description: listItem.weather[0].description,
      },
      temp: listItem.main.temp,
      wind: listItem.wind.speed,
      humidity: listItem.main.humidity,
    };
  }

  /**
   *
   */
  function addSearchButtonListener() {
    $('#search-button').on('click', function() {
      const textArea = $('#search-text');
      const city = textArea.val();
      const button = addCityButton(city);
      textArea.val('');
      fetchInfo(city, countryCode, limit, button);
    });
  }

  /**
   * addLatLonToButton
   */
  function addLatLonToButton(button, lat, lon) {
    button.attr('data-lat', lat);
    button.attr('data-lon', lon);
  }

  /**
   * addCityButton
   * @param name
   */
  function addCityButton(name) {
    const citiesDiv = $('#cities');
    const element = $(`<button class="city-button">${name}</button>`);
    element.on('click', function() {
      const lat = element.attr('data-lat');
      const lon = element.attr('data-lon');
      fetchForecast(lat, lon).then(function(response) {
        return response.json();
      }).then(function(data) {
        fetchedForecast = data;
        updateCurrentForecast();
        updateFiveDayForecast();
        return data;
      });
    });

    citiesDiv.append(element);
    return element;
  }

  /**
   * addClearButtonListener
   */
  function addClearButtonListener() {
    const citiesDiv = $('#cities');
    const button = $('#clear-button');
    searchHistory = [];
    button.on('click', function() {
      citiesDiv.empty();
      localStorage.removeItem('history');
    });
  }

  /**
   *
   */
  function addSearchHistory() {
    const keyValue = localStorage.getItem('history');
    if (keyValue) {
      searchHistory = JSON.parse(keyValue);
      const citiesDiv = $('#cities');

      for (let i = 0; i < searchHistory.length; i++) {
        const element = $(`<button class="city-button">xx</button>`);
        element.html(searchHistory[i].name);
        element.attr('data-lat', searchHistory[i].lat);
        element.attr('data-lon', searchHistory[i].lon);
        citiesDiv.append(element);
        // TODO: Add element onclick event.
      }
    }
  }

  // mockedFetchInfo(cityName, stateCode, countryCode, limit);
  addSearchButtonListener();
  addClearButtonListener();
  addSearchHistory();
});
