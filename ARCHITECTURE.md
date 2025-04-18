# Observability Survey Dashboard - Architecture Documentation

This document provides a detailed overview of the Observability Survey Dashboard architecture, explaining the design decisions, code organization, and how different components interact.

## 1. Architectural Overview

The application follows a modular JavaScript architecture with clear separation of concerns. The architecture is designed to be:

- **Maintainable**: Each component has a single responsibility
- **Extensible**: New features can be added with minimal changes to existing code
- **Readable**: Code is organized logically with consistent naming conventions
- **Resilient**: Error handling is implemented throughout the application

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                          main.js                            │
└───────┬─────────────────┬─────────────────────┬─────────────┘
        │                 │                     │
        ▼                 ▼                     ▼
┌───────────────┐ ┌───────────────┐    ┌───────────────────┐
│  dataService  │ │  chartService │    │     uiHelpers     │
└───────┬───────┘ └───────┬───────┘    └─────────┬─────────┘
        │                 │                      │
        └─────────────────┼──────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Tab Modules                            │
├─────────────┬─────────────┬─────────────┬─────────────┬─────┤
│  overviewTab│ telemetryTab│ dimensionsTab│ sourcesTab │ ... │
└─────────────┴─────────────┴─────────────┴─────────────┴─────┘
```

## 2. Core Components

### 2.1 Data Layer

#### 2.1.1 dataService.js

The data service is responsible for:

- Loading survey data from local JSON or remote URL
- Processing and transforming data for visualization
- Providing utility functions for data filtering and analysis

```javascript
// Key functions:
loadSurveyData() // Loads data with URL parameter support
getCompaniesWithItem() // Filters companies by criteria
getUniqueCompanies() // Returns deduplicated company list
```

#### 2.1.2 Data Flow

1. The application attempts to load data from the URL parameter `parDataFile` if present
2. If no parameter is provided or loading fails, it falls back to the default data file
3. The loaded data is then passed to the appropriate tab modules for visualization

### 2.2 Visualization Layer

#### 2.2.1 chartService.js

The chart service provides a consistent API for creating different types of charts:

- Bar charts for categorical data
- Pie charts for distribution data
- Stacked bar charts for time-based comparisons

```javascript
// Key functions:
createBarChart() // Creates bar charts with customizable tooltips
createPieChart() // Creates pie charts with customizable tooltips
createStackedBarChart() // Creates stacked bar charts for product analysis
```

#### 2.2.2 Chart Configuration

All charts are configured with:
- Responsive sizing
- Interactive tooltips showing company details
- Consistent color schemes
- Accessibility features

### 2.3 UI Layer

#### 2.3.1 uiHelpers.js

The UI helpers module provides utility functions for manipulating the DOM:

```javascript
// Key functions:
populateSelect() // Populates dropdown selects with options
displayCompanyBadges() // Renders company badges in the UI
showElement() // Shows/hides elements based on conditions
```

## 3. Tab Modules

Each dashboard tab is implemented as a separate module in the `js/modules/tabs/` directory:

### 3.1 Tab Structure

All tab modules follow a consistent pattern:
1. Import required services and utilities
2. Define a `render` function that processes data and creates visualizations
3. Set up event listeners for interactive elements

### 3.2 Key Tab Modules

- **overviewTab.js**: General statistics and participation overview
- **telemetryTab.js**: Analysis of telemetry types
- **dimensionsTab.js**: Visualization of observability dimensions
- **sourcesTab.js**: Sources of telemetry data
- **processingTab.js**: Automatic processing methods
- **facetsTab.js**: Facets and applicable elements
- **productsTab.js**: Product usage analysis
- **companyTab.js**: Detailed company profiles

## 4. Main Application Flow

### 4.1 Initialization (main.js)

The main.js file serves as the entry point and orchestrates the application:

1. Loads survey data using dataService
2. Displays data source information
3. Initializes each tab based on the HTML structure
4. Sets up global event listeners

### 4.2 Error Handling

The application implements comprehensive error handling:
- Element existence checks before DOM operations
- Graceful degradation when elements are missing
- Detailed console logging for debugging
- Fallback mechanisms for data loading

## 5. Data Obfuscation

### 5.1 obfuscate_data.py

A Python script that anonymizes sensitive data:

- Replaces real company names with fictitious alternatives
- Replaces person names with fictitious names
- Replaces product names with generic alternatives
- Preserves relationships between entities
- Processes free text fields to ensure complete anonymization

## 6. Future Extensibility

The architecture supports easy extension through:

1. **Adding New Tabs**: Create a new module in the tabs directory and add corresponding HTML
2. **New Chart Types**: Extend chartService with additional visualization methods
3. **Additional Data Sources**: The dataService can be extended to support more data formats
4. **Enhanced Filtering**: Add new filtering capabilities by extending the existing pattern

## 7. Performance Considerations

- Lazy loading of tab content
- Efficient data processing with appropriate data structures
- Optimized DOM manipulations
- Responsive design for all device sizes

## 8. Development Guidelines

When extending the application:

1. Maintain the separation of concerns
2. Add comprehensive error handling
3. Follow the established naming conventions
4. Document new functions and modules
5. Test on multiple browsers and device sizes

---

This architecture document serves as a guide for understanding and extending the Observability Survey Dashboard. The modular design ensures that the application can evolve while maintaining code quality and performance.
