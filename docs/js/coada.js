Set.prototype.addSafe = function (e) {
  if (e !== '') {
    this.add(e)
  }
}

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
const initMultiSelect = (name, items, filters, dates, rawData) => {
  let select = document.querySelector(`select[name="${name}"]`);
  Array.from(items).sort().forEach(e => {
    let option = document.createElement('option');
    option.setAttribute('value', e);
    option.text = e;
    select.appendChild(option)
  })

  new lc_select(`select[name="${name}"]`, {
    wrap_width : '100%',
    min_for_search: 2,
    autofocus_search: true,
    addit_classes : ['multiselect'],
    on_change : (new_value, target_field) => {
      filters[name] = new_value;
      updateChart(dates, rawData, filters)
    },
    labels : [
        'căutare',
        'add options',
        'Select options ..',
        '.. nema ..',
    ],
  });
}

const datasetFrom = (dates, inputData, filters, label) => {
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
  }
}

const updateChart = (dates, rawData, filters) => {
  if (chart !== undefined) {
    console.log('destroy chart')
    chart.destroy();
  }

  let dataCity = rawData

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
        labels: Array.from(dates),
        datasets: [
          datasetFrom(dates, dataCity, filters, 'Total'),
          datasetFrom(dates, dataPB, filters, 'Pfizer - BIONTech'),
          datasetFrom(dates, dataM, filters, 'Moderna'),
          datasetFrom(dates, dataAZ, filters, 'Astra-Zeneca'),
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

  let counties = new Set();
  let cities = new Set();
  let centers = new Set();
  let dates = new Set();
  let vaccines = new Set();
  let categories = new Set();
  let doses = new Set(['Doza 1', 'Doza 2']);

  rawData.forEach(e => {
    // don't ask - related to lc_select, try selecting ACADEMIA NAVALĂ „MIRCEA CEL BĂTRÂN without this
    e['Nume centru'] = e['Nume centru'].replace('"', '');

    counties.addSafe(e['Județ']);
    cities.addSafe(e['Localitate']);
    centers.addSafe(e['Nume centru']);
    dates.addSafe(e['Data vaccinării']);
    vaccines.addSafe(e['Produs']);
    categories.addSafe(e['Grupa de risc']);
  })

  let filters = {
    'counties': [],
    'cities': [],
    'centers': [],
    'categories': [],
    'doses': [],
  }

  initMultiSelect('counties', counties, filters, dates, rawData)
  initMultiSelect('cities', cities, filters, dates, rawData)
  initMultiSelect('centers', centers, filters, dates, rawData)
  initMultiSelect('categories', categories, filters, dates, rawData)
  initMultiSelect('doses', doses, filters, dates, rawData)

  updateChart(dates, rawData, filters)

  document.querySelector('#content').style.display = 'block';
  document.querySelector('#loader').remove();
}

let chart = undefined; // should you be writing this?
document.addEventListener("DOMContentLoaded", init)
