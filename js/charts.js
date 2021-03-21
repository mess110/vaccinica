const chooseDose = (row, filters) => {
  if (filters.doses.length === 0 || filters.doses.length === 2) {
    return row['Doze administrate']
  } else {
    return row[filters.doses[0]]
  }
}

const datasetFrom = (dates, inputData, filters, label, hidden) => {
  array = [];
  dates.forEach(date => {
    let value = inputData
      .filter(e => e['Data vaccinării'] === date)
      .map(e => chooseDose(e, filters) )
      .sum()
    array.push(value)
  })

  if (filters.cumulative) {
    let tempArray = []
    let i = 0
    for (e of array) {
      let newValue = e;
      if (i !== 0) {
        newValue += tempArray[i - 1]
      }
      tempArray.push(newValue)
      i += 1
    }
    array = tempArray;
  }

  return {
    label: label,
    data: array,
    hidden: hidden,
    fill: false,
  }
}

const dozeAdministrate = (data, filters) => {
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

  let dataPB = data
    .filter(e => e['Produs'] == 'Pfizer - BIONTech')

  let dataM = data
    .filter(e => e['Produs'] == 'Moderna')

  let dataAZ = data
    .filter(e => e['Produs'] == 'Astra-Zeneca')

  let ctx = document.getElementById('myChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from(db.getDates()),
      datasets: [
        datasetFrom(db.getDates(), data, filters, 'Total', hidden[0]),
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
        },
        datalabels: {
          display: false
        }
      }
    }
  });
}

const proportii = (data, filters) => {
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

  let categories;
  let pieData = {}
  if (filters.cumulative) {
    categories = ['Categoria I', 'Categoria II', 'Categoria III']
  } else {
    categories = Array.from(db.getCategories()).sort()
  }
  for (let category of categories) {
    pieData[category] = 0
  }

  for (let row of data) {
    if (filters.cumulative) {
      if (row['Grupa de risc'].startsWith('Categoria I ')) {
        pieData['Categoria I'] += chooseDose(row, filters)
      }
      if (row['Grupa de risc'].startsWith('Categoria II-')) {
        pieData['Categoria II'] += chooseDose(row, filters)
      }
      if (row['Grupa de risc'].startsWith('Categoria III-')) {
        pieData['Categoria III'] += chooseDose(row, filters)
      }
    } else {
      pieData[row['Grupa de risc']] += chooseDose(row, filters)
    }
  }

  let ctx = document.getElementById('myChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(pieData),
      datasets: [
        { data: Object.values(pieData) },
      ]
    },
    options: {
      legend: {
        display: false
      },
      maintainAspectRatio: false,
      plugins: {
        colorschemes: {
          scheme: 'tableau.Tableau10'
        },
        datalabels: {
          formatter: (value, ctx) => {
            let sum = 0;
            let dataArr = ctx.chart.data.datasets[0].data.filter(e => e !== "undefined");
            dataArr.map(data => {
              sum += data;
            });
            let percentage = (value*100 / sum);
            if (percentage >= 2) {
              return percentage.toFixed(0)+"%";
            } else {
              return ''
            }
          },
          color: '#fff',
        }
      }
    }
  });
}
