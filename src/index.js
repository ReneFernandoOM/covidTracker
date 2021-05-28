
const appLogic = (() => {
    const worldSpinners = [...document.querySelectorAll('.world-spinner')];
    const countriesAffectedDiv = document.querySelector('#affectedCountries');
    const casesConfirmedDiv = document.querySelector('#casesConfirmed');
    const deathsConfirmedDiv = document.querySelector('#deathsConfirmed');
    const vaccAdminDiv = document.querySelector('#vaccAdmin');
    const vaccPers = document.querySelector('#vaccPers');
    const vaccPersPart = document.querySelector('#vaccPersPart');


    const getWorldCasesData = async () => {
        let response = await fetch('https://covid-api.mmediagroup.fr/v1/cases')
        let data = await response.json()

        let confirmedCases = 0;
        let deaths = 0;
        let countriesAffected = Object.keys(data).length

        Object.entries(data).forEach(([country, countryInfo]) => {
            confirmedCases += countryInfo['All']['confirmed']
            deaths += countryInfo['All']['deaths']
        })

        return { 'casosConf': confirmedCases, 'muertes': deaths, 'paisesAfectados': countriesAffected }
    }

    const getWorldVaccData = async () => {
        let response = await fetch('https://covid-api.mmediagroup.fr/v1/vaccines')
        let data = await response.json();

        let vaccAdministered = 0;
        let peopleVacc = 0;
        let peoplePartVacc = 0;

        Object.entries(data).forEach(([country, countryInfo]) => {
            vaccAdministered += countryInfo['All']['administered']
            peopleVacc += countryInfo['All']['people_vaccinated']
            peoplePartVacc += countryInfo['All']['people_partially_vaccinated']
        })

        return { 'vacAdministradas': vaccAdministered, 'persVacunadas': peopleVacc, 'persPartVacc': peoplePartVacc }
    }

    const renderWorldData = (data) => {
        let joinedData = Object.assign({}, ...data)

        worldSpinners.forEach(spinner => {
            spinner.style.display = 'none';
        })

        countriesAffectedDiv.innerText = joinedData['paisesAfectados'].toLocaleString('en-US');
        casesConfirmedDiv.innerText = joinedData['casosConf'].toLocaleString('en-US');
        deathsConfirmedDiv.innerText = joinedData['muertes'].toLocaleString('en-US');
        vaccAdminDiv.innerText = joinedData['vacAdministradas'].toLocaleString('en-US');
        vaccPers.innerText = joinedData['persVacunadas'].toLocaleString('en-US');
        vaccPersPart.innerText = joinedData['persPartVacc'].toLocaleString('en-US');

        countryData.mainRender();
    }

    const _init = (() => {
        Promise.all([getWorldCasesData(), getWorldVaccData()]).then(renderWorldData);
    })()
})()

const countryData = (() => {
    const countrySpinners = [...document.querySelectorAll('.country-spinner')];
    const countriesSelection = document.querySelector('#countryOptions');
    const updateBtnData = document.querySelector('#updateCountryData');
    const countryLabel = document.querySelector('#countryLabel');
    const colDeath = document.querySelector('#deathCol');
    const confCol = document.querySelector('#confCol');

    const casesConfirmedDiv = document.querySelector('#casesConfirmedCountry');
    const deathsConfirmedDiv = document.querySelector('#deathsConfirmedCountry');
    const vaccAdminDiv = document.querySelector('#vaccAdminCountry');
    const persVaccDiv = document.querySelector('#vaccPersCountry');
    const persParcVaccDiv = document.querySelector('#vaccPersPartCountry');
    const infoCountryDivs = [casesConfirmedDiv, deathsConfirmedDiv, vaccAdminDiv, persVaccDiv, persParcVaccDiv];

    const getCountryData = async () => {
        let response = await fetch(`https://covid-api.mmediagroup.fr/v1/cases?country=${countriesSelection.value}`)
        let data = await response.json()
        let mexicoData = data['All'];

        return { 'casosConf': mexicoData['confirmed'], 'muertes': mexicoData['deaths'] }
    }

    const getCountryVaccData = async () => {
        let response = await fetch(`https://covid-api.mmediagroup.fr/v1/vaccines?country=${countriesSelection.value}`)
        let data = await response.json();
        let vaccData = data['All'] ? data['All'] : {}

        return {
            'vacAdministradas': vaccData['administered'] ? vaccData['administered'] : 0,
            'persVacunadas': vaccData['people_vaccinated'] ? vaccData['people_vaccinated'] : 0,
            'persPartVacc': vaccData['people_partially_vaccinated'] ? vaccData['people_partially_vaccinated'] : 0
        }
    }

    const loadCountries = async () => {
        const resp = await fetch('static/countries.json')
        const countries = await resp.json()
        countries.forEach(country => {
            let option = document.createElement('option');
            option.value = country;
            option.text = country;
            countriesSelection.appendChild(option);
        })
        $(countriesSelection).selectpicker('refresh');
        $(countriesSelection).selectpicker('val', 'Mexico');
    }

    const getCountryHistData = async () => {
        const resp = await fetch(`https://covid-api.mmediagroup.fr/v1/history?country=${countriesSelection.value}&status=confirmed`, {
            mode: 'cors'
        })
        const jsonData = await resp.json()
        return jsonData
    }

    const renderCountryData = (data) => {
        let joinedData = Object.assign({}, ...data)


        countrySpinners.forEach(spinner => {
            spinner.style.display = 'none';
        })

        casesConfirmedDiv.innerText = joinedData['casosConf'].toLocaleString('en-US');
        deathsConfirmedDiv.innerText = joinedData['muertes'].toLocaleString('en-US');
        vaccAdminDiv.innerText = joinedData['vacAdministradas'].toLocaleString('en-US');
        persVaccDiv.innerText = joinedData['persVacunadas'].toLocaleString('en-US');
        persParcVaccDiv.innerText = joinedData['persPartVacc'].toLocaleString('en-US');
    }

    const getCountryHistDeathsData = async () => {
        const resp = await fetch(`https://covid-api.mmediagroup.fr/v1/history?country=${countriesSelection.value}&status=deaths`, {
            mode: 'cors'
        })
        const jsonData = await resp.json()

        return jsonData
    }

    const renderCountryConf = (jsonData) => {
        let graphDiv = document.createElement('canvas');
        graphDiv.classList.add('chartCountry');
        confCol.appendChild(graphDiv);
        const graphData = {
            datasets: [{
                label: 'Casos confirmados: ',
                backgroundColor: 'rgb(212, 126, 15)',
                borderColor: 'rgb(212, 126, 15)',
                data: jsonData.All.dates,
            }]
        }
        const newConfig = {
            type: 'line',
            data: graphData,
            options: {
                scales: {
                    xAxes: { reverse: true }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Casos confirmados' }
                }
            }
        };
        let myChart = new Chart(
            graphDiv,
            newConfig
        );
    }

    const renderCountryDeaths = (jsonData) => {
        let graphDiv = document.createElement('canvas');
        graphDiv.classList.add('chartCountry');
        colDeath.appendChild(graphDiv);
        const graphData = {
            datasets: [{
                label: 'Defunciones: ',
                backgroundColor: 'rgb(186, 43, 43)',
                borderColor: 'rgb(186, 43, 43)',
                data: jsonData.All.dates,
            }]
        }
        const newConfig = {
            type: 'line',
            data: graphData,
            options: {
                scales: {
                    xAxes: { reverse: true }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Defunciones' }
                }
            }
        };
        let myChart = new Chart(
            graphDiv,
            newConfig
        );
    }

    const mainRender = () => {
        const countryCharts = document.querySelectorAll('.chartCountry');
        countryLabel.innerText = countriesSelection.value;
        infoCountryDivs.forEach(div => {
            div.innerText = '';
        })
        countrySpinners.forEach(spinner => {
            spinner.style.display = 'inline-block';
        })
        countryCharts.forEach(chart => {
            chart.parentElement.removeChild(chart);
        })

        getCountryHistData()
            .then(data => renderCountryConf(data))
        getCountryHistDeathsData()
            .then(data => renderCountryDeaths(data))
        Promise.all([getCountryData(), getCountryVaccData()]).then(renderCountryData);
    }

    const addListeners = () => {
        updateBtnData.addEventListener('click', () => {
            mainRender();
        })
    }

    const _init = (() => {
        loadCountries();
        addListeners();
    })()

    return { mainRender }
})()

