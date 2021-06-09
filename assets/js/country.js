const intl = new Intl.NumberFormat();

const comboCountries = document.getElementById("cmbCountry");
const confirmed = document.getElementById("kpiconfirmed");
const deaths = document.getElementById("kpideaths");
const recovered = document.getElementById("kpirecovered");

const linesChart = document.getElementById("lines");
const startDate = document.getElementById("date_start");
const endDate = document.getElementById("date_end");

const filterButton = document.getElementById("filter");

const comboData = document.getElementById("cmbData");

let countriesName;
let globalData;

function setCovidNumbers(totalConfirmed, totalDeaths, totalRecovered) {
  confirmed.innerHTML = intl.format(totalConfirmed);
  deaths.innerHTML = intl.format(totalDeaths);
  recovered.innerHTML = intl.format(totalRecovered);
}

function getDateOnly(date = new Date()) {
  const iso = date.toISOString();
  return iso.substr(0, iso.indexOf("T"));
}

async function getGlobalData() {
  const response = await axios.get("https://api.covid19api.com/summary");
  return response.data;
}

async function getCountriesName() {
  const response = await axios.get("https://api.covid19api.com/countries");
  return response.data;
}

function getPreviousDate(date = new Date(), amount = 1) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - amount);
  return yesterday;
}

function getDiffInDays(date1, date2) {
  return (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
}

let chart;
async function renderChart(country, startDate, endDate, label) {
  const { data } = await axios.get(
    `https://api.covid19api.com/country/${country}?from=${getDateOnly(
      getPreviousDate(startDate, 1)
    )}&to=${getDateOnly(endDate)}`
  );

  const chartData = data
    .map((dayData, index) => {
      if (index === 0) {
        return null;
      }

      const yesterday = data[index - 1];
      const total = dayData[label] - yesterday[label];

      return total < 0 ? 0 : total;
    })
    .filter((x) => x !== null);

  const chartLabels = data
    .map((dayData, index) => {
      return index === 0 ? null : new Date(dayData.Date).toLocaleDateString();
    })
    .filter((x) => x !== null);

  const avg = Math.round(
    chartData.reduce((acc, curr) => acc + curr, 0) / chartData.length
  );
  const chartAvg = Array(chartData.length).fill(avg);

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(linesChart, {
    type: "line",
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: label,
          data: chartData,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
        {
          label: `Average of ${label}`,
          data: chartAvg,
          fill: false,
          borderColor: "red",
          tension: 0.1,
        },
      ],
    },
  });
}

async function renderSummaryNumbers(countryName) {
  const countryData = globalData.Countries.find((country) => {
    return country.CountryCode === countryName;
  });

  const { TotalConfirmed, TotalDeaths, TotalRecovered } = countryData;
  setCovidNumbers(TotalConfirmed, TotalDeaths, TotalRecovered);
}

async function onLoadPage() {
  globalData = await getGlobalData();
  countriesName = await getCountriesName();
  countriesName = _.sortBy(countriesName, function (obj) {
    return obj.Country;
  });

  const countryOptions = _.reduce(
    countriesName,
    function (acc, curr) {
      acc += `<option value="${curr.ISO2}" ${
        curr.Country === "Brazil" ? "selected=true" : ""
      }>${curr.Country}</option>`;
      return acc;
    },
    ""
  );
  comboCountries.innerHTML += countryOptions;

  renderSummaryNumbers("BR");

  let date = new Date();
  const dateFrom = getPreviousDate(date, 30);
  renderChart("BR", dateFrom, date, "Deaths");
}
onLoadPage();

async function handleStatusChange() {
  if (!startDate.value || !endDate.value) {
    alert("Escolha uma data de início e fim");
    return;
  }

  const countryValue = comboCountries.value;

  renderSummaryNumbers(countryValue);

  renderChart(
    countryValue,
    new Date(startDate.value),
    new Date(endDate.value),
    comboData.value
  );
}

filterButton.addEventListener("click", handleStatusChange);
