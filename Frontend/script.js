/**
 * ===================================================================
 * SMART EXPENSE TRACKER - JavaScript Application
 * ===================================================================
 * A modern expense tracking application with full CRUD functionality
 * Version: 2.0.0 - Updated August 12, 2025
 * Features: AI-powered categorization, Hotel category support
 * ===================================================================
 */

// ============================= UTILITY FUNCTIONS =============================
/**
 * Utility class for common operations
 */
class Utils {
  /**
   * Format currency amount
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format date for display
   */
  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Debounce function to limit API calls
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Deep clone an object
   */
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Check if a value is empty
   */
  static isEmpty(value) {
    return value === null || value === undefined || value === '';
  }

  /**
   * Sanitize HTML to prevent XSS
   */
  static sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

/**
 * Notification system for user feedback
 */
class NotificationSystem {
  static show(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-message">${Utils.sanitizeHTML(message)}</span>
      <button class="notification-close" onclick="this.parentElement.remove()">Ã—</button>
    `;

    // Add styles
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '9999',
      minWidth: '300px',
      maxWidth: '500px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'slideInRight 0.3s ease-out',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    });

    // Set background color based on type
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#007bff'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to DOM
    document.body.appendChild(notification);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.style.animation = 'slideOutRight 0.3s ease-in';
          setTimeout(() => notification.remove(), 300);
        }
      }, duration);
    }
  }
}

/**
 * Enhanced error handling
 */
class ErrorHandler {
  static handle(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    let userMessage = 'An unexpected error occurred';
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      userMessage = 'Unable to connect to server. Please check your connection.';
    } else if (error.message.includes('HTTP 404')) {
      userMessage = 'Resource not found';
    } else if (error.message.includes('HTTP 500')) {
      userMessage = 'Server error. Please try again later.';
    } else if (error.message.includes('HTTP 400')) {
      userMessage = 'Invalid request. Please check your input.';
    }
    
    NotificationSystem.show(userMessage, 'error');
    return userMessage;
  }
}

// Add CSS for notifications
const notificationStyles = `
  <style>
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .notification-close {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .notification-close:hover {
      opacity: 1;
    }
  </style>
`;

// Inject notification styles
document.head.insertAdjacentHTML('beforeend', notificationStyles);

// ============================= CONFIGURATION =============================
const CONFIG = {
  API_URL: "http://localhost:8081/api/expenses",
  AI_API_URL: "http://localhost:8081/api/expenses/ai", // AI endpoints
  DATE_FORMAT: 'YYYY-MM-DD',
  CURRENCY_SYMBOL: '₹',
  DEFAULT_SORT: {
    field: 'date',
    order: 'desc'
  }
};

// ============================= STATE MANAGEMENT =============================
class AppState {
  constructor() {
    this.editingExpenseId = null;
    this.currentExpenses = [];
    this.sortField = CONFIG.DEFAULT_SORT.field;
    this.sortOrder = CONFIG.DEFAULT_SORT.order;
    this.isLoading = false;
  }

  setEditingExpense(id) {
    this.editingExpenseId = id;
  }

  clearEditingExpense() {
    this.editingExpenseId = null;
  }

  setExpenses(expenses) {
    this.currentExpenses = expenses;
  }

  setSorting(field, order) {
    this.sortField = field;
    this.sortOrder = order;
  }

  setLoading(status) {
    this.isLoading = status;
    this.updateLoadingUI();
  }

  updateLoadingUI() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = this.isLoading ? 'block' : 'none';
    }
  }
}

// Initialize global state
const appState = new AppState();

// ============================= INITIALIZATION =============================
/**
 * Application initialization when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeAppWithAI();
});

/**
 * Initialize the application
 */
async function initializeApp() {
  try {
    setTodayDate();
    setupEventListeners();
    await loadExpenses();
    await loadStats();
    console.log('âœ… Expense Tracker initialized successfully');
  } catch (error) {
    console.error('âŒ Failed to initialize app:', error);
    showNotification('Failed to initialize application', 'error');
  }
}

/**
 * Enhanced initialization with AI features
 */
async function initializeAppWithAI() {
  try {
    setTodayDate();
    setupEventListeners();
    await loadExpenses();
    await loadStats();
    
    // Load AI insights if the element exists
    if (document.getElementById('ai-insights-card')) {
      console.log('🤖 Loading AI insights...');
      await loadAIInsights();
    }
    
    console.log('✅ Expense Tracker with AI features initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize app with AI:', error);
    showNotification('Failed to initialize application', 'error');
  }
}

// ============================= EVENT LISTENERS =============================
/**
 * Set today's date as default in date input
 */
function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.value = today;
  }
}

/**
 * Setup all event listeners for the application
 */
function setupEventListeners() {
  // Form submissions
  const expenseForm = document.getElementById("expense-form");
  const editForm = document.getElementById("edit-form");
  
  if (expenseForm) {
    expenseForm.addEventListener("submit", handleExpenseSubmit);
  }
  
  if (editForm) {
    editForm.addEventListener("submit", handleEditSubmit);
  }
  
  // Modal interactions
  window.onclick = function(event) {
    const modal = document.getElementById("editModal");
    if (event.target === modal) {
      closeEditModal();
    }
  };

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // AI-powered form assistance
  setupAIFormListeners();
}

/**
 * Setup AI-powered form listeners
 */
function setupAIFormListeners() {
  // Description field - trigger category prediction
  const descriptionField = document.getElementById('description');
  if (descriptionField) {
    descriptionField.addEventListener('input', (e) => {
      debouncedCategoryPrediction(e.target.value);
    });
  }
  
  // Category field - trigger amount suggestion
  const categoryField = document.getElementById('category');
  if (categoryField) {
    categoryField.addEventListener('change', (e) => {
      debouncedAmountSuggestion(e.target.value);
    });
    
    categoryField.addEventListener('blur', (e) => {
      if (e.target.value) {
        debouncedAmountSuggestion(e.target.value);
      }
    });
  }

  // AI Predict button
  const predictBtn = document.getElementById('ai-predict-btn');
  if (predictBtn) {
    predictBtn.addEventListener('click', handleAIPredictClick);
  }

  // AI Insights refresh button
  const insightsBtn = document.getElementById('ai-insights-btn');
  if (insightsBtn) {
    insightsBtn.addEventListener('click', loadAIInsights);
  }
}

/**
 * Handle AI predict button click
 */
async function handleAIPredictClick() {
  const descriptionField = document.getElementById('description');
  const categoryField = document.getElementById('category');
  
  if (!descriptionField || !descriptionField.value.trim()) {
    showNotification('Please enter a description first', 'warning');
    descriptionField?.focus();
    return;
  }

  try {
    // Show loading state
    const predictBtn = document.getElementById('ai-predict-btn');
    predictBtn.textContent = '🤖 Predicting...';
    predictBtn.disabled = true;
    predictBtn.classList.add('loading');

    const prediction = await AIExpenseService.predictCategory(descriptionField.value);
    
    if (categoryField) {
      // Animate the field update
      categoryField.style.transition = 'all 0.3s ease';
      categoryField.style.backgroundColor = '#e8f5e8';
      categoryField.value = prediction;
      
      // Reset field styling after animation
      setTimeout(() => {
        categoryField.style.backgroundColor = '';
      }, 1000);
      
      showNotification(`🎯 AI predicted category: ${prediction}`, 'success');
    }
    
  } catch (error) {
    showNotification('AI prediction failed. Please try again.', 'error');
    console.error('AI Prediction Error:', error);
    
  } finally {
    // Restore button state
    const predictBtn = document.getElementById('ai-predict-btn');
    predictBtn.textContent = '🤖 AI Predict';
    predictBtn.disabled = false;
    predictBtn.classList.remove('loading');
  }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
  // Escape key to close modal
  if (event.key === 'Escape') {
    closeEditModal();
  }
  
  // Ctrl+N for new expense
  if (event.ctrlKey && event.key === 'n') {
    event.preventDefault();
    document.getElementById('category')?.focus();
  }
}

// ============================= API OPERATIONS =============================
/**
 * Generic API request handler with error handling
 */
async function apiRequest(url, options = {}) {
  try {
    appState.setLoading(true);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  } finally {
    appState.setLoading(false);
  }
}

/**
 * Load all expenses from the API
 */
async function loadExpenses() {
  try {
    const expenses = await apiRequest(CONFIG.API_URL);
    appState.setExpenses(expenses);
    renderExpenseList(expenses);
    console.log(`ðŸ“Š Loaded ${expenses.length} expenses`);
  } catch (error) {
    console.error('Failed to load expenses:', error);
    showNotification('Failed to load expenses', 'error');
  }
}

// ============================= FORM HANDLING =============================
/**
 * Handle expense form submission (both add and update)
 */
async function handleExpenseSubmit(e) {
  e.preventDefault();

  const formData = getFormData('expense-form');
  if (!validateExpenseData(formData)) {
    return;
  }

  try {
    if (appState.editingExpenseId) {
      await updateExpense(appState.editingExpenseId, formData);
      showNotification('Expense updated successfully!', 'success');
      cancelEdit();
    } else {
      await createExpense(formData);
      showNotification('Expense added successfully!', 'success');
    }

    await refreshData();
    resetForm('expense-form');
    setTodayDate();
  } catch (error) {
    console.error('Error saving expense:', error);
    showNotification('Error saving expense: ' + error.message, 'error');
  }
}

/**
 * Handle edit modal form submission
 */
async function handleEditSubmit(e) {
  e.preventDefault();

  const formData = getFormData('edit-form');
  if (!validateExpenseData(formData)) {
    return;
  }

  try {
    const id = document.getElementById("edit-id").value;
    await updateExpense(id, formData);
    
    showNotification('Expense updated successfully!', 'success');
    closeEditModal();
    await refreshData();
  } catch (error) {
    console.error('Error updating expense:', error);
    showNotification('Error updating expense: ' + error.message, 'error');
  }
}

/**
 * Extract form data from a form element
 */
function getFormData(formId) {
  const prefix = formId === 'edit-form' ? 'edit-' : '';
  
  return {
    category: document.getElementById(`${prefix}category`).value.trim(),
    amount: parseFloat(document.getElementById(`${prefix}amount`).value),
    description: document.getElementById(`${prefix}description`).value.trim(),
    date: document.getElementById(`${prefix}date`).value,
  };
}

/**
 * Validate expense data
 */
function validateExpenseData(data) {
  if (!data.category) {
    showNotification('Category is required', 'error');
    return false;
  }
  
  if (!data.amount || data.amount <= 0) {
    showNotification('Amount must be greater than 0', 'error');
    return false;
  }
  
  if (!data.date) {
    showNotification('Date is required', 'error');
    return false;
  }
  
  return true;
}

/**
 * Reset form to initial state
 */
function resetForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
  }
}

// ============================= CRUD OPERATIONS =============================
/**
 * Create a new expense
 */
async function createExpense(expenseData) {
  return await apiRequest(CONFIG.API_URL, {
    method: 'POST',
    body: JSON.stringify(expenseData)
  });
}

/**
 * Update an existing expense
 */
async function updateExpense(id, expenseData) {
  return await apiRequest(`${CONFIG.API_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expenseData)
  });
}

/**
 * Delete an expense
 */
async function deleteExpense(id) {
  return await apiRequest(`${CONFIG.API_URL}/${id}`, {
    method: 'DELETE'
  });
}

// ============================= DATA REFRESH =============================
/**
 * Refresh all data (expenses and statistics)
 */
async function refreshData() {
  await Promise.all([
    loadExpenses(),
    loadStats()
  ]);
}

/**
 * Load and calculate statistics
 */
async function loadStats() {
  try {
    const expenses = appState.currentExpenses.length > 0 
      ? appState.currentExpenses 
      : await apiRequest(CONFIG.API_URL);
    
    const stats = calculateStatistics(expenses);
    updateStatisticsUI(stats);
  } catch (error) {
    console.error('Failed to load statistics:', error);
    showNotification('Failed to load statistics', 'error');
  }
}

/**
 * Calculate expense statistics
 */
function calculateStatistics(expenses) {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expenseCount = expenses.length;
  const averageAmount = expenseCount > 0 ? totalAmount / expenseCount : 0;

  return {
    totalAmount,
    expenseCount,
    averageAmount
  };
}

/**
 * Update statistics in the UI
 */
function updateStatisticsUI(stats) {
  const totalElement = document.getElementById('total-amount');
  const countElement = document.getElementById('expense-count');
  const avgElement = document.getElementById('avg-amount');

  if (totalElement) {
    totalElement.textContent = `${CONFIG.CURRENCY_SYMBOL}${stats.totalAmount.toFixed(2)}`;
  }
  
  if (countElement) {
    countElement.textContent = stats.expenseCount;
  }
  
  if (avgElement) {
    avgElement.textContent = `${CONFIG.CURRENCY_SYMBOL}${stats.averageAmount.toFixed(2)}`;
  }
}

// Load all expenses (GET) - Legacy function
async function loadExpenses() {
  showLoading(true);
  try {
    const res = await fetch(CONFIG.API_URL);
    const expenses = await res.json();
    appState.setExpenses(expenses);
    sortAndDisplayExpenses(); // Apply current sorting when loading
  } catch (error) {
    console.error("Error loading expenses:", error);
    showNotification("Error loading expenses. Check if server is running.", 'error');
  } finally {
    showLoading(false);
  }
}

// Show/hide loading indicator
function showLoading(show) {
  document.getElementById("loading").style.display = show ? "block" : "none";
  document.getElementById("expense-list").style.display = show ? "none" : "block";
}

// ============================= UI RENDERING =============================
/**
 * Render the expense list in the UI
 */
function renderExpenseList(expenses) {
  displayExpenses(expenses);
}

/**
 * Refresh all data (expenses and statistics)
 */
async function refreshData() {
  await Promise.all([
    loadExpenses(),
    loadStats()
  ]);
}

// Display expenses in the list
function displayExpenses(expenses) {
  const list = document.getElementById("expense-list");
  list.innerHTML = "";

  if (expenses.length === 0) {
    list.innerHTML = '<li class="no-expenses">No expenses found. Add your first expense above!</li>';
    return;
  }

  expenses.forEach((exp) => {
    const item = document.createElement("li");
    item.className = "expense-item";
    
    const expenseInfo = document.createElement("div");
    expenseInfo.innerHTML = `
      <span class="category-badge">${Utils.sanitizeHTML(exp.category)}</span>
      <span class="amount-highlight">${Utils.formatCurrency(parseFloat(exp.amount))}</span>
      <br>
      <span class="date-text">${Utils.formatDate(exp.date)}</span> - 
      <span>${Utils.sanitizeHTML(exp.description || 'No description')}</span>
    `;
    
    const buttonContainer = document.createElement("div");
    
    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => openEditModal(exp);
    
    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = () => deleteExpense(exp.id);

    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(delBtn);
    
    item.appendChild(expenseInfo);
    item.appendChild(buttonContainer);
    list.appendChild(item);
  });
}

// Load statistics (GET total, count)
async function loadStats() {
  try {
    const [totalRes, countRes] = await Promise.all([
      fetch(`${CONFIG.API_URL}/total`),
      fetch(`${CONFIG.API_URL}/count`)
    ]);
    
    const total = await totalRes.json();
    const count = await countRes.json();
    const average = count > 0 ? total / count : 0;

    document.getElementById("total-amount").textContent = Utils.formatCurrency(total);
    document.getElementById("expense-count").textContent = count;
    document.getElementById("avg-amount").textContent = Utils.formatCurrency(average);
  } catch (error) {
    console.error("Error loading stats:", error);
    showNotification('Failed to load statistics', 'error');
  }
}

// Delete expense (DELETE)
async function deleteExpense(id) {
  if (confirm("Are you sure you want to delete this expense?")) {
    try {
      await fetch(`${CONFIG.API_URL}/${id}`, { method: "DELETE" });
      showNotification("Expense deleted successfully!", 'success');
      await refreshData();
    } catch (error) {
      ErrorHandler.handle(error, 'Delete Expense');
    }
  }
}

// Search by category (GET /category/{category})
async function searchByCategory() {
  const category = document.getElementById("search-category").value.trim();
  if (!category) {
    showNotification("Please enter a category to search", 'warning');
    return;
  }

  showLoading(true);
  try {
    const res = await fetch(`${CONFIG.API_URL}/category/${encodeURIComponent(category)}`);
    const expenses = await res.json();
    appState.setExpenses(expenses);
    renderExpenseList(expenses);
    showNotification(`Found ${expenses.length} expenses in category "${category}"`, 'info');
  } catch (error) {
    ErrorHandler.handle(error, 'Search by Category');
  } finally {
    showLoading(false);
  }
}

// Search by description (client-side filtering)
async function searchByDescription() {
  const searchTerm = document.getElementById("search-description").value.trim().toLowerCase();
  if (!searchTerm) {
    showNotification("Please enter a description to search", 'warning');
    return;
  }

  showLoading(true);
  try {
    const res = await fetch(CONFIG.API_URL);
    const expenses = await res.json();
    const filtered = expenses.filter(exp => 
      exp.description && exp.description.toLowerCase().includes(searchTerm)
    );
    appState.setExpenses(filtered);
    renderExpenseList(filtered);
    showNotification(`Found ${filtered.length} expenses with description "${searchTerm}"`, 'info');
  } catch (error) {
    ErrorHandler.handle(error, 'Search by Description');
  } finally {
    showLoading(false);
  }
}

// Sort and display expenses
function sortAndDisplayExpenses() {
  const sorted = [...appState.currentExpenses].sort((a, b) => {
    let aVal = a[appState.sortField];
    let bVal = b[appState.sortField];
    
    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return appState.sortOrder === 'asc' ? 1 : -1;
    if (bVal == null) return appState.sortOrder === 'asc' ? -1 : 1;
    
    if (appState.sortField === 'amount') {
      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
    } else if (appState.sortField === 'date') {
      // Improved date parsing with fallback
      aVal = new Date(aVal);
      bVal = new Date(bVal);
      
      // Handle invalid dates
      if (isNaN(aVal.getTime()) && isNaN(bVal.getTime())) return 0;
      if (isNaN(aVal.getTime())) return appState.sortOrder === 'asc' ? 1 : -1;
      if (isNaN(bVal.getTime())) return appState.sortOrder === 'asc' ? -1 : 1;
    } else {
      // String comparison for category and description
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }
    
    if (aVal < bVal) return appState.sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return appState.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  renderExpenseList(sorted);
  updateSortButtons();
}

// Sort expenses by field
function sortExpenses(field) {
  appState.setSorting(field, appState.sortOrder);
  sortAndDisplayExpenses();
}

// Toggle sort order
function toggleSortOrder() {
  const newOrder = appState.sortOrder === 'asc' ? 'desc' : 'asc';
  appState.setSorting(appState.sortField, newOrder);
  sortAndDisplayExpenses();
}

// Update sort button states
function updateSortButtons() {
  // Reset all sort buttons
  document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
  
  // Activate current sort field button
  const sortButton = document.getElementById(`sort-${appState.sortField}`);
  if (sortButton) {
    sortButton.classList.add('active');
  }
  
  // Update sort order button
  const orderButton = document.getElementById('sort-order');
  if (orderButton) {
    orderButton.textContent = appState.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc';
    orderButton.classList.add('active');
  }
}

// Quick expense functions
async function addQuickExpense(category, amount) {
  const expense = {
    category: category,
    amount: amount,
    description: `Quick ${category} expense`,
    date: new Date().toISOString().split('T')[0]
  };

  try {
    await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });
    
    await refreshData();
    showNotification(`Quick ${category} expense of ${Utils.formatCurrency(amount)} added!`, 'success');
  } catch (error) {
    ErrorHandler.handle(error, 'Add Quick Expense');
  }
}

// Clear all data
async function clearAllData() {
  if (confirm("Are you sure you want to delete ALL expenses? This action cannot be undone!")) {
    try {
      // Get all expenses first
      const res = await fetch(CONFIG.API_URL);
      const expenses = await res.json();
      
      // Delete each expense
      const deletePromises = expenses.map(exp => 
        fetch(`${CONFIG.API_URL}/${exp.id}`, { method: "DELETE" })
      );
      
      await Promise.all(deletePromises);
      
      await refreshData();
      showNotification("All expenses have been deleted!", 'success');
    } catch (error) {
      ErrorHandler.handle(error, 'Clear All Data');
    }
  }
}

// Open edit modal
function openEditModal(expense) {
  document.getElementById("edit-id").value = expense.id;
  document.getElementById("edit-category").value = expense.category;
  document.getElementById("edit-amount").value = expense.amount;
  document.getElementById("edit-description").value = expense.description || '';
  document.getElementById("edit-date").value = expense.date;
  document.getElementById("editModal").style.display = "block";
}

// Close edit modal
function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
  document.getElementById("edit-form").reset();
}

// Cancel edit in main form
function cancelEdit() {
  appState.clearEditingExpense();
  document.getElementById("form-title").textContent = "Add Expense";
  document.getElementById("submit-btn").textContent = "Add Expense";
  const cancelBtn = document.getElementById("cancel-btn");
  if (cancelBtn) {
    cancelBtn.style.display = "none";
  }
  document.getElementById("expense-form").reset();
  setTodayDate();
}

// ============================= LEGACY COMPATIBILITY =============================
/**
 * Legacy notification function for backward compatibility
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
  NotificationSystem.show(message, type);
}

// Enhanced loading state management
function showLoading(show) {
  appState.setLoading(show);
}

// ============================= AI SERVICE =============================
/**
 * AI-powered expense management service
 */
class AIExpenseService {
  /**
   * Get predicted category for a description
   */
  static async predictCategory(description) {
    try {
      const response = await fetch(`${CONFIG.AI_API_URL}/predict-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.predictedCategory;
    } catch (error) {
      console.error('AI Category Prediction failed:', error);
      throw error;
    }
  }

  /**
   * Get suggested amount for a category
   */
  static async suggestAmount(category) {
    try {
      const response = await fetch(`${CONFIG.AI_API_URL}/suggest-amount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.suggestedAmount;
    } catch (error) {
      console.error('AI Amount Suggestion failed:', error);
      throw error;
    }
  }

  /**
   * Get AI-powered spending insights
   */
  static async getSpendingInsights() {
    try {
      const response = await fetch(`${CONFIG.AI_API_URL}/insights`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const insights = await response.json();
      return insights;
    } catch (error) {
      console.error('AI Insights failed:', error);
      throw error;
    }
  }
}

// ============================= AI UI HANDLERS =============================
/**
 * Debounced category prediction handler
 */
const debouncedCategoryPrediction = Utils.debounce(async function(description) {
  if (!description || description.length < 3) return;

  try {
    const predictedCategory = await AIExpenseService.predictCategory(description);
    
    // Update category field if it's empty
    const categoryField = document.getElementById('category');
    if (categoryField && !categoryField.value) {
      categoryField.value = predictedCategory;
      
      // Show prediction feedback
      showAIPredictionFeedback('category', predictedCategory);
    }
  } catch (error) {
    console.warn('Category prediction failed:', error.message);
  }
}, 500);

/**
 * Debounced amount suggestion handler
 */
const debouncedAmountSuggestion = Utils.debounce(async function(category) {
  if (!category) return;

  try {
    const suggestedAmount = await AIExpenseService.suggestAmount(category);
    
    // Update amount field if it's empty
    const amountField = document.getElementById('amount');
    if (amountField && !amountField.value) {
      amountField.value = suggestedAmount;
      
      // Show suggestion feedback
      showAIPredictionFeedback('amount', Utils.formatCurrency(suggestedAmount));
    }
  } catch (error) {
    console.warn('Amount suggestion failed:', error.message);
  }
}, 500);

/**
 * Show AI prediction feedback to user
 */
function showAIPredictionFeedback(fieldType, prediction) {
  // Remove existing feedback
  const existingFeedback = document.querySelector('.ai-prediction-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }

  // Create feedback element
  const feedback = document.createElement('div');
  feedback.className = 'ai-prediction-feedback';
  feedback.innerHTML = `
    <div class="ai-prediction-content">
      <span class="ai-icon">🤖</span>
      <span class="ai-text">AI suggested: ${prediction}</span>
      <button class="ai-dismiss" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  // Add styles
  Object.assign(feedback.style, {
    position: 'fixed',
    top: '70px',
    right: '20px',
    backgroundColor: '#e3f2fd',
    border: '1px solid #2196f3',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    color: '#1976d2',
    zIndex: '9998',
    animation: 'slideInRight 0.3s ease-out'
  });

  // Add to DOM
  document.body.appendChild(feedback);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (feedback.parentElement) {
      feedback.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => feedback.remove(), 300);
    }
  }, 3000);
}

/**
 * Load and display AI insights
 */
async function loadAIInsights() {
  try {
    const insightCard = document.getElementById('ai-insights-card');
    if (!insightCard) return;

    // Show loading state
    insightCard.innerHTML = `
      <div class="ai-loading">
        <span class="ai-spinner"></span>
        <span>Generating insights...</span>
      </div>
    `;

    const insights = await AIExpenseService.getSpendingInsights();
    
    // Update insights display
    updateAIInsightsUI(insights);
    
    console.log('✅ AI Insights loaded successfully');
  } catch (error) {
    console.error('Failed to load AI insights:', error);
    
    const insightCard = document.getElementById('ai-insights-card');
    if (insightCard) {
      insightCard.innerHTML = `
        <div class="ai-error">
          <span>❌</span>
          <span>Failed to load insights</span>
          <button onclick="loadAIInsights()" class="retry-btn">Retry</button>
        </div>
      `;
    }
  }
}

/**
 * Update AI insights in the UI
 */
function updateAIInsightsUI(insights) {
  const insightCard = document.getElementById('ai-insights-card');
  if (!insightCard) return;

  insightCard.innerHTML = `
    <h3>💡 AI Spending Insights</h3>
    <div class="insights-list">
      ${insights.map(insight => `
        <div class="insight-item">
          <span class="insight-icon">${getInsightIcon(insight)}</span>
          <span class="insight-text">${insight}</span>
        </div>
      `).join('')}
    </div>
    <div class="insights-footer">
      <button onclick="loadAIInsights()" class="refresh-insights-btn">🔄 Refresh</button>
    </div>
  `;
}

/**
 * Get appropriate icon for insight type
 */
function getInsightIcon(insight) {
  if (insight.toLowerCase().includes('highest')) return '📈';
  if (insight.toLowerCase().includes('lowest')) return '📉';
  if (insight.toLowerCase().includes('average')) return '📊';
  if (insight.toLowerCase().includes('total')) return '💰';
  if (insight.toLowerCase().includes('frequent')) return '🔄';
  return '💡';
}

// ============================= AI INTEGRATION ENHANCEMENTS =============================
/**
 * Smart form completion using AI
 */
async function smartCompleteForm() {
  const descriptionField = document.getElementById('description');
  const categoryField = document.getElementById('category');
  const amountField = document.getElementById('amount');
  
  if (!descriptionField?.value) {
    showNotification('Please enter a description first', 'warning');
    return;
  }

  try {
    showNotification('🤖 AI is analyzing your expense...', 'info');
    
    // Get AI predictions
    const [predictedCategory, suggestedAmount] = await Promise.all([
      AIExpenseService.predictCategory(descriptionField.value),
      categoryField?.value ? AIExpenseService.suggestAmount(categoryField.value) : null
    ]);
    
    // Apply predictions with animations
    if (categoryField && !categoryField.value) {
      categoryField.style.transition = 'background-color 0.3s ease';
      categoryField.style.backgroundColor = '#e8f5e8';
      categoryField.value = predictedCategory;
      setTimeout(() => categoryField.style.backgroundColor = '', 1000);
    }
    
    if (amountField && !amountField.value && suggestedAmount) {
      amountField.style.transition = 'background-color 0.3s ease';
      amountField.style.backgroundColor = '#e8f5e8';
      amountField.value = suggestedAmount;
      setTimeout(() => amountField.style.backgroundColor = '', 1000);
    }
    
    showNotification('✅ Form completed using AI suggestions!', 'success');
    
  } catch (error) {
    console.error('Smart form completion failed:', error);
    showNotification('AI assistance temporarily unavailable', 'warning');
  }
}

/**
 * AI-powered expense analysis
 */
async function analyzeExpensePattern() {
  try {
    const insights = await AIExpenseService.getSpendingInsights();
    
    // Create analysis modal
    const modal = document.createElement('div');
    modal.className = 'ai-analysis-modal';
    modal.innerHTML = `
      <div class="ai-analysis-content">
        <div class="ai-analysis-header">
          <h2>🤖 AI Expense Analysis</h2>
          <button onclick="this.closest('.ai-analysis-modal').remove()" class="close-btn">×</button>
        </div>
        <div class="ai-analysis-body">
          ${insights.map(insight => `
            <div class="analysis-insight">
              <span class="insight-icon">${getInsightIcon(insight)}</span>
              <span class="insight-text">${insight}</span>
            </div>
          `).join('')}
        </div>
        <div class="ai-analysis-footer">
          <button onclick="loadAIInsights()" class="refresh-btn">🔄 Refresh Analysis</button>
          <button onclick="this.closest('.ai-analysis-modal').remove()" class="close-btn">Close</button>
        </div>
      </div>
    `;
    
    // Add modal styles
    Object.assign(modal.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '10000'
    });
    
    document.body.appendChild(modal);
    
  } catch (error) {
    console.error('Expense analysis failed:', error);
    showNotification('Failed to analyze expenses', 'error');
  }
}

// ============================= FORM INPUT HANDLERS =============================
/**
 * Handle description input change for AI prediction
 */
function onDescriptionChange() {
  const descriptionField = document.getElementById('description');
  if (descriptionField && descriptionField.value.length >= 3) {
    debouncedCategoryPrediction(descriptionField.value);
  }
}

/**
 * Handle category change for amount suggestion
 */
function onCategoryChange() {
  const categoryField = document.getElementById('category');
  if (categoryField && categoryField.value) {
    debouncedAmountSuggestion(categoryField.value);
  }
}

/**
 * Refresh AI insights manually
 */
async function refreshAIInsights() {
  await loadAIInsights();
}

/**
 * Apply AI suggestion from prediction card
 */
function applyAISuggestion() {
  // This function can be used if you have an AI suggestion card
  console.log('Applying AI suggestion...');
}


