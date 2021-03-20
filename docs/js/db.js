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
    this.meta = {};

    data.forEach(e => {
      // don't ask - related to lc_select, try selecting ACADEMIA NAVALĂ „MIRCEA CEL BĂTRÂN without this
      e['Nume centru'] = e['Nume centru'].replace('"', '');

      this.addToCollection('counties', e['Județ'])
      this.addToCollection('cities', e['Localitate'])
      this.addToCollection('centers', e['Nume centru'])
      this.addToCollection('dates', e['Data vaccinării'])
      this.addToCollection('vaccines', e['Produs'])
      this.addToCollection('categories', e['Grupa de risc'])
    })

    this.filters = {
      'counties': [],
      'cities': [],
      'centers': [],
      'categories': [],
      'doses': [],

      // default hidden state for each vaccin line + total line
      'hidden': Array.from(this.getVaccines()).map(e => false).concat(false)
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
