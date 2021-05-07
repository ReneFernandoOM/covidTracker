
const appLogic = (() => {
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
        console.log(joinedData)
        countriesAffectedDiv.innerText = joinedData['paisesAfectados'].toLocaleString('en-US');
        casesConfirmedDiv.innerText = joinedData['casosConf'].toLocaleString('en-US');
        deathsConfirmedDiv.innerText = joinedData['muertes'].toLocaleString('en-US');
        vaccAdminDiv.innerText = joinedData['vacAdministradas'].toLocaleString('en-US');
        vaccPers.innerText = joinedData['persVacunadas'].toLocaleString('en-US');
        vaccPersPart.innerText = joinedData['persPartVacc'].toLocaleString('en-US');


    }

    const _init = (() => {
        console.log(countriesAffectedDiv)
        worldCasesPromise = getWorldCasesData()
        worldVaccPromise = getWorldVaccData();
        Promise.all([worldCasesPromise, worldVaccPromise]).then(renderWorldData)
    })()
})()