import React from "react";

const FilterSection = ({
  quickFilters,
  advancedFilters,
  showAdvanced,
  onQuickFilterChange,
  onAdvancedFilterChange,
  onToggleAdvanced,
  onClearFilters,
  availableStations,
  activeFiltersCount,
}) => {
  return (
    <div className="filters">
      {/* Header */}
      <div className="filters__header">
        <h3 className="filters__title">Filter Test Results</h3>
        <div className="filters__header-actions">
          {activeFiltersCount > 0 && (
            <span className="filters__active-count">
              {activeFiltersCount} filter(s) active
            </span>
          )}
          <button onClick={onClearFilters} className="filters__clear-btn">
            Clear All
          </button>
        </div>
      </div>

      {/* Quick Filters - Always Visible */}
      <div className="filters__quick">
        <h4 className="filters__section-title">Quick Filters</h4>
        <div className="filters__row">
          {/* Result Filter */}
          <div className="filters__field">
            <label className="filters__label">Test Result:</label>
            <select
              value={quickFilters.result}
              onChange={(e) => onQuickFilterChange("result", e.target.value)}
              className="filters__select"
            >
              <option value="all">All Results</option>
              <option value="PASS">Pass Only</option>
              <option value="FAIL">Fail Only</option>
            </select>
          </div>

          {/* Station Filter */}
          <div className="filters__field">
            <label className="filters__label">Station:</label>
            {availableStations.length > 0 ? (
              <select
                value={quickFilters.stationId}
                onChange={(e) =>
                  onQuickFilterChange("stationId", e.target.value)
                }
                className="filters__select"
              >
                <option value="">All Stations</option>
                {availableStations.map((station) => (
                  <option key={station.stationId} value={station.stationId}>
                    {station.stationId} - {station.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={quickFilters.stationId}
                onChange={(e) =>
                  onQuickFilterChange("stationId", e.target.value)
                }
                placeholder="Enter station ID..."
                className="filters__input"
              />
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="filters__toggle-section">
        <button
          onClick={onToggleAdvanced}
          className={`filters__toggle-btn ${showAdvanced ? "filters__toggle-btn--hide" : "filters__toggle-btn--show"}`}
        >
          {showAdvanced ? "▼ Hide Advanced Filters" : "▶ Show Advanced Filters"}
        </button>
      </div>

      {/* Advanced Filters - Collapsible */}
      {showAdvanced && (
        <div className="filters__advanced">
          <h4 className="filters__section-title">Advanced Filters</h4>
          <div className="filters__advanced-grid">
            {/* Board Serial Filter */}
            <div className="filters__field">
              <label className="filters__label">Board Serial:</label>
              <input
                type="text"
                value={advancedFilters.boardSerial}
                onChange={(e) =>
                  onAdvancedFilterChange("boardSerial", e.target.value)
                }
                placeholder="Search board serial..."
                className="filters__input"
              />
            </div>

            {/* Operator Filter */}
            <div className="filters__field">
              <label className="filters__label">Operator:</label>
              <input
                type="text"
                value={advancedFilters.operator}
                onChange={(e) =>
                  onAdvancedFilterChange("operator", e.target.value)
                }
                placeholder="Search operator..."
                className="filters__input"
              />
            </div>

            {/* Failure Type Filter */}
            <div className="filters__field">
              <label className="filters__label">Failure Type:</label>
              <input
                type="text"
                value={advancedFilters.failureType}
                onChange={(e) =>
                  onAdvancedFilterChange("failureType", e.target.value)
                }
                placeholder="Search failure type..."
                className="filters__input"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
