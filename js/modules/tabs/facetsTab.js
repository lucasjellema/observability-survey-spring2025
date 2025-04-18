/**
 * Facets Tab Module
 * Handles rendering and functionality for the Facets & Elements tab
 */

import { getSurveyData, countArrayItems, getCompaniesWithItem } from '../dataService.js';
import { createBarChart } from '../chartService.js';
import { populateSelect, displayCompanies } from '../uiHelpers.js';

/**
 * Render the Facets tab
 */
export function renderFacetsTab() {
    const surveyData = getSurveyData();
    
    // Count facets
    const facetsCounts = countArrayItems(surveyData, 'facets');
    
    // Sort by count (descending)
    const sortedFacets = Object.entries(facetsCounts)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
    
    const facetLabels = Object.keys(sortedFacets);
    const facetData = Object.values(sortedFacets);
    
    // Create bar chart for facets
    createBarChart(
        'facetsChart',
        facetLabels,
        facetData,
        'Facets & Elements',
        context => {
            const label = context.label || '';
            const value = context.raw || 0;
            const companies = getCompaniesWithItem(surveyData, 'facets', label);
            return `${label}: ${value} companies (${Math.round(value / surveyData.length * 100)}%)`;
        }
    );
    
    // Populate facets select dropdown
    populateSelect('facetSelect', facetLabels);
    
    // Add event listener for facet select
    document.getElementById('facetSelect').addEventListener('change', function() {
        const selectedFacet = this.value;
        if (selectedFacet) {
            const companies = getCompaniesWithItem(surveyData, 'facets', selectedFacet);
            displayCompanies('facetCompanies', companies);
        } else {
            document.getElementById('facetCompanies').innerHTML = '';
        }
    });
    
    // Count applicable elements
    const applicableCounts = countArrayItems(surveyData, 'applicable');
    
    // Sort by count (descending)
    const sortedApplicable = Object.entries(applicableCounts)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
    
    const applicableLabels = Object.keys(sortedApplicable);
    const applicableData = Object.values(sortedApplicable);
    
    // Create bar chart for applicable elements
    createBarChart(
        'applicableChart',
        applicableLabels,
        applicableData,
        'Applicable Elements',
        context => {
            const label = context.label || '';
            const value = context.raw || 0;
            const companies = getCompaniesWithItem(surveyData, 'applicable', label);
            return `${label}: ${value} companies (${Math.round(value / surveyData.length * 100)}%)`;
        }
    );
    
    // Populate applicable select dropdown
    populateSelect('applicableSelect', applicableLabels);
    
    // Add event listener for applicable select
    document.getElementById('applicableSelect').addEventListener('change', function() {
        const selectedApplicable = this.value;
        if (selectedApplicable) {
            const companies = getCompaniesWithItem(surveyData, 'applicable', selectedApplicable);
            displayCompanies('applicableCompanies', companies);
        } else {
            document.getElementById('applicableCompanies').innerHTML = '';
        }
    });
}
