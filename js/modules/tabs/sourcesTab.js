/**
 * Sources Tab Module
 * Handles rendering and functionality for the Sources of Telemetry tab
 */

import { getSurveyData, countArrayItems, getCompaniesWithItem } from '../dataService.js';
import { createBarChart } from '../chartService.js';
import { populateSelect, displayCompanies } from '../uiHelpers.js';

/**
 * Render the Sources tab
 */
export function renderSourcesTab() {
    const surveyData = getSurveyData();
    
    // Count sources of telemetry
    const sourcesCounts = countArrayItems(surveyData, 'sourceOfTelemetry');
    
    // Sort by count (descending)
    const sortedSources = Object.entries(sourcesCounts)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
    
    const sourceLabels = Object.keys(sortedSources);
    const sourceData = Object.values(sortedSources);
    
    // Create bar chart
    createBarChart(
        'sourcesChart',
        sourceLabels,
        sourceData,
        'Sources of Telemetry',
        context => {
            const label = context.label || '';
            const value = context.raw || 0;
            const companies = getCompaniesWithItem(surveyData, 'sourceOfTelemetry', label);
            return `${label}: ${value} companies (${Math.round(value / surveyData.length * 100)}%)`;
        }
    );
    
    // Populate sources select dropdown
    populateSelect('sourceSelect', sourceLabels);
    
    // Add event listener for source select
    document.getElementById('sourceSelect').addEventListener('change', function() {
        const selectedSource = this.value;
        if (selectedSource) {
            const companies = getCompaniesWithItem(surveyData, 'sourceOfTelemetry', selectedSource);
            displayCompanies('sourceCompanies', companies);
        } else {
            document.getElementById('sourceCompanies').innerHTML = '';
        }
    });
}
