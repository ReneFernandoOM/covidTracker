
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
    }

    const _init = (() => {
        // worldCasesPromise = getWorldCasesData();
        // worldVaccPromise = getWorldVaccData();
        // Promise.all([worldCasesPromise, worldVaccPromise]).then(renderWorldData);
    })()
})()

const countryData = (() => {
    const countriesSelection = document.querySelector('#countryOptions');
    const updateBtnData = document.querySelector('#updateCountryData');

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

    const getCoundryHistDeathsData = async () => {
        const resp = await fetch(`https://covid-api.mmediagroup.fr/v1/history?country=${countriesSelection.value}&status=deaths`, {
            mode: 'cors'
        })
        const jsonData = await resp.json()

        return jsonData
    }

    const renderCountryConf = (jsonData) => {
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
            document.getElementById('countryHistConf'),
            newConfig
        );
    }

    const renderCountryDeaths = (jsonData) => {
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
            document.getElementById('countryHistDeaths'),
            newConfig
        );
    }

    const addListeners = () => {
        updateBtnData.addEventListener('click', () => {
            getCountryHistData()
                .then(data => renderCountryConf(data))
            getCoundryHistDeathsData()
                .then(data => renderCountryDeaths(data))
        })
    }

    const _init = (() => {
        loadCountries();
        addListeners();
    })()
})()

