// arrumar a data do update date

const intl = new Intl.NumberFormat();

let confirmed = document.querySelector("#confirmed");
let deaths = document.querySelector("#deaths");
let recovered = document.querySelector("#recovered");
let updateDate = document.getElementById("update-date");

let pizzaChart = document.getElementById("pizza");
let barChart = document.getElementById("bar-chart");

let globalData;

function getDateOnly(date = new Date()) {
  const iso = date.toISOString();
  return iso.substr(0, iso.indexOf("T"));
}

function setCovidNumbers(totalConfirmed, totalDeaths, totalRecovered, date) {
  confirmed.innerHTML = intl.format(totalConfirmed);
  deaths.innerHTML = intl.format(totalDeaths);
  recovered.innerHTML = intl.format(totalRecovered);
  updateDate.innerHTML = getDateOnly(date);
}

async function getGlobalData() {
  const response = await axios.get("https://api.covid19api.com/summary");
  return response.data;
}

async function onLoadPage() {
  globalData = await getGlobalData();

  const {
    TotalConfirmed,
    TotalDeaths,
    TotalRecovered,
    Date: CovidDate,
    NewConfirmed,
    NewDeaths,
    NewRecovered,
  } = globalData.Global;

  setCovidNumbers(
    TotalConfirmed,
    TotalDeaths,
    TotalRecovered,
    new Date(CovidDate)
  );

  new Chart(pizzaChart, {
    type: "pie",
    data: {
      labels: ["New Confirmed", "New Deaths", "New Recovered"],
      datasets: [
        {
          label: "New Covid Numbers",
          data: [NewConfirmed, NewDeaths, NewRecovered],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  });

  const countries = _.orderBy(
    globalData.Countries,
    ["TotalDeaths"],
    ["desc"]
  ).slice(0, 10);

  new Chart(barChart, {
    type: "bar",
    data: {
      labels: countries.map((obj) => obj.Country),
      datasets: [
        {
          label: "Top 10 - Deaths per Country",
          data: countries.map((obj) => obj.TotalDeaths),
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(255, 205, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(201, 203, 207, 0.2)",
          ],
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(255, 159, 64)",
            "rgb(255, 205, 86)",
            "rgb(75, 192, 192)",
            "rgb(54, 162, 235)",
            "rgb(153, 102, 255)",
            "rgb(201, 203, 207)",
          ],
          borderWidth: 1,
        },
      ],
    },

    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
onLoadPage();
