/**
 * Processing Tab Module
 * Handles rendering and functionality for the Automatic Processing tab
 */

import { getSurveyData, countArrayItems, getCompaniesWithItem } from '../dataService.js';
import { createBarChart } from '../chartService.js';
import { populateSelect, displayCompanies } from '../uiHelpers.js';

/**
 * Render the Processing tab
 */
export function renderProcessingTab() {
    const surveyData = getSurveyData();
    
    // Count automatic processing methods
    const processingCounts = countArrayItems(surveyData, 'automaticProcessing');
    
    // Sort by count (descending)
    const sortedProcessing = Object.entries(processingCounts)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
    
    const processingLabels = Object.keys(sortedProcessing);
    const processingData = Object.values(sortedProcessing);
    
    // Create bar chart
    createBarChart(
        'processingChart',
        processingLabels,
        processingData,
        'Automatic Processing Methods',
        context => {
            const label = context.label || '';
            const value = context.raw || 0;
            const companies = getCompaniesWithItem(surveyData, 'automaticProcessing', label);
            
            // Create tooltip with company names
            const tooltipLines = [
                `${label}: ${value} companies (${Math.round(value / surveyData.length * 100)}%)`
            ];
            
            // Add company names (limited to 10 to avoid overwhelming tooltips)
            const displayCompanies = companies.slice(0, 10);
            displayCompanies.forEach(company => {
                tooltipLines.push(`- ${company}`);
            });
            
            // Add indicator if there are more companies
            if (companies.length > 10) {
                tooltipLines.push(`... and ${companies.length - 10} more`);
            }
            
            return tooltipLines;
        }
    );
    
    // Populate processing select dropdown
    populateSelect('processingSelect', processingLabels);
    
    // Add event listener for processing select
    document.getElementById('processingSelect').addEventListener('change', function() {
        const selectedProcessing = this.value;
        if (selectedProcessing) {
            const companies = getCompaniesWithItem(surveyData, 'automaticProcessing', selectedProcessing);
            displayCompanies('processingCompanies', companies);
        } else {
            document.getElementById('processingCompanies').innerHTML = '';
        }
    });
}
