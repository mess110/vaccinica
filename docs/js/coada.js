Array.prototype.sum = function () {
  return this.reduce((a, b) => {
    return a + b;
  }, 0)
}

Array.prototype.includes = function(e) {
  return this.indexOf(e) !== -1
}

// TODO: remove dates and rawData parms from here, its just a mess
// maybe create a storage object somewhere
const initMultiSelect = (name, db) => {
  let select = document.querySelector(`select[name="${name}"]`);
  Array.from(db.getCollection(name)).sort().forEach(e => {
    let option = document.createElement('option');
    option.setAttribute('value', e);
    option.text = e;
    select.appendChild(option)
  })

  new lc_select(`select[name="${name}"]`, {
    enable_search : name !== "doses",
    wrap_width : '100%',
    min_for_search: 2,
    autofocus_search: true,
    addit_classes : ['multiselect'],
    on_change : (new_value, target_field) => {
      db.getFilters()[name] = new_value;
      updateChart(db);
    },
    labels : [
        'căutare',
        'adaugă',
        'alege',
        '.. nema ..',
    ],
  });
}

const datasetFrom = (dates, inputData, filters, label, hidden) => {
  array = [];
  dates.forEach(date => {
    let value = inputData
      .filter(e => e['Data vaccinării'] === date)
      .map(e => {
        if (filters.doses.length === 0 || filters.doses.length === 2) {
          return e['Doze administrate']
        } else {
          return e[filters.doses[0]]
        }
      })
      .sum()
    array.push(value)
  })

  return {
    label: label,
    data: array,
    hidden: hidden,
    fill: false,
  }
}

const updateChart = (db) => {
  let filters = db.getFilters();
  let hidden = filters.hidden;
  if (chart !== undefined) {
    // the hidden state can be either directly on the dataset or in its
    // _meta attribute so we check for both
    hidden = chart.data.datasets.map(e => {
      let firstVal = e._meta[Object.keys(e._meta)[0]].hidden;
      return firstVal === null ? e.hidden : firstVal;
    })
    chart.destroy();
  }

  let dataCity = db.getData();

  if (filters.counties.length > 0) {
    dataCity = dataCity.filter(e => filters.counties.includes(e['Județ']))
  }
  if (filters.cities.length > 0) {
    dataCity = dataCity.filter(e => filters.cities.includes(e['Localitate']))
  }
  if (filters.centers.length > 0) {
    dataCity = dataCity.filter(e => filters.centers.includes(e['Nume centru']))
  }
  if (filters.categories.length > 0) {
    dataCity = dataCity.filter(e => filters.categories.includes(e['Grupa de risc']))
  }

  let dataPB = dataCity
    .filter(e => e['Produs'] == 'Pfizer - BIONTech')

  let dataM = dataCity
    .filter(e => e['Produs'] == 'Moderna')

  let dataAZ = dataCity
    .filter(e => e['Produs'] == 'Astra-Zeneca')

  let ctx = document.getElementById('myChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array.from(db.getDates()),
        datasets: [
          datasetFrom(db.getDates(), dataCity, filters, 'Total', hidden[0]),
          datasetFrom(db.getDates(), dataPB, filters, 'Pfizer - BIONTech', hidden[1]),
          datasetFrom(db.getDates(), dataM, filters, 'Moderna', hidden[2]),
          datasetFrom(db.getDates(), dataAZ, filters, 'Astra-Zeneca', hidden[3]),
        ]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        colorschemes: {
          scheme: 'tableau.Tableau10'
        }
      }
    }
  });
}

const init = async () => {
  const response = await fetch('data/latest.json');
  const responseJson = await response.json();
  let rawData = responseJson['ag-grid'];

  db.update(rawData);

  initMultiSelect('counties', db)
  initMultiSelect('cities', db)
  initMultiSelect('centers', db)
  initMultiSelect('categories', db)
  initMultiSelect('doses', db)

  updateChart(db)

  document.querySelector('#content').style.display = 'block';
  document.querySelector('#loader').remove();
}

let db = new Db();
let chart = undefined; // should you be writing this?
document.addEventListener("DOMContentLoaded", init)
