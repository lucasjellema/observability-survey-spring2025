// Main application script for Observability Survey Dashboard

// Load survey data
let surveyData = [];

// Fetch the JSON data
fetch('../data/observability_survey.json')
    .then(response => response.json())
    .then(data => {
        surveyData = data;
        initializeDashboard();
    })
    .catch(error => {
        console.error('Error loading survey data:', error);
        document.body.innerHTML = `<div class="alert alert-danger m-5">Error loading survey data: ${error.message}</div>`;
    });

// Initialize the dashboard
function initializeDashboard() {
    // Render all tabs
    renderOverviewTab();
    renderTelemetryTab();
    renderDimensionsTab();
    renderSourcesTab();
    renderProcessingTab();
    renderFacetsTab();
    renderChallengesTab();
    renderRoadmapTab();
    renderProductsTab();
    renderCompanyTab();
    
    // Initialize event listeners for interactive elements
    initializeEventListeners();
}

// Helper function to count occurrences of items in arrays
function countArrayItems(data, propertyName) {
    const counts = {};
    
    data.forEach(item => {
        if (Array.isArray(item[propertyName])) {
            item[propertyName].forEach(value => {
                if (value && value.trim() !== '') {
                    counts[value] = (counts[value] || 0) + 1;
                }
            });
        }
    });
    
    return counts;
}

// Helper function to get companies using a specific item
function getCompaniesWithItem(data, propertyName, itemValue) {
    return data.filter(item => 
        Array.isArray(item[propertyName]) && 
        item[propertyName].some(value => value === itemValue)
    ).map(item => item.Company);
}

// Helper function to create a pie/doughnut chart
function createPieChart(canvasId, labels, data, title, tooltipCallback = null) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: title
            }
        }
    };
    
    // Add custom tooltip if provided
    if (tooltipCallback) {
        chartOptions.plugins.tooltip = {
            callbacks: {
                afterLabel: tooltipCallback
            }
        };
    }
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#0d6efd', '#6610f2', '#6f42c1', '#d63384', 
                    '#dc3545', '#fd7e14', '#ffc107', '#198754',
                    '#20c997', '#0dcaf0', '#0d6efd', '#6610f2', 
                    '#6f42c1', '#d63384', '#dc3545', '#fd7e14'
                ],
                borderWidth: 1
            }]
        },
        options: chartOptions
    });
}

// Helper function to create a bar chart
function createBarChart(canvasId, labels, data, title, tooltipCallback = null) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Companies'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: title
            }
        }
    };
    
    // Add custom tooltip if provided
    if (tooltipCallback) {
        chartOptions.plugins.tooltip = {
            callbacks: {
                afterLabel: tooltipCallback
            }
        };
    }
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: '#0d6efd',
                borderColor: '#0a58ca',
                borderWidth: 1
            }]
        },
        options: chartOptions
    });
}

// Helper function to populate a select dropdown
function populateSelect(selectId, options, keepFirstOption = false) {
    const select = document.getElementById(selectId);
    
    if (!keepFirstOption) {
        select.innerHTML = '<option value="">Select...</option>';
    } else {
        // Keep existing first option (like 'All Companies')
        const firstOption = select.querySelector('option:first-child');
        select.innerHTML = '';
        if (firstOption) {
            select.appendChild(firstOption);
        }
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

// Helper function to display companies
function displayCompanies(containerId, companies) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (companies.length === 0) {
        container.innerHTML = '<p>No companies found.</p>';
        return;
    }
    
    companies.forEach(company => {
        const badge = document.createElement('div');
        badge.className = 'company-badge';
        badge.textContent = company;
        badge.setAttribute('data-company', company);
        container.appendChild(badge);
    });
}

// Render Overview Tab
function renderOverviewTab() {
    // Display list of companies
    const companiesList = document.getElementById('companiesList');
    const uniqueCompanies = [...new Set(surveyData.map(item => item.Company))].filter(Boolean).sort();
    
    uniqueCompanies.forEach(company => {
        const badge = document.createElement('div');
        badge.className = 'company-badge';
        badge.textContent = company;
        badge.setAttribute('data-company', company);
        badge.addEventListener('click', function() {
            // Switch to the company tab
            document.getElementById('company-tab').click();
            
            // Select the company in the dropdown
            const companySelect = document.getElementById('companySelect');
            companySelect.value = company;
            
            // Trigger the change event to load company details
            const event = new Event('change');
            companySelect.dispatchEvent(event);
        });
        companiesList.appendChild(badge);
    });
    
    // Create participation chart (just shows the number of responses)
    createPieChart(
        'participationChart',
        ['Responses'],
        [surveyData.length],
        `Total Responses: ${surveyData.length}`
    );
    
    // Create status chart
    const statusCounts = {};
    const statusToCompanies = {};
    
    surveyData.forEach(item => {
        if (item.Status) {
            statusCounts[item.Status] = (statusCounts[item.Status] || 0) + 1;
            
            // Add company to status mapping
            if (!statusToCompanies[item.Status]) {
                statusToCompanies[item.Status] = [];
            }
            if (!statusToCompanies[item.Status].includes(item.Company)) {
                statusToCompanies[item.Status].push(item.Company);
            }
        }
    });
    
    createPieChart(
        'statusChart',
        Object.keys(statusCounts),
        Object.values(statusCounts),
        'Observability Status',
        function(context) {
            const status = context.chart.data.labels[context.dataIndex];
            const companies = statusToCompanies[status];
            
            if (companies && companies.length > 0) {
                // Format the companies as a list for the tooltip
                return ['Companies:', ...companies.map(company => `- ${company}`)];
            }
            return [];
        }
    );
}

// Render Telemetry Tab
function renderTelemetryTab() {
    // Count telemetry types
    const telemetryCounts = countArrayItems(surveyData, 'typesOfTelemetry');
    
    // Create a mapping of telemetry types to company names
    const telemetryToCompanies = {};
    Object.keys(telemetryCounts).forEach(telemetryType => {
        telemetryToCompanies[telemetryType] = getCompaniesWithItem(surveyData, 'typesOfTelemetry', telemetryType);
    });
    
    // Create telemetry chart with custom tooltip
    createBarChart(
        'telemetryChart',
        Object.keys(telemetryCounts),
        Object.values(telemetryCounts),
        'Types of Telemetry in Focus',
        function(context) {
            const telemetryType = context.chart.data.labels[context.dataIndex];
            const companies = telemetryToCompanies[telemetryType];
            
            if (companies && companies.length > 0) {
                // Format the companies as a list for the tooltip
                return ['Companies:', ...companies.map(company => `- ${company}`)];
            }
            return [];
        }
    );
    
    // Populate telemetry select dropdown
    populateSelect('telemetrySelect', Object.keys(telemetryCounts));
}

// Render Dimensions Tab
function renderDimensionsTab() {
    // Count dimensions
    const dimensionCounts = countArrayItems(surveyData, 'observabilityDimensions');
    
    // Create a mapping of dimensions to company names
    const dimensionToCompanies = {};
    Object.keys(dimensionCounts).forEach(dimension => {
        dimensionToCompanies[dimension] = getCompaniesWithItem(surveyData, 'observabilityDimensions', dimension);
    });
    
    // Create dimensions chart with custom tooltip
    createBarChart(
        'dimensionsChart',
        Object.keys(dimensionCounts),
        Object.values(dimensionCounts),
        'Dimensions of Observability',
        function(context) {
            const dimension = context.chart.data.labels[context.dataIndex];
            const companies = dimensionToCompanies[dimension];
            
            if (companies && companies.length > 0) {
                // Format the companies as a list for the tooltip
                return ['Companies:', ...companies.map(company => `- ${company}`)];
            }
            return [];
        }
    );
    
    // Populate dimensions select dropdown
    populateSelect('dimensionSelect', Object.keys(dimensionCounts));
}

// Render Sources Tab
function renderSourcesTab() {
    // Count sources
    const sourceCounts = countArrayItems(surveyData, 'sourceOfTelemetry');
    
    // Create a mapping of sources to company names
    const sourceToCompanies = {};
    Object.keys(sourceCounts).forEach(source => {
        sourceToCompanies[source] = getCompaniesWithItem(surveyData, 'sourceOfTelemetry', source);
    });
    
    // Create sources chart with custom tooltip
    createBarChart(
        'sourcesChart',
        Object.keys(sourceCounts),
        Object.values(sourceCounts),
        'Sources of Telemetry',
        function(context) {
            const source = context.chart.data.labels[context.dataIndex];
            const companies = sourceToCompanies[source];
            
            if (companies && companies.length > 0) {
                // Format the companies as a list for the tooltip
                return ['Companies:', ...companies.map(company => `- ${company}`)];
            }
            return [];
        }
    );
    
    // Populate sources select dropdown
    populateSelect('sourceSelect', Object.keys(sourceCounts));
}

// Render Processing Tab
function renderProcessingTab() {
    // Count processing types
    const processingCounts = countArrayItems(surveyData, 'automaticProcessing');
    
    // Create a mapping of processing types to company names
    const processingToCompanies = {};
    Object.keys(processingCounts).forEach(processing => {
        processingToCompanies[processing] = getCompaniesWithItem(surveyData, 'automaticProcessing', processing);
    });
    
    // Create processing chart with custom tooltip
    createBarChart(
        'processingChart',
        Object.keys(processingCounts),
        Object.values(processingCounts),
        'Automatic Processing of Observability Data',
        function(context) {
            const processing = context.chart.data.labels[context.dataIndex];
            const companies = processingToCompanies[processing];
            
            if (companies && companies.length > 0) {
                // Format the companies as a list for the tooltip
                return ['Companies:', ...companies.map(company => `- ${company}`)];
            }
            return [];
        }
    );
    
    // Populate processing select dropdown
    populateSelect('processingSelect', Object.keys(processingCounts));
}

// Render Facets Tab
function renderFacetsTab() {
    // Count facets
    const facetCounts = countArrayItems(surveyData, 'facets');
    
    // Create a mapping of facets to company names
    const facetToCompanies = {};
    Object.keys(facetCounts).forEach(facet => {
        facetToCompanies[facet] = getCompaniesWithItem(surveyData, 'facets', facet);
    });
    
    // Create facets chart with custom tooltip
    createBarChart(
        'facetsChart',
        Object.keys(facetCounts),
        Object.values(facetCounts),
        'Facets Present',
        function(context) {
            const facet = context.chart.data.labels[context.dataIndex];
            const companies = facetToCompanies[facet];
            
            if (companies && companies.length > 0) {
                // Format the companies as a list for the tooltip
                return ['Companies:', ...companies.map(company => `- ${company}`)];
            }
            return [];
        }
    );
    
    // Count applicable elements
    const applicableCounts = countArrayItems(surveyData, 'applicable');
    
    // Create a mapping of applicable elements to company names
    const applicableToCompanies = {};
    Object.keys(applicableCounts).forEach(applicable => {
        applicableToCompanies[applicable] = getCompaniesWithItem(surveyData, 'applicable', applicable);
    });
    
    // Create applicable chart with custom tooltip
    createBarChart(
        'applicableChart',
        Object.keys(applicableCounts),
        Object.values(applicableCounts),
        'Applicable Elements',
        function(context) {
            const applicable = context.chart.data.labels[context.dataIndex];
            const companies = applicableToCompanies[applicable];
            
            if (companies && companies.length > 0) {
                // Format the companies as a list for the tooltip
                return ['Companies:', ...companies.map(company => `- ${company}`)];
            }
            return [];
        }
    );
    
    // Populate facets select dropdown
    populateSelect('facetSelect', Object.keys(facetCounts));
    
    // Populate applicable select dropdown
    populateSelect('applicableSelect', Object.keys(applicableCounts));
}

// Render Challenges Tab
function renderChallengesTab() {
    const challengesList = document.getElementById('challengesList');
    
    // Filter out entries with empty challenges
    const challengesEntries = surveyData.filter(item => 
        Array.isArray(item.challengesConcernsAspirations) && 
        item.challengesConcernsAspirations.length > 0 &&
        item.challengesConcernsAspirations[0] !== ''
    );
    
    if (challengesEntries.length === 0) {
        challengesList.innerHTML = '<p>No challenges or aspirations found.</p>';
        return;
    }
    
    challengesEntries.forEach(item => {
        const challengeItem = document.createElement('div');
        challengeItem.className = 'challenge-item';
        
        const company = document.createElement('div');
        company.className = 'challenge-company';
        company.textContent = item.Company || 'Unknown Company';
        
        const text = document.createElement('div');
        text.className = 'challenge-text';
        text.textContent = item.challengesConcernsAspirations[0];
        
        challengeItem.appendChild(company);
        challengeItem.appendChild(text);
        challengesList.appendChild(challengeItem);
    });
}

// Helper function to create a stacked bar chart
function createStackedBarChart(canvasId, labels, datasets, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Companies'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                tooltip: {
                    callbacks: {
                        afterTitle: function(context) {
                            const datasetLabel = context[0].dataset.label;
                            return [`Category: ${datasetLabel}`];
                        },
                        afterLabel: function(context) {
                            const product = context.chart.data.labels[context.dataIndex];
                            const datasetIndex = context.datasetIndex;
                            const dataset = context.chart.data.datasets[datasetIndex];
                            
                            if (dataset.companies && dataset.companies[product]) {
                                return ['Companies:', ...dataset.companies[product].map(company => `- ${company}`)];
                            }
                            return [];
                        }
                    }
                }
            }
        }
    });
}

// Render Products Tab
function renderProductsTab() {
    // Process product usage data
    const productUsage = {};
    const pastProducts = {};
    const currentProducts = {};
    const futureProducts = {};
    
    // Create mappings of products to companies
    const productToCompanies = {};
    const pastProductToCompanies = {};
    const currentProductToCompanies = {};
    const futureProductToCompanies = {};
    
    surveyData.forEach(item => {
        if (Array.isArray(item.pastCurrentFutureObservabilityProducts)) {
            item.pastCurrentFutureObservabilityProducts.forEach(productInfo => {
                const product = productInfo.product;
                const time = productInfo.time;
                const company = item.Company;
                
                // Overall usage
                productUsage[product] = (productUsage[product] || 0) + 1;
                
                // Add company to product mapping
                if (!productToCompanies[product]) {
                    productToCompanies[product] = [];
                }
                if (!productToCompanies[product].includes(company)) {
                    productToCompanies[product].push(company);
                }
                
                // Usage by time period
                if (time === 'Vroeger') {
                    pastProducts[product] = (pastProducts[product] || 0) + 1;
                    
                    if (!pastProductToCompanies[product]) {
                        pastProductToCompanies[product] = [];
                    }
                    if (!pastProductToCompanies[product].includes(company)) {
                        pastProductToCompanies[product].push(company);
                    }
                } else if (time === 'Nu') {
                    currentProducts[product] = (currentProducts[product] || 0) + 1;
                    
                    if (!currentProductToCompanies[product]) {
                        currentProductToCompanies[product] = [];
                    }
                    if (!currentProductToCompanies[product].includes(company)) {
                        currentProductToCompanies[product].push(company);
                    }
                } else if (time === 'In Verkenning' || time === 'Optie') {
                    futureProducts[product] = (futureProducts[product] || 0) + 1;
                    
                    if (!futureProductToCompanies[product]) {
                        futureProductToCompanies[product] = [];
                    }
                    if (!futureProductToCompanies[product].includes(company)) {
                        futureProductToCompanies[product].push(company);
                    }
                }
            });
        }
    });
    
    // Get all unique products across all time periods
    const allProducts = [...new Set([
        ...Object.keys(pastProducts),
        ...Object.keys(currentProducts),
        ...Object.keys(futureProducts)
    ])].sort();
    
    // Prepare data for stacked bar chart
    const pastData = [];
    const currentData = [];
    const futureData = [];
    
    allProducts.forEach(product => {
        pastData.push(pastProducts[product] || 0);
        currentData.push(currentProducts[product] || 0);
        futureData.push(futureProducts[product] || 0);
    });
    
    // Create datasets for stacked bar chart
    const datasets = [
        {
            label: 'Past Usage',
            data: pastData,
            backgroundColor: '#6f42c1',
            companies: pastProductToCompanies
        },
        {
            label: 'Exploration',
            data: futureData,
            backgroundColor: '#fd7e14',
            companies: futureProductToCompanies
        },
        {
            label: 'Current Usage',
            data: currentData,
            backgroundColor: '#0d6efd',
            companies: currentProductToCompanies
        }
    ];
    
    // Reverse the order of datasets to get current usage at the bottom, exploration in the middle, and past usage at the top
    datasets.reverse();
    
    // Create stacked bar chart for products usage
    createStackedBarChart(
        'productsChart',
        allProducts,
        datasets,
        'Products Usage by Time Period'
    );
    
    // Create past products chart with custom tooltip
    createPieChart(
        'pastProductsChart',
        Object.keys(pastProducts),
        Object.values(pastProducts),
        'Products Used in the Past',
        function(context) {
            const product = context.chart.data.labels[context.dataIndex];
            const companies = pastProductToCompanies[product];
            
            if (companies && companies.length > 0) {
                // Format the companies as a list for the tooltip
                return ['Companies:', ...companies.map(company => `- ${company}`)];
            }
            return [];
        }
    );
    
    // Create current products chart with custom tooltip
    createPieChart(
        'currentProductsChart',
        Object.keys(currentProducts),
        Object.values(currentProducts),
        'Products Used Currently',
        function(context) {
            const product = context.chart.data.labels[context.dataIndex];
            const companies = currentProductToCompanies[product];
            
            if (companies && companies.length > 0) {
                // Format the companies as a list for the tooltip
                return ['Companies:', ...companies.map(company => `- ${company}`)];
            }
            return [];
        }
    );
    
    // Create future products chart with custom tooltip
    createPieChart(
        'futureProductsChart',
        Object.keys(futureProducts),
        Object.values(futureProducts),
        'Products Being Explored',
        function(context) {
            const product = context.chart.data.labels[context.dataIndex];
            const companies = futureProductToCompanies[product];
            
            if (companies && companies.length > 0) {
                // Format the companies as a list for the tooltip
                return ['Companies:', ...companies.map(company => `- ${company}`)];
            }
            return [];
        }
    );
    
    // Populate products select dropdown
    populateSelect('productSelect', Object.keys(productUsage));
}

// Render Roadmap & Strategy Tab
function renderRoadmapTab() {
    // Get companies with roadmap strategy
    const companiesWithRoadmap = surveyData.filter(item => item.RoadmapStrategy && item.RoadmapStrategy.trim() !== '');
    
    // Populate company select dropdown for filtering with case-insensitive sorting
    const uniqueCompanies = [...new Set(companiesWithRoadmap.map(item => item.Company))].filter(Boolean)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    populateSelect('roadmapCompanySelect', uniqueCompanies, true);
    
    // Display all roadmaps initially
    displayRoadmaps();
    
    // Add event listener for company filter
    document.getElementById('roadmapCompanySelect').addEventListener('change', function() {
        displayRoadmaps(this.value);
    });
}

// Display roadmaps for all or filtered companies
function displayRoadmaps(filterCompany = '') {
    const roadmapList = document.getElementById('roadmapList');
    roadmapList.innerHTML = '';
    
    // Filter companies based on selection
    let filteredData = surveyData.filter(item => item.RoadmapStrategy && item.RoadmapStrategy.trim() !== '');
    
    if (filterCompany) {
        filteredData = filteredData.filter(item => item.Company === filterCompany);
    }
    
    // Sort by company name (case-insensitive)
    filteredData.sort((a, b) => a.Company.toLowerCase().localeCompare(b.Company.toLowerCase()));
    
    if (filteredData.length === 0) {
        roadmapList.innerHTML = '<p class="text-muted">No roadmap & strategy information available.</p>';
        return;
    }
    
    // Create roadmap cards
    filteredData.forEach(item => {
        const roadmapCard = document.createElement('div');
        roadmapCard.className = 'card mb-4';
        roadmapCard.innerHTML = `
            <div class="card-header bg-light">
                <h5 class="mb-0">${item.Company}</h5>
                <span class="badge bg-secondary">${item.Status}</span>
            </div>
            <div class="card-body">
                <h6 class="mb-3">Roadmap & Strategy:</h6>
                <p>${item.RoadmapStrategy.replace(/\n/g, '<br>')}</p>
                
                <h6 class="mb-3 mt-4">Proposition:</h6>
                <p>${item.Proposition ? item.Proposition.replace(/\n/g, '<br>') : 'Not specified'}</p>
            </div>
        `;
        roadmapList.appendChild(roadmapCard);
    });
}

// Render Company Tab
function renderCompanyTab() {
    // Populate company select dropdown with case-insensitive sorting
    const uniqueCompanies = [...new Set(surveyData.map(item => item.Company))].filter(Boolean)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    populateSelect('companySelect', uniqueCompanies);
}

// Display company details
function displayCompanyDetails(company) {
    const profile = document.getElementById('companyDetails');
    profile.innerHTML = '';
    
    // Get all entries for this company
    const companyEntries = surveyData.filter(item => item.Company === company);
    
    if (companyEntries.length === 0) {
        profile.innerHTML = '<p>No data available for this company.</p>';
        return;
    }
    
    // Use the first entry for company data
    const companyData = companyEntries[0];
    
    // Create submitter information section
    const submitterSection = document.createElement('div');
    submitterSection.className = 'card mb-4';
    submitterSection.innerHTML = `
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Submitter Information</h5>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Submission Time</th>
                            <th>Completion Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${companyEntries.map(entry => `
                            <tr>
                                <td>${entry.Name || 'Not specified'}</td>
                                <td>${entry.StartTime || 'Not specified'}</td>
                                <td>${entry.CompletionTime || 'Not specified'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    profile.appendChild(submitterSection);
    
    // Create company profile section
    const profileSection = document.createElement('div');
    profileSection.className = 'card mb-4';
    profileSection.innerHTML = `
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Company Profile: ${company}</h5>
        </div>
        <div class="card-body">
            <div class="row mb-3">
                <div class="col-md-3 fw-bold">Status:</div>
                <div class="col-md-9">${companyData.Status || 'Not specified'}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-3 fw-bold">Proposition:</div>
                <div class="col-md-9">${companyData.Proposition || 'Not specified'}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-3 fw-bold">Roadmap & Strategy:</div>
                <div class="col-md-9">${companyData.RoadmapStrategy || 'Not specified'}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-3 fw-bold">Other Products:</div>
                <div class="col-md-9">${companyData.otherProducts || 'Not specified'}</div>
            </div>
        </div>
    `;
    profile.appendChild(profileSection);
    
    // Telemetry types
    if (companyData.typesOfTelemetry && companyData.typesOfTelemetry.length > 0) {
        const telemetrySection = document.createElement('div');
        telemetrySection.className = 'card mb-4';
        telemetrySection.innerHTML = `
            <div class="card-header">
                <h5>Telemetry Types</h5>
            </div>
            <div class="card-body">
                <ul class="list-group">
                    ${companyData.typesOfTelemetry.map(type => `<li class="list-group-item">${type}</li>`).join('')}
                </ul>
            </div>
        `;
        profile.appendChild(telemetrySection);
    }
    
    // Observability dimensions
    if (companyData.observabilityDimensions && companyData.observabilityDimensions.length > 0) {
        const dimensionsSection = document.createElement('div');
        dimensionsSection.className = 'card mb-4';
        dimensionsSection.innerHTML = `
            <div class="card-header">
                <h5>Observability Dimensions</h5>
            </div>
            <div class="card-body">
                <ul class="list-group">
                    ${companyData.observabilityDimensions.map(dim => `<li class="list-group-item">${dim}</li>`).join('')}
                </ul>
            </div>
        `;
        profile.appendChild(dimensionsSection);
    }
    
    // Sources of telemetry
    if (companyData.sourceOfTelemetry && companyData.sourceOfTelemetry.length > 0) {
        const sourcesSection = document.createElement('div');
        sourcesSection.className = 'card mb-4';
        sourcesSection.innerHTML = `
            <div class="card-header">
                <h5>Sources of Telemetry</h5>
            </div>
            <div class="card-body">
                <ul class="list-group">
                    ${companyData.sourceOfTelemetry.map(source => `<li class="list-group-item">${source}</li>`).join('')}
                </ul>
            </div>
        `;
        profile.appendChild(sourcesSection);
    }
    
    // Automatic processing
    if (companyData.automaticProcessing && companyData.automaticProcessing.length > 0) {
        const processingSection = document.createElement('div');
        processingSection.className = 'card mb-4';
        processingSection.innerHTML = `
            <div class="card-header">
                <h5>Automatic Processing</h5>
            </div>
            <div class="card-body">
                <ul class="list-group">
                    ${companyData.automaticProcessing.map(proc => `<li class="list-group-item">${proc}</li>`).join('')}
                </ul>
            </div>
        `;
        profile.appendChild(processingSection);
    }
    
    // Facets
    if (companyData.facets && companyData.facets.length > 0) {
        const facetsSection = document.createElement('div');
        facetsSection.className = 'card mb-4';
        facetsSection.innerHTML = `
            <div class="card-header">
                <h5>Facets</h5>
            </div>
            <div class="card-body">
                <ul class="list-group">
                    ${companyData.facets.map(facet => `<li class="list-group-item">${facet}</li>`).join('')}
                </ul>
            </div>
        `;
        profile.appendChild(facetsSection);
    }
    
    // Applicable elements
    if (companyData.applicable && companyData.applicable.length > 0) {
        const applicableSection = document.createElement('div');
        applicableSection.className = 'card mb-4';
        applicableSection.innerHTML = `
            <div class="card-header">
                <h5>Applicable Elements</h5>
            </div>
            <div class="card-body">
                <ul class="list-group">
                    ${companyData.applicable.map(elem => `<li class="list-group-item">${elem}</li>`).join('')}
                </ul>
            </div>
        `;
        profile.appendChild(applicableSection);
    }
    
    // Challenges and aspirations
    if (companyData.challengesConcernsAspirations && companyData.challengesConcernsAspirations.length > 0 && companyData.challengesConcernsAspirations[0] !== '') {
        const challengesSection = document.createElement('div');
        challengesSection.className = 'card mb-4';
        challengesSection.innerHTML = `
            <div class="card-header">
                <h5>Challenges & Aspirations</h5>
            </div>
            <div class="card-body">
                <p class="fst-italic">${companyData.challengesConcernsAspirations[0]}</p>
            </div>
        `;
        profile.appendChild(challengesSection);
    }
    
    // Products
    if (companyData.pastCurrentFutureObservabilityProducts && companyData.pastCurrentFutureObservabilityProducts.length > 0) {
        const productsSection = document.createElement('div');
        productsSection.className = 'card mb-4';
        
        // Group products by time period
        const pastProducts = companyData.pastCurrentFutureObservabilityProducts.filter(p => p.time === 'Vroeger').map(p => p.product);
        const currentProducts = companyData.pastCurrentFutureObservabilityProducts.filter(p => p.time === 'Nu').map(p => p.product);
        const futureProducts = companyData.pastCurrentFutureObservabilityProducts.filter(p => p.time === 'In Verkenning' || p.time === 'Optie').map(p => p.product);
        
        productsSection.innerHTML = `
            <div class="card-header">
                <h5>Products</h5>
            </div>
            <div class="card-body">
                ${pastProducts.length > 0 ? `
                    <h6>Past Products:</h6>
                    <ul class="list-group mb-3">
                        ${pastProducts.map(product => `<li class="list-group-item">${product}</li>`).join('')}
                    </ul>
                ` : ''}
                
                ${currentProducts.length > 0 ? `
                    <h6>Current Products:</h6>
                    <ul class="list-group mb-3">
                        ${currentProducts.map(product => `<li class="list-group-item">${product}</li>`).join('')}
                    </ul>
                ` : ''}
                
                ${futureProducts.length > 0 ? `
                    <h6>Future/Exploring Products:</h6>
                    <ul class="list-group mb-3">
                        ${futureProducts.map(product => `<li class="list-group-item">${product}</li>`).join('')}
                    </ul>
                ` : ''}
                
                ${companyData.otherProducts ? `
                    <h6>Other Products:</h6>
                    <p>${companyData.otherProducts}</p>
                ` : ''}
            </div>
        `;
        profile.appendChild(productsSection);
    }
    
    // No need to append profile to companyDetails since profile IS companyDetails
}

// Initialize event listeners
function initializeEventListeners() {
    // Telemetry select change event
    document.getElementById('telemetrySelect').addEventListener('change', function() {
        const selectedTelemetry = this.value;
        if (selectedTelemetry) {
            const companies = getCompaniesWithItem(surveyData, 'typesOfTelemetry', selectedTelemetry);
            displayCompanies('telemetryCompanies', companies);
        } else {
            document.getElementById('telemetryCompanies').innerHTML = '';
        }
    });
    
    // Dimension select change event
    document.getElementById('dimensionSelect').addEventListener('change', function() {
        const selectedDimension = this.value;
        if (selectedDimension) {
            const companies = getCompaniesWithItem(surveyData, 'observabilityDimensions', selectedDimension);
            displayCompanies('dimensionCompanies', companies);
        } else {
            document.getElementById('dimensionCompanies').innerHTML = '';
        }
    });
    
    // Source select change event
    document.getElementById('sourceSelect').addEventListener('change', function() {
        const selectedSource = this.value;
        if (selectedSource) {
            const companies = getCompaniesWithItem(surveyData, 'sourceOfTelemetry', selectedSource);
            displayCompanies('sourceCompanies', companies);
        } else {
            document.getElementById('sourceCompanies').innerHTML = '';
        }
    });
    
    // Processing select change event
    document.getElementById('processingSelect').addEventListener('change', function() {
        const selectedProcessing = this.value;
        if (selectedProcessing) {
            const companies = getCompaniesWithItem(surveyData, 'automaticProcessing', selectedProcessing);
            displayCompanies('processingCompanies', companies);
        } else {
            document.getElementById('processingCompanies').innerHTML = '';
        }
    });
    
    // Facet select change event
    document.getElementById('facetSelect').addEventListener('change', function() {
        const selectedFacet = this.value;
        if (selectedFacet) {
            const companies = getCompaniesWithItem(surveyData, 'facets', selectedFacet);
            displayCompanies('facetCompanies', companies);
        } else {
            document.getElementById('facetCompanies').innerHTML = '';
        }
    });
    
    // Applicable select change event
    document.getElementById('applicableSelect').addEventListener('change', function() {
        const selectedApplicable = this.value;
        if (selectedApplicable) {
            const companies = getCompaniesWithItem(surveyData, 'applicable', selectedApplicable);
            displayCompanies('applicableCompanies', companies);
        } else {
            document.getElementById('applicableCompanies').innerHTML = '';
        }
    });
    
    // Product select change event
    document.getElementById('productSelect').addEventListener('change', function() {
        const selectedProduct = this.value;
        if (selectedProduct) {
            // Get the container for displaying companies
            const container = document.getElementById('productCompanies');
            container.innerHTML = '';
            
            // Find companies using this product and their usage period
            const pastCompanies = [];
            const currentCompanies = [];
            const futureCompanies = [];
            
            surveyData.forEach(item => {
                if (Array.isArray(item.pastCurrentFutureObservabilityProducts)) {
                    const company = item.Company;
                    
                    item.pastCurrentFutureObservabilityProducts.forEach(productInfo => {
                        if (productInfo.product === selectedProduct) {
                            if (productInfo.time === 'Vroeger') {
                                if (!pastCompanies.includes(company)) {
                                    pastCompanies.push(company);
                                }
                            } else if (productInfo.time === 'Nu') {
                                if (!currentCompanies.includes(company)) {
                                    currentCompanies.push(company);
                                }
                            } else if (productInfo.time === 'In Verkenning' || productInfo.time === 'Optie') {
                                if (!futureCompanies.includes(company)) {
                                    futureCompanies.push(company);
                                }
                            }
                        }
                    });
                }
            });
            
            // Display companies with color coding
            if (pastCompanies.length === 0 && currentCompanies.length === 0 && futureCompanies.length === 0) {
                container.innerHTML = '<p>No companies found.</p>';
                return;
            }
            
            // Add a legend
            const legend = document.createElement('div');
            legend.className = 'product-usage-legend mb-3';
            legend.innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <span class="legend-color" style="background-color: #6f42c1;"></span>
                    <span class="ms-2">Past Usage</span>
                </div>
                <div class="d-flex align-items-center mb-2">
                    <span class="legend-color" style="background-color: #fd7e14;"></span>
                    <span class="ms-2">Exploration</span>
                </div>
                <div class="d-flex align-items-center">
                    <span class="legend-color" style="background-color: #0d6efd;"></span>
                    <span class="ms-2">Current Usage</span>
                </div>
            `;
            container.appendChild(legend);
            
            // Create a wrapper for the badges
            const badgesContainer = document.createElement('div');
            badgesContainer.className = 'd-flex flex-wrap';
            container.appendChild(badgesContainer);
            
            // Add past companies
            pastCompanies.forEach(company => {
                const badge = document.createElement('div');
                badge.className = 'company-badge';
                badge.style.backgroundColor = '#6f42c1';
                badge.style.color = 'white';
                badge.setAttribute('data-company', company);
                badge.textContent = company;
                badgesContainer.appendChild(badge);
            });
            
            // Add future/exploration companies
            futureCompanies.forEach(company => {
                const badge = document.createElement('div');
                badge.className = 'company-badge';
                badge.style.backgroundColor = '#fd7e14';
                badge.style.color = 'white';
                badge.setAttribute('data-company', company);
                badge.textContent = company;
                badgesContainer.appendChild(badge);
            });
            
            // Add current companies
            currentCompanies.forEach(company => {
                const badge = document.createElement('div');
                badge.className = 'company-badge';
                badge.style.backgroundColor = '#0d6efd';
                badge.style.color = 'white';
                badge.setAttribute('data-company', company);
                badge.textContent = company;
                badgesContainer.appendChild(badge);
            });
        } else {
            document.getElementById('productCompanies').innerHTML = '';
        }
    });
    
    // Company select change event
    document.getElementById('companySelect').addEventListener('change', function() {
        const selectedCompany = this.value;
        if (selectedCompany) {
            displayCompanyDetails(selectedCompany);
        } else {
            document.getElementById('companyDetails').innerHTML = '<p class="text-muted">Please select a company to view details.</p>';
        }
    });
    
    // Make all company badges throughout the app clickable
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('company-badge')) {
            const company = event.target.getAttribute('data-company') || event.target.textContent;
            
            // Switch to the company tab
            document.getElementById('company-tab').click();
            
            // Select the company in the dropdown
            const companySelect = document.getElementById('companySelect');
            companySelect.value = company;
            
            // Trigger the change event to load company details
            const changeEvent = new Event('change');
            companySelect.dispatchEvent(changeEvent);
        }
    });
}
