Array.prototype.sum = function () {
  return this.reduce((a, b) => {
    return a + b;
  }, 0)
}

Array.prototype.includes = function (e) {
  return this.indexOf(e) !== -1
}

const pushUrlState = (name, value) => {
  var url = new URL(document.location)
  url.searchParams.delete(name)
  if (value) {
    if (Array.isArray(value)) {
      for (val of value) url.searchParams.append(name, val)
    }
    else {
      url.searchParams.set(name, value)
    }
  }
  window.history.pushState({}, '', url)
}

const locationHasAttribute = (name, value) => {
  return new URL(document.location).searchParams.getAll(name).includes(value)
}


const initMultiSelect = (name, db) => {
  let select = document.querySelector(`select[name="${name}"]`);

  let options = Array.from(db.getCollection(name)).sort()
  if (name == "categories") {
    options.unshift(...["Categoria I", "Categoria II", "Categoria II-a", "Categoria II-b", "Categoria III", "Categoria III-a", "Categoria III-b", "Categoria III-c"])
  }

  options.forEach(e => {
    let option = document.createElement('option');
    option.setAttribute('value', e);

    if (locationHasAttribute(name, e)) {
      db.getFilters()[name].push(e);
      option.setAttribute('selected', 1)
    }

    option.text = e;
    select.appendChild(option)
  })

  new lc_select(`select[name="${name}"]`, {
    enable_search: name !== "doses",
    wrap_width: '100%',
    // min_for_search: 2,
    // max_opts: 1,
    autofocus_search: true,
    addit_classes: ['multiselect'],
    on_change: (new_value, target_field) => {
      pushUrlState(name, new_value)
      db.getFilters()[name] = new_value;
      updateChart(db);
    },
    labels: [
      'căutare',
      'adaugă',
      'alege',
      '.. nema ..',
    ],
  });
}

const updateChart = (db) => {
  let filters = db.getFilters();
  let data = db.getData();
  updateUIFilter(db);

  if (filters.cities.length === 0 && filters.centers.length === 0) {
    if (filters.counties.length > 0) {
      data = data.filter(e => filters.counties.includes(e['Județ']))
    }
  }
  if (filters.centers.length === 0) {
    if (filters.cities.length > 0) {
      data = data.filter(e => filters.cities.includes(e['Localitate']))
    }
  }
  if (filters.centers.length > 0) {
    data = data.filter(e => filters.centers.includes(e['Nume centru']))
  }
  if (filters.categories.length > 0) {
    // console.log(Array.from(db.collections.categories).sort())
    if (filters.categories.includes('Categoria I')) {
      let items = Array.from(db.collections.categories).filter(e => e.startsWith('Categoria I '))
      items.forEach(e => filters.categories.push(e))
    }
    if (filters.categories.includes('Categoria II')) {
      let items = Array.from(db.collections.categories).filter(e => e.startsWith('Categoria II-'))
      items.forEach(e => filters.categories.push(e))
    }
    if (filters.categories.includes('Categoria III')) {
      let items = Array.from(db.collections.categories).filter(e => e.startsWith('Categoria III-'))
      items.forEach(e => filters.categories.push(e))
    }
    ['Categoria II-a', 'Categoria II-b', 'Categoria III-a', 'Categoria III-b', 'Categoria III-c'].forEach(cat => {
      if (filters.categories.includes(cat)) {
        let items = Array.from(db.collections.categories).filter(e => e.startsWith(cat))
        items.forEach(e => filters.categories.push(e))
      }
    })
    // console.log(filters.categories)
    data = data.filter(e => filters.categories.includes(e['Grupa de risc']))
  }

  if (filters.pieChart) {
    proportii(data, filters)
  } else {
    dozeAdministrate(data, filters)
  }
}

const updateUIFilter = (db) => {
  let cities = document.querySelector(`select[name="cities"]`);
  let centers = document.querySelector(`select[name="centers"]`);

  selectableCities = db.getSelectableCities()
  for (let c of cities.children) {
    if (selectableCities.indexOf(c.value) !== -1) {
      c.removeAttribute('disabled')
    } else {
      c.setAttribute('disabled', true)
    }
  }

  selectableCenters = db.getSelectableCenters()
  for (let c of centers.children) {
    if (selectableCenters.indexOf(c.value) !== -1) {
      c.removeAttribute('disabled')
    } else {
      c.setAttribute('disabled', true)
    }
  }
}

const initCumulative = () => {
  db.filters.cumulative = locationHasAttribute("cumulative", "yes")
  document.querySelector(`input[name="cumulative"]`).checked = db.filters.cumulative
}

const initPie = () => {
  db.filters.pieChart = locationHasAttribute("pie", "yes")
  document.querySelector(`input[name="pie"]`).checked = db.filters.pieChart
}

const toggleCumulative = (event) => {
  pushUrlState("cumulative", event.checked ? "yes" : "")
  db.filters.cumulative = event.checked;
  updateChart(db)
}

const togglePie = (event) => {
  pushUrlState("pie", event.checked ? "yes" : "")
  db.filters.pieChart = !db.filters.pieChart;
  updateChart(db)
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

  initCumulative()
  initPie()

  updateChart(db)

  document.querySelector('#content').style.display = 'block';
  document.querySelector('#loader').remove();

  let lastDataUpdateOn = new Date(Array.from(db.getDates()).sort().slice(-1)[0]);
  lastDataUpdateOn.setDate(lastDataUpdateOn.getDate() + 1);
  lastDataUpdateOn = lastDataUpdateOn.toISOString().split('T')[0];
  document.querySelector('#lastDataUpdateOn').innerHTML = ` - ${lastDataUpdateOn}`;
}

let db = new Db();
let chart = undefined; // should you be writing this?
document.addEventListener("DOMContentLoaded", init)
