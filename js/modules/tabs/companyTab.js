/**
 * Company Tab Module
 * Handles rendering and functionality for the Company tab
 */

import { getSurveyData } from '../dataService.js';
import { populateSelect } from '../uiHelpers.js';

/**
 * Render the Company tab
 */
export function renderCompanyTab() {
    const surveyData = getSurveyData();
    
    // Populate company select dropdown with case-insensitive sorting
    const uniqueCompanies = [...new Set(surveyData.map(item => item.Company))].filter(Boolean)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    const companySelect = document.getElementById('companySelect');
    if (!companySelect) {
        console.warn("Element with ID 'companySelect' not found. Cannot populate company dropdown.");
        return;
    }
    
    populateSelect('companySelect', uniqueCompanies);
    
    // Add event listener for company select
    companySelect.addEventListener('change', function() {
        const companyDetails = document.getElementById('companyDetails');
        if (!companyDetails) {
            console.warn("Element with ID 'companyDetails' not found. Cannot display company details.");
            return;
        }
        
        const selectedCompany = this.value;
        if (selectedCompany) {
            displayCompanyDetails(selectedCompany);
        } else {
            companyDetails.innerHTML = '<p class="text-muted">Please select a company to view details.</p>';
        }
    });
}

/**
 * Display detailed information for a selected company
 * @param {String} company - Company name
 */
function displayCompanyDetails(company) {
    const surveyData = getSurveyData();
    const detailsSection = document.getElementById('companyDetails');
    
    if (!detailsSection) {
        console.warn("Element with ID 'companyDetails' not found. Cannot display company details.");
        return;
    }
    
    // Get all entries for the selected company
    const companyEntries = surveyData.filter(item => item.Company === company);
    
    // Clear previous content
    detailsSection.innerHTML = '';
    
    if (companyEntries.length === 0) {
        detailsSection.innerHTML = '<p class="text-muted">No data available for this company.</p>';
        return;
    }
    
    // Use the most recent entry
    const companyData = companyEntries[0];
    
    // Create company profile card
    const profileCard = document.createElement('div');
    profileCard.className = 'card company-profile';
    
    // Create card header
    profileCard.innerHTML = `
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Company Profile: ${company}</h5>
        </div>
    `;
    
    // Create card body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    // Add status
    if (companyData.Status) {
        const statusSection = document.createElement('div');
        statusSection.className = 'mb-4';
        statusSection.innerHTML = `
            <h6>Status:</h6>
            <p>${companyData.Status}</p>
        `;
        cardBody.appendChild(statusSection);
    }
    
    // Add proposition
    if (companyData.Proposition) {
        const propositionSection = document.createElement('div');
        propositionSection.className = 'mb-4';
        propositionSection.innerHTML = `
            <h6>Proposition:</h6>
            <p>${companyData.Proposition.replace(/\\n/g, '<br>')}</p>
        `;
        cardBody.appendChild(propositionSection);
    }
    
    // Add roadmap & strategy
    if (companyData.RoadmapStrategy) {
        const roadmapSection = document.createElement('div');
        roadmapSection.className = 'mb-4';
        roadmapSection.innerHTML = `
            <h6>Roadmap & Strategy:</h6>
            <p>${companyData.RoadmapStrategy.replace(/\\n/g, '<br>')}</p>
        `;
        cardBody.appendChild(roadmapSection);
    }
    
    // Add challenges & aspirations
    if (companyData.challengesConcernsAspirations && companyData.challengesConcernsAspirations.length > 0) {
        const challengesSection = document.createElement('div');
        challengesSection.className = 'mb-4';
        challengesSection.innerHTML = `
            <h6>Challenges, Concerns & Aspirations:</h6>
            <p>${companyData.challengesConcernsAspirations[0].replace(/\\n/g, '<br>')}</p>
        `;
        cardBody.appendChild(challengesSection);
    }
    
    // Add telemetry types
    if (companyData.typesOfTelemetry && companyData.typesOfTelemetry.length > 0) {
        const telemetrySection = document.createElement('div');
        telemetrySection.className = 'mb-4';
        telemetrySection.innerHTML = `
            <h6>Types of Telemetry:</h6>
            <ul>
                ${companyData.typesOfTelemetry.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        cardBody.appendChild(telemetrySection);
    }
    
    // Add observability dimensions
    if (companyData.observabilityDimensions && companyData.observabilityDimensions.length > 0) {
        const dimensionsSection = document.createElement('div');
        dimensionsSection.className = 'mb-4';
        dimensionsSection.innerHTML = `
            <h6>Observability Dimensions:</h6>
            <ul>
                ${companyData.observabilityDimensions.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        cardBody.appendChild(dimensionsSection);
    }
    
    // Add sources of telemetry
    if (companyData.sourceOfTelemetry && companyData.sourceOfTelemetry.length > 0) {
        const sourcesSection = document.createElement('div');
        sourcesSection.className = 'mb-4';
        sourcesSection.innerHTML = `
            <h6>Sources of Telemetry:</h6>
            <ul>
                ${companyData.sourceOfTelemetry.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        cardBody.appendChild(sourcesSection);
    }
    
    // Add automatic processing
    if (companyData.automaticProcessing && companyData.automaticProcessing.length > 0) {
        const processingSection = document.createElement('div');
        processingSection.className = 'mb-4';
        processingSection.innerHTML = `
            <h6>Automatic Processing:</h6>
            <ul>
                ${companyData.automaticProcessing.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        cardBody.appendChild(processingSection);
    }
    
    // Add facets
    if (companyData.facets && companyData.facets.length > 0) {
        const facetsSection = document.createElement('div');
        facetsSection.className = 'mb-4';
        facetsSection.innerHTML = `
            <h6>Facets & Elements:</h6>
            <ul>
                ${companyData.facets.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        cardBody.appendChild(facetsSection);
    }
    
    // Add applicable elements
    if (companyData.applicable && companyData.applicable.length > 0) {
        const applicableSection = document.createElement('div');
        applicableSection.className = 'mb-4';
        applicableSection.innerHTML = `
            <h6>Applicable Elements:</h6>
            <ul>
                ${companyData.applicable.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        cardBody.appendChild(applicableSection);
    }
    
    // Add product usage
    if (companyData.pastCurrentFutureObservabilityProducts && companyData.pastCurrentFutureObservabilityProducts.length > 0) {
        const productsSection = document.createElement('div');
        productsSection.className = 'mb-4';
        productsSection.innerHTML = `
            <h6>Observability Products:</h6>
            <ul>
                ${companyData.pastCurrentFutureObservabilityProducts.map(item => 
                    `<li>${item.product} <span class="badge ${getTimeClassBadge(item.time)}">${item.time}</span></li>`
                ).join('')}
            </ul>
        `;
        cardBody.appendChild(productsSection);
    }
    
    // Add other products
    if (companyData.otherProducts) {
        const otherProductsSection = document.createElement('div');
        otherProductsSection.className = 'mb-4';
        otherProductsSection.innerHTML = `
            <h6>Other Products/Technology:</h6>
            <p>${companyData.otherProducts}</p>
        `;
        cardBody.appendChild(otherProductsSection);
    }
    
    profileCard.appendChild(cardBody);
    detailsSection.appendChild(profileCard);
}

/**
 * Get the appropriate badge class based on time period
 * @param {String} time - Time period string
 * @returns {String} CSS class for the badge
 */
function getTimeClassBadge(time) {
    if (time.includes('Nu')) {
        return 'bg-success';
    } else if (time.includes('Verkenning') || time.includes('Later')) {
        return 'bg-primary';
    } else {
        return 'bg-secondary';
    }
}
