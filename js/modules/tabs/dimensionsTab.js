/**
 * Dimensions Tab Module
 * Handles rendering and functionality for the Observability Dimensions tab
 */

import { getSurveyData, countArrayItems, getCompaniesWithItem } from '../dataService.js';
import { createBarChart } from '../chartService.js';
import { populateSelect, displayCompanies } from '../uiHelpers.js';

/**
 * Render the Dimensions tab
 */
export function renderDimensionsTab() {
    const surveyData = getSurveyData();
    
    // Count observability dimensions
    const dimensionCounts = countArrayItems(surveyData, 'observabilityDimensions');
    
    // Sort by count (descending)
    const sortedDimensions = Object.entries(dimensionCounts)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
    
    const dimensionLabels = Object.keys(sortedDimensions);
    const dimensionData = Object.values(sortedDimensions);
    
    // Create bar chart
    createBarChart(
        'dimensionsChart',
        dimensionLabels,
        dimensionData,
        'Observability Dimensions',
        context => {
            const label = context.label || '';
            const value = context.raw || 0;
            const companies = getCompaniesWithItem(surveyData, 'observabilityDimensions', label);
            
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
    
    // Populate dimensions select dropdown
    populateSelect('dimensionSelect', dimensionLabels);
    
    // Add event listener for dimension select
    document.getElementById('dimensionSelect').addEventListener('change', function() {
        const selectedDimension = this.value;
        if (selectedDimension) {
            const companies = getCompaniesWithItem(surveyData, 'observabilityDimensions', selectedDimension);
            displayCompanies('dimensionCompanies', companies);
        } else {
            document.getElementById('dimensionCompanies').innerHTML = '';
        }
    });
}
