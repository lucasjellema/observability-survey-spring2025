/**
 * Products Tab Module
 * Handles rendering and functionality for the Products tab
 */

import { getSurveyData } from '../dataService.js';
import { createStackedBarChart, createBarChart } from '../chartService.js';
import { populateSelect } from '../uiHelpers.js';

/**
 * Render the Products tab
 */
export function renderProductsTab() {
    const surveyData = getSurveyData();
    
    // Process product usage data
    const productUsage = processProductUsage(surveyData);
    
    // Note: The HTML doesn't have a product usage legend container,
    // so we'll skip displaying the legend
    
    // Create stacked bar chart for product usage if the canvas exists
    const productsChart = document.getElementById('productsChart');
    if (productsChart) {
        createProductUsageChart(productUsage);
    } else {
        console.warn("Element with ID 'productsChart' not found. Cannot create product usage chart.");
    }
    
    // Create individual charts for past, current, and future product usage
    createPastProductsChart(productUsage);
    createCurrentProductsChart(productUsage);
    createFutureProductsChart(productUsage);
    
    // Populate product select dropdown
    populateSelect('productSelect', Object.keys(productUsage));
    
    // Add event listener for product select if it exists
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
        productSelect.addEventListener('change', function() {
            const selectedProduct = this.value;
            const productCompanies = document.getElementById('productCompanies');
            
            if (!productCompanies) {
                console.warn("Element with ID 'productCompanies' not found. Cannot display product companies.");
                return;
            }
            
            if (selectedProduct) {
                displayProductCompanies(selectedProduct, productUsage[selectedProduct]);
            } else {
                productCompanies.innerHTML = '<p class="text-muted">Please select a product to view companies.</p>';
            }
        });
    } else {
        console.warn("Element with ID 'productSelect' not found. Cannot add event listener.");
    }
}

/**
 * Process product usage data from survey responses
 * @param {Array} data - Survey data array
 * @returns {Object} Processed product usage data
 */
function processProductUsage(data) {
    const productUsage = {};
    
    // Process each survey response
    data.forEach(item => {
        if (item.pastCurrentFutureObservabilityProducts && Array.isArray(item.pastCurrentFutureObservabilityProducts)) {
            item.pastCurrentFutureObservabilityProducts.forEach(productInfo => {
                const product = productInfo.product;
                const time = productInfo.time;
                
                if (!productUsage[product]) {
                    productUsage[product] = {
                        past: [],
                        current: [],
                        future: []
                    };
                }
                
                // Categorize by time period
                if (time.includes('Vroeger')) {
                    productUsage[product].past.push(item.Company);
                } else if (time.includes('Nu')) {
                    productUsage[product].current.push(item.Company);
                } else if (time.includes('Verkenning') || time.includes('Later')) {
                    productUsage[product].future.push(item.Company);
                }
            });
        }
    });
    
    return productUsage;
}

/**
 * Display the product usage legend
 * Note: This function is not currently used as the HTML doesn't have a legend container
 */
function displayProductUsageLegend() {
    // This function is kept for reference but not used
    // since the HTML doesn't have a product usage legend container
}

/**
 * Create the product usage stacked bar chart
 * @param {Object} productUsage - Processed product usage data
 */
function createProductUsageChart(productUsage) {
    const productsChart = document.getElementById('productsChart');
    if (!productsChart) {
        console.warn("Element with ID 'productsChart' not found. Cannot create product usage chart.");
        return;
    }
    // Prepare data for stacked bar chart
    const products = Object.keys(productUsage);
    
    // Sort products by total usage (descending)
    products.sort((a, b) => {
        const totalA = productUsage[a].past.length + productUsage[a].current.length + productUsage[a].future.length;
        const totalB = productUsage[b].past.length + productUsage[b].current.length + productUsage[b].future.length;
        return totalB - totalA;
    });
    
    // Take top 15 products for better visualization
    const topProducts = products.slice(0, 15);
    
    // Prepare datasets
    const currentData = topProducts.map(product => productUsage[product].current.length);
    const futureData = topProducts.map(product => productUsage[product].future.length);
    const pastData = topProducts.map(product => productUsage[product].past.length);
    
    // Prepare companies lists for tooltips
    const currentCompanies = topProducts.map(product => productUsage[product].current);
    const futureCompanies = topProducts.map(product => productUsage[product].future);
    const pastCompanies = topProducts.map(product => productUsage[product].past);
    
    // Create datasets for stacked bar chart
    const datasets = [
        {
            label: 'Current Usage',
            data: currentData,
            backgroundColor: '#198754',
            companies: currentCompanies
        },
        {
            label: 'Future/Exploring',
            data: futureData,
            backgroundColor: '#0d6efd',
            companies: futureCompanies
        },
        {
            label: 'Past Usage',
            data: pastData,
            backgroundColor: '#6c757d',
            companies: pastCompanies
        }
    ];
    
    // Create stacked bar chart
    createStackedBarChart(
        'productsChart',
        topProducts,
        datasets,
        'Observability Products Usage'
    );
}

/**
 * Create chart for products used in the past
 * @param {Object} productUsage - Processed product usage data
 */
function createPastProductsChart(productUsage) {
    const pastProductsChart = document.getElementById('pastProductsChart');
    if (!pastProductsChart) {
        console.warn("Element with ID 'pastProductsChart' not found. Cannot create past products chart.");
        return;
    }
    
    // Get products with past usage
    const productsWithPastUsage = Object.entries(productUsage)
        .filter(([_, usage]) => usage.past.length > 0)
        .sort((a, b) => b[1].past.length - a[1].past.length)
        .slice(0, 10); // Take top 10 for better visualization
    
    if (productsWithPastUsage.length === 0) {
        const ctx = pastProductsChart.getContext('2d');
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', pastProductsChart.width / 2, pastProductsChart.height / 2);
        return;
    }
    
    const labels = productsWithPastUsage.map(([product]) => product);
    const data = productsWithPastUsage.map(([_, usage]) => usage.past.length);
    
    createBarChart(
        'pastProductsChart',
        labels,
        data,
        'Products Used in the Past',
        context => {
            const label = context.label || '';
            const value = context.raw || 0;
            const companies = productUsage[label].past;
            return [
                `${label}: ${value} companies`,
                ...companies.map(company => `- ${company}`)
            ];
        }
    );
}

/**
 * Create chart for products currently in use
 * @param {Object} productUsage - Processed product usage data
 */
function createCurrentProductsChart(productUsage) {
    const currentProductsChart = document.getElementById('currentProductsChart');
    if (!currentProductsChart) {
        console.warn("Element with ID 'currentProductsChart' not found. Cannot create current products chart.");
        return;
    }
    
    // Get products with current usage
    const productsWithCurrentUsage = Object.entries(productUsage)
        .filter(([_, usage]) => usage.current.length > 0)
        .sort((a, b) => b[1].current.length - a[1].current.length)
        .slice(0, 10); // Take top 10 for better visualization
    
    if (productsWithCurrentUsage.length === 0) {
        const ctx = currentProductsChart.getContext('2d');
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', currentProductsChart.width / 2, currentProductsChart.height / 2);
        return;
    }
    
    const labels = productsWithCurrentUsage.map(([product]) => product);
    const data = productsWithCurrentUsage.map(([_, usage]) => usage.current.length);
    
    createBarChart(
        'currentProductsChart',
        labels,
        data,
        'Products Currently in Use',
        context => {
            const label = context.label || '';
            const value = context.raw || 0;
            const companies = productUsage[label].current;
            return [
                `${label}: ${value} companies`,
                ...companies.map(company => `- ${company}`)
            ];
        }
    );
}

/**
 * Create chart for products being explored
 * @param {Object} productUsage - Processed product usage data
 */
function createFutureProductsChart(productUsage) {
    const futureProductsChart = document.getElementById('futureProductsChart');
    if (!futureProductsChart) {
        console.warn("Element with ID 'futureProductsChart' not found. Cannot create future products chart.");
        return;
    }
    
    // Get products being explored
    const productsBeingExplored = Object.entries(productUsage)
        .filter(([_, usage]) => usage.future.length > 0)
        .sort((a, b) => b[1].future.length - a[1].future.length)
        .slice(0, 10); // Take top 10 for better visualization
    
    if (productsBeingExplored.length === 0) {
        const ctx = futureProductsChart.getContext('2d');
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', futureProductsChart.width / 2, futureProductsChart.height / 2);
        return;
    }
    
    const labels = productsBeingExplored.map(([product]) => product);
    const data = productsBeingExplored.map(([_, usage]) => usage.future.length);
    
    createBarChart(
        'futureProductsChart',
        labels,
        data,
        'Products Being Explored',
        context => {
            const label = context.label || '';
            const value = context.raw || 0;
            const companies = productUsage[label].future;
            return [
                `${label}: ${value} companies`,
                ...companies.map(company => `- ${company}`)
            ];
        }
    );
}

/**
 * Display companies using a selected product
 * @param {String} product - Product name
 * @param {Object} usageData - Usage data for the product
 */
function displayProductCompanies(product, usageData) {
    const companiesContainer = document.getElementById('productCompanies');
    if (!companiesContainer) {
        console.warn("Element with ID 'productCompanies' not found. Cannot display product companies.");
        return;
    }
    
    // Clear previous content
    companiesContainer.innerHTML = '';
    
    // Add usage statistics
    const totalUsage = usageData.current.length + usageData.past.length + usageData.future.length;
    companiesContainer.innerHTML = `
        <div class="mb-3">
            <h6>${product} Usage</h6>
            <p><strong>Total:</strong> ${totalUsage} companies</p>
        </div>
    `;
    
    // Add company badges for current usage
    if (usageData.current.length > 0) {
        const currentSection = document.createElement('div');
        currentSection.className = 'mb-3';
        currentSection.innerHTML = '<h6>Current Users:</h6>';
        
        const currentBadgesContainer = document.createElement('div');
        currentBadgesContainer.className = 'd-flex flex-wrap';
        
        usageData.current.forEach(company => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-success m-1';
            badge.textContent = company;
            currentBadgesContainer.appendChild(badge);
        });
        
        currentSection.appendChild(currentBadgesContainer);
        companiesContainer.appendChild(currentSection);
    }
    
    // Add company badges for future usage
    if (usageData.future.length > 0) {
        const futureSection = document.createElement('div');
        futureSection.className = 'mb-3';
        futureSection.innerHTML = '<h6>Future/Exploring:</h6>';
        
        const futureBadgesContainer = document.createElement('div');
        futureBadgesContainer.className = 'd-flex flex-wrap';
        
        usageData.future.forEach(company => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary m-1';
            badge.textContent = company;
            futureBadgesContainer.appendChild(badge);
        });
        
        futureSection.appendChild(futureBadgesContainer);
        companiesContainer.appendChild(futureSection);
    }
    
    // Add company badges for past usage
    if (usageData.past.length > 0) {
        const pastSection = document.createElement('div');
        pastSection.className = 'mb-3';
        pastSection.innerHTML = '<h6>Past Users:</h6>';
        
        const pastBadgesContainer = document.createElement('div');
        pastBadgesContainer.className = 'd-flex flex-wrap';
        
        usageData.past.forEach(company => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary m-1';
            badge.textContent = company;
            pastBadgesContainer.appendChild(badge);
        });
        
        pastSection.appendChild(pastBadgesContainer);
        companiesContainer.appendChild(pastSection);
    }
    
    // If no companies are using this product
    if (totalUsage === 0) {
        companiesContainer.innerHTML = '<p class="text-muted">No companies are using this product.</p>';
    }
}
