class Db {
  constructor() {
    this.update([]);
  }

  update(data) {
    this.data = data;
    this.collections = {
      'counties': new Set(),
      'cities': new Set(),
      'centers': new Set(),
      'dates': new Set(),
      'vaccines': new Set(),
      'categories': new Set(),
      'doses': new Set(['Doza 1', 'Doza 2'])
    };
    this.citiesInCounties = {};
    this.centersInCounties = {};
    this.centersInCities = {};

    data.forEach(e => {
      // don't ask - related to lc_select, try selecting ACADEMIA NAVALĂ „MIRCEA CEL BĂTRÂN without this
      e['Nume centru'] = e['Nume centru'].replace('"', '');
      // Categoria a II a si Categoria a II-a
      e['Grupa de risc'] = e['Grupa de risc'].replace('Categoria a II a', 'Categoria a II-a');
      // Get rid of the 'a' between Categoria and roman numeral
      e['Grupa de risc'] = e['Grupa de risc'].replace('Categoria a I', 'Categoria I');

      this.addToCollection('counties', e['Județ'])
      this.addToCollection('cities', e['Localitate'])
      this.addToCollection('centers', e['Nume centru'])
      this.addToCollection('dates', e['Data vaccinării'])
      this.addToCollection('vaccines', e['Produs'])
      this.addToCollection('categories', e['Grupa de risc'])

      this.metaHierarchy(e)
    })

    this.filters = {
      'counties': [],
      'cities': [],
      'centers': [],
      'categories': [],
      'doses': [],

      // default hidden state for each vaccin line + total line
      'hidden': Array.from(this.getVaccines()).map(e => false).concat(false),
      'cumulative': false
    }
  }

  metaHierarchy(e) {
    const county = e['Județ'];
    if (county === '') {
      return
    }
    const city = e['Localitate'];
    if (this.citiesInCounties[county] instanceof Set) {
      this.citiesInCounties[county].add(e['Localitate'])
    } else {
      this.citiesInCounties[county] = new Set([e['Localitate']])
    }
    if (this.centersInCounties[county] instanceof Set) {
      this.centersInCounties[county].add(e['Nume centru'])
    } else {
      this.centersInCounties[county] = new Set([e['Nume centru']])
    }
    if (this.centersInCities[city] instanceof Set) {
      this.centersInCities[city].add(e['Nume centru'])
    } else {
      this.centersInCities[city] = new Set([e['Nume centru']])
    }
  }

  getCollection(key) {
    return this.collections[key];
  }

  getData() {
    return this.data;
  }

  getCounties() {
    return this.collections.counties;
  }

  getCities() {
    return this.collections.cities;
  }

  getCenters() {
    return this.collections.centers;
  }

  getDates() {
    return this.collections.dates;
  }

  getCategories() {
    return this.collections.categories;
  }

  getDoses() {
    return this.collections.doses;
  }

  getVaccines() {
    return this.collections.vaccines;
  }

  getFilters() {
    return this.filters;
  }

  getSelectableCities() {
    if (db.filters.counties.length === 0) {
      return Array.from(this.getCities())
    }
    let cities = []
    for (let county of db.filters.counties) {
      for (let city of Array.from(this.citiesInCounties[county])) {
        cities.push(city)
      }
    }
    return cities;
  }

  getSelectableCenters() {
    if (db.filters.counties.length === 0 && db.filters.cities.length === 0) {
      return Array.from(this.getCenters())
    }
    let centers = []
    if (db.filters.cities.length === 0) {
      for (let county of db.filters.counties) {
        for (let center of Array.from(this.centersInCounties[county])) {
          centers.push(center)
        }
      }
    } else {
      for (let city of db.filters.cities) {
        for (let center of Array.from(this.centersInCities[city])) {
          centers.push(center)
        }
      }
    }
    return centers;
  }

  addToCollection(which, item) {
    if (Object.keys(this.collections).indexOf(which) === -1) {
      console.warn(`invalid collection key '${which}'`)
    }
    if (item !== '') {
      this.collections[which].add(item);
    }
    return item;
  }
}
