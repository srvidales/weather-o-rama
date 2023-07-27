$(function() {
  const key = 'WEATHER_APP_ID';
  const weatherAppId = localStorage.getItem(key);

  const cityName = 'Los Angeles';
  const stateCode = 'California';
  const countryCode = 'US';
  const limit = 5;

  let fetchedForecast;

  /**
   *
   * @param city
   * @param state
   * @param country
   * @param limit
   * @return {Promise<Response>}
   */
  function fetchGeolocation(city, state, country, limit) {
    return fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&limit=${limit}&appid=${weatherAppId}`);
  }

  /**
   * fetchForecast
   * @param latitude
   * @param longitude
   * @return {Promise<Response>}
   */
  function fetchForecast(latitude, longitude) {
    // dt: UNIX timestamp
    // dt_txt: GMT
    // temp: Kelvin
    return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${weatherAppId}&units=imperial`);
  }

  /**
   * fetchInfo
   */
  function fetchInfo(city, state, country, limit) {
    const promise = fetchGeolocation(city, state, country, limit);
    promise.then(function(response) {
      return response.json();
    }).then(function(data) {
      console.log(data);
      fetchForecast(data[0].lat, data[0].lon).then(function(response) {
        return response.json();
      }).then(function(data) {
        console.log(data);
        fetchedForecast = data;
        updateDay();
        return data;
      });
    });
  }


  /**
   * updateDay
   * @param dayIndex
   */
  function updateDay(dayIndex) {
    const elements = $('div[id^="day-"]');

    elements.each(function(index) {
      const dayForecast = getDayForecast(index);

      const element = this;
      console.log(element);

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
            children[index].textContent = dayForecast.temp;
            break;
          case 3:
            children[index].textContent = dayForecast.wind;
            break;
          case 4:
            children[index].textContent = dayForecast.humidity;
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

  // mockedFetchInfo(cityName, stateCode, countryCode, limit);
  fetchInfo(cityName, stateCode, countryCode, limit);
});
