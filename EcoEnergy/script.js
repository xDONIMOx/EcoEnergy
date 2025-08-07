document.addEventListener('DOMContentLoaded', () => {

    // Lógica para el menú de navegación responsivo
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Lógica para el acordeón en hidroelectrica.html
    const accordionButtons = document.querySelectorAll('.accordion-button');
    if (accordionButtons.length > 0) {
        accordionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const content = button.nextElementSibling;
                button.classList.toggle('active');
                if (button.classList.contains('active')) {
                    content.style.display = 'block';
                } else {
                    content.style.display = 'none';
                }
            });
        });
    }

    // Lógica del slider en index.html
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        }
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }
        setInterval(nextSlide, 5000); // Cambia de slide cada 5 segundos
    }

    // Lógica del formulario de carga en datos.html
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('¡Archivo subido correctamente!');
            uploadForm.reset();
        });
    }

    // Lógica de la calculadora en calculadora.html
    const calculatorForm = document.getElementById('calculator-form');
    const countrySelectCalc = document.getElementById('country-select');
    const yearSelectCalc = document.getElementById('year-select');
    const resultsDiv = document.getElementById('results');
    const energyMixDiv = document.getElementById('energy-mix-results');
    const personalProjectionDiv = document.getElementById('personal-projection-results');

    let calculatorData = {
        renewableShare: [],
        windCapacity: [],
        modernRenewables: []
    };

    if (calculatorForm) {
        async function fetchCalculatorData() {
            try {
                const [renewableShareRes, windCapacityRes, modernRenewablesRes] = await Promise.all([
                    fetch('01 renewable-share-energy.csv'),
                    fetch('09 cumulative-installed-wind-energy-capacity-gigawatts.csv'),
                    fetch('02 modern-renewable-energy-consumption.csv')
                ]);
                const [renewableShareText, windCapacityText, modernRenewablesText] = await Promise.all([
                    renewableShareRes.text(),
                    windCapacityRes.text(),
                    modernRenewablesRes.text()
                ]);

                calculatorData.renewableShare = parseCSV(renewableShareText);
                calculatorData.windCapacity = parseCSV(windCapacityText);
                calculatorData.modernRenewables = parseCSV(modernRenewablesText);

                populateCountryAndYearSelects();
            } catch (error) {
                console.error("Error al cargar los datos de la calculadora:", error);
            }
        }

        function parseCSV(text) {
            const lines = text.trim().split('\n');
            const headers = lines[0].split(',').map(header => header.trim());
            return lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, index) => {
                    obj[header] = values[index];
                    return obj;
                }, {});
            });
        }

        function populateCountryAndYearSelects() {
            const countries = [...new Set(calculatorData.renewableShare.map(d => d.Entity))].sort();
            const years = [...new Set(calculatorData.renewableShare.map(d => d.Year))].sort();

            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countrySelectCalc.appendChild(option);
            });

            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelectCalc.appendChild(option);
            });
        }

        calculatorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const selectedCountry = countrySelectCalc.value;
            const selectedYear = yearSelectCalc.value;
            const userConsumption = parseFloat(document.getElementById('user-consumption').value);

            if (!selectedCountry || !selectedYear || isNaN(userConsumption)) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            const renewableShareRow = calculatorData.renewableShare.find(d => d.Entity === selectedCountry && d.Year === selectedYear);
            const modernRenewablesRow = calculatorData.modernRenewables.find(d => d.Entity === selectedCountry && d.Year === selectedYear);
            const windCapacityRow = calculatorData.windCapacity.find(d => d.Entity === selectedCountry && d.Year === selectedYear);

            if (!renewableShareRow || !modernRenewablesRow) {
                alert('Datos no disponibles para la selección. Intenta con otro año o país.');
                resultsDiv.classList.add('d-none');
                return;
            }

            const renewableSharePercentage = parseFloat(renewableShareRow['Renewables (% equivalent primary energy)']);
            const nonRenewableShare = 100 - renewableSharePercentage;

            const totalModernRenewableTWh = parseFloat(modernRenewablesRow['Geo Biomass Other - TWh']) +
                parseFloat(modernRenewablesRow['Solar Generation - TWh']) +
                parseFloat(modernRenewablesRow['Wind Generation - TWh']) +
                parseFloat(modernRenewablesRow['Hydro Generation - TWh']);

            const windShare = (parseFloat(modernRenewablesRow['Wind Generation - TWh']) / totalModernRenewableTWh) * 100;
            const hydroShare = (parseFloat(modernRenewablesRow['Hydro Generation - TWh']) / totalModernRenewableTWh) * 100;
            const solarShare = (parseFloat(modernRenewablesRow['Solar Generation - TWh']) / totalModernRenewableTWh) * 100;
            const otherShare = (parseFloat(modernRenewablesRow['Geo Biomass Other - TWh']) / totalModernRenewableTWh) * 100;

            const renewableConsumptionKWh = (userConsumption * renewableSharePercentage) / 100;
            const nonRenewableConsumptionKWh = userConsumption - renewableConsumptionKWh;

            energyMixDiv.innerHTML = `
                <p><strong>Mix Energético en ${selectedCountry} (${selectedYear}):</strong></p>
                <ul>
                    <li><strong>Energía Renovable:</strong> ${renewableSharePercentage.toFixed(2)}% del total.</li>
                    <li><strong>Energía No Renovable:</strong> ${nonRenewableShare.toFixed(2)}% del total.</li>
                </ul>
                <p><strong>Contribución de cada fuente renovable:</strong></p>
                <ul>
                    <li>Eólica: ${windShare.toFixed(2)}%</li>
                    <li>Hidroeléctrica: ${hydroShare.toFixed(2)}%</li>
                    <li>Solar: ${solarShare.toFixed(2)}%</li>
                    <li>Otras (bioenergía, etc.): ${otherShare.toFixed(2)}%</li>
                </ul>
                ${windCapacityRow ? `<p><strong>Capacidad de Energía Eólica Instalada:</strong> ${parseFloat(windCapacityRow['Wind Capacity']).toFixed(2)} GW</p>` : ''}
            `;

            personalProjectionDiv.innerHTML = `
                <p><strong>Proyección de tu consumo anual (${userConsumption.toFixed(2)} kWh):</strong></p>
                <ul>
                    <li><strong>Consumo estimado de energía renovable:</strong> ${renewableConsumptionKWh.toFixed(2)} kWh</li>
                    <li><strong>Consumo estimado de energía no renovable:</strong> ${nonRenewableConsumptionKWh.toFixed(2)} kWh</li>
                </ul>
                <p>Con base en el mix energético de ${selectedCountry} en ${selectedYear}, aproximadamente el <strong>${renewableSharePercentage.toFixed(2)}%</strong> de tu consumo anual sería de fuentes renovables.</p>
            `;
            
            resultsDiv.classList.remove('d-none');
        });

        fetchCalculatorData();
    }


    // Lógica del Dashboard en dashboard.html
    const countrySelectDashboard = document.getElementById('country-select-dashboard');
    const yearRangeSelect = document.getElementById('year-range-select');
    let charts = {};
    let allData = {};

    if (countrySelectDashboard && yearRangeSelect) {
        async function fetchDashboardData() {
            try {
                const [consumptionRes, hydroShareRes, windProdRes, solarProdRes, shareElectricityRes] = await Promise.all([
                    fetch('02 modern-renewable-energy-consumption.csv'),
                    fetch('06 hydro-share-energy.csv'),
                    fetch('08 wind-generation.csv'),
                    fetch('03 modern-renewable-prod.csv'),
                    fetch('04 share-electricity-renewables.csv')
                ]);
                const [consumptionText, hydroShareText, windProdText, solarProdText, shareElectricityText] = await Promise.all([
                    consumptionRes.text(),
                    hydroShareRes.text(),
                    windProdRes.text(),
                    solarProdRes.text(),
                    shareElectricityRes.text()
                ]);

                allData.consumption = parseCSV(consumptionText);
                allData.hydroShare = parseCSV(hydroShareText);
                allData.windProd = parseCSV(windProdText);
                allData.solarProd = parseCSV(solarProdText);
                allData.shareElectricity = parseCSV(shareElectricityText);
                
                populateDashboardSelects();
            } catch (error) {
                console.error("Error al cargar los datos del dashboard:", error);
            }
        }

        function parseCSV(text) {
            const lines = text.trim().split('\n');
            const headers = lines[0].split(',').map(header => header.trim());
            return lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, index) => {
                    obj[header] = values[index];
                    return obj;
                }, {});
            });
        }

        function populateDashboardSelects() {
            const countries = [...new Set(allData.consumption.map(d => d.Entity))].sort();
            const years = [...new Set(allData.consumption.map(d => d.Year))].sort();
            
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countrySelectDashboard.appendChild(option);
            });
            
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearRangeSelect.appendChild(option);
            });
            
            // Establecer valores iniciales
            countrySelectDashboard.value = 'World';
            yearRangeSelect.value = '2021';
            
            renderCharts('World', '2021');
        }

        function renderCharts(country, year) {
            if (charts.barChart) charts.barChart.destroy();
            if (charts.pieChart) charts.pieChart.destroy();
            if (charts.areaChart) charts.areaChart.destroy();
            if (charts.stackedBarChart) charts.stackedBarChart.destroy();
            
            renderBarChart(country, year);
            renderPieChart(country, year);
            renderAreaChart(country);
            renderStackedBarChart(country);
            updateMetrics(country, year);
        }

        function updateMetrics(country, year) {
            const dataRow = allData.consumption.find(d => d.Entity === country && d.Year === year);
            if (dataRow) {
                const hydroProd = parseFloat(dataRow['Hydro Generation - TWh']) || 0;
                const windProd = parseFloat(dataRow['Wind Generation - TWh']) || 0;
                const solarProd = parseFloat(dataRow['Solar Generation - TWh']) || 0;
                const otherProd = parseFloat(dataRow['Geo Biomass Other - TWh']) || 0;
                const totalRenewable = hydroProd + windProd + solarProd + otherProd;
                
                document.getElementById('hydro-prod').textContent = hydroProd.toFixed(2);
                document.getElementById('wind-prod').textContent = windProd.toFixed(2);
                document.getElementById('solar-prod').textContent = solarProd.toFixed(2);
                document.getElementById('total-renewable').textContent = totalRenewable.toFixed(2);
            } else {
                document.getElementById('hydro-prod').textContent = 'N/A';
                document.getElementById('wind-prod').textContent = 'N/A';
                document.getElementById('solar-prod').textContent = 'N/A';
                document.getElementById('total-renewable').textContent = 'N/A';
            }
        }

        function renderBarChart(country, year) {
            const dataRow = allData.consumption.find(d => d.Entity === country && d.Year === year);
            if (!dataRow) return;

            const labels = ['Hidro', 'Eólica', 'Solar', 'Bioenergía'];
            const data = [
                parseFloat(dataRow['Hydro Generation - TWh']) || 0,
                parseFloat(dataRow['Wind Generation - TWh']) || 0,
                parseFloat(dataRow['Solar Generation - TWh']) || 0,
                parseFloat(dataRow['Geo Biomass Other - TWh']) || 0
            ];

            const ctx = document.getElementById('barChart').getContext('2d');
            charts.barChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Generación Renovable en ${country} (${year})`,
                        data: data,
                        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#6c757d'],
                        borderColor: ['#007bff', '#28a745', '#ffc107', '#6c757d'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'TWh' }
                        }
                    }
                }
            });
        }

        function renderPieChart(country, year) {
            const dataRow = allData.shareElectricity.find(d => d.Entity === country && d.Year === year);
            if (!dataRow) return;

            const renewableShare = parseFloat(dataRow['Renewables (% electricity)']) || 0;
            const nonRenewableShare = 100 - renewableShare;

            const ctx = document.getElementById('pieChart').getContext('2d');
            charts.pieChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Renovable', 'No Renovable'],
                    datasets: [{
                        label: `Mix Eléctrico en ${country} (${year})`,
                        data: [renewableShare, nonRenewableShare],
                        backgroundColor: ['#28a745', '#dc3545'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    return `${label}: ${value.toFixed(2)}%`;
                                }
                            }
                        }
                    }
                }
            });
        }

        function renderAreaChart(country) {
            const countryData = allData.consumption.filter(d => d.Entity === country).sort((a,b) => a.Year - b.Year);
            const years = countryData.map(d => d.Year);
            const renewableConsumption = countryData.map(d => 
                (parseFloat(d['Geo Biomass Other - TWh']) || 0) +
                (parseFloat(d['Solar Generation - TWh']) || 0) +
                (parseFloat(d['Wind Generation - TWh']) || 0) +
                (parseFloat(d['Hydro Generation - TWh']) || 0)
            );

            const ctx = document.getElementById('areaChart').getContext('2d');
            charts.areaChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: [{
                        label: `Consumo de Energía Renovable Moderna en ${country} (TWh)`,
                        data: renewableConsumption,
                        backgroundColor: 'rgba(75, 192, 192, 0.4)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'TWh' }
                        }
                    }
                }
            });
        }

        function renderStackedBarChart(country) {
            const countryData = allData.consumption.filter(d => d.Entity === country).sort((a,b) => a.Year - b.Year);
            const years = countryData.map(d => d.Year);
            
            const hydroData = countryData.map(d => parseFloat(d['Hydro Generation - TWh']) || 0);
            const windData = countryData.map(d => parseFloat(d['Wind Generation - TWh']) || 0);
            const solarData = countryData.map(d => parseFloat(d['Solar Generation - TWh']) || 0);
            const otherData = countryData.map(d => parseFloat(d['Geo Biomass Other - TWh']) || 0);

            const ctx = document.getElementById('stackedBarChart').getContext('2d');
            charts.stackedBarChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: years,
                    datasets: [
                        {
                            label: 'Hidro',
                            data: hydroData,
                            backgroundColor: '#007bff'
                        },
                        {
                            label: 'Eólica',
                            data: windData,
                            backgroundColor: '#28a745'
                        },
                        {
                            label: 'Solar',
                            data: solarData,
                            backgroundColor: '#ffc107'
                        },
                        {
                            label: 'Bioenergía',
                            data: otherData,
                            backgroundColor: '#6c757d'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            stacked: true,
                            title: { display: true, text: 'Año' }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            title: { display: true, text: 'TWh' }
                        }
                    }
                }
            });
        }

        countrySelectDashboard.addEventListener('change', (e) => {
            renderCharts(e.target.value, yearRangeSelect.value);
        });

        yearRangeSelect.addEventListener('change', (e) => {
            renderCharts(countrySelectDashboard.value, e.target.value);
        });

        fetchDashboardData();
    }
});