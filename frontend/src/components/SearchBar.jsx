import React from 'react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Books',
  'Home',
];

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  onResetFilters,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    (selectedCategory !== 'All Categories' && selectedCategory !== '') ||
    selectedSort !== '';

  return (
    <div className="search-filter-section">
      <div className="search-filter-card">
        {/* Search Input Box */}
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            id="product-search-input"
            className="search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Group: Category & Sort */}
        <div className="filters-row">
          {/* Category Dropdown */}
          <div className="filter-item">
            <label htmlFor="category-select" className="filter-label">
              Category:
            </label>
            <select
              id="category-select"
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown (Bonus Challenge) */}
          <div className="filter-item">
            <label htmlFor="sort-select" className="filter-label">
              Sort by:
            </label>
            <select
              id="sort-select"
              className="filter-select"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              <option value="">Featured / Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              className="btn-reset-filters"
              onClick={onResetFilters}
              title="Clear all active filters"
            >
              🔄 Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
