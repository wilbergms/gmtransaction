// Bill and Coin Counter JavaScript

class BillCoinCounter {
    constructor() {
        this.denominations = {
            '1': { value: 1, type: 'coin', currentCount: 0, totalCount: 0 },
            '5': { value: 5, type: 'coin', currentCount: 0, totalCount: 0 },
            '10': { value: 10, type: 'coin', currentCount: 0, totalCount: 0 },
            '20-coin': { value: 20, type: 'coin', currentCount: 0, totalCount: 0 },
            '20-bill': { value: 20, type: 'bill', currentCount: 0, totalCount: 0 },
            '50': { value: 50, type: 'bill', currentCount: 0, totalCount: 0 },
            '100': { value: 100, type: 'bill', currentCount: 0, totalCount: 0 },
            '200': { value: 200, type: 'bill', currentCount: 0, totalCount: 0 },
            '500': { value: 500, type: 'bill', currentCount: 0, totalCount: 0 },
            '1000': { value: 1000, type: 'bill', currentCount: 0, totalCount: 0 }
        };
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.updateAllDisplays();
    }

    // Load data from localStorage
    loadFromStorage() {
        const savedData = localStorage.getItem('billCoinCounterData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(this.denominations).forEach(key => {
                    if (data[key]) {
                        this.denominations[key].totalCount = data[key].totalCount || 0;
                        this.denominations[key].currentCount = data[key].currentCount || 0;
                    }
                });
            } catch (error) {
                console.error('Error loading data from storage:', error);
            }
        }
    }

    // Save data to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('billCoinCounterData', JSON.stringify(this.denominations));
        } catch (error) {
            console.error('Error saving data to storage:', error);
        }
    }

    // Bind event listeners
    bindEvents() {
        // Increment buttons
        document.querySelectorAll('.btn-increment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const denomination = e.target.closest('.btn-increment').dataset.denomination;
                this.incrementCount(denomination);
            });
        });

        // Decrement buttons
        document.querySelectorAll('.btn-decrement').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const denomination = e.target.closest('.btn-decrement').dataset.denomination;
                this.decrementCount(denomination);
            });
        });

        // Input field changes
        document.querySelectorAll('.count-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const denomination = e.target.id.replace('count-', '');
                const value = parseInt(e.target.value) || 0;
                this.setCurrentCount(denomination, value);
            });

            // Allow negative values for subtraction
            input.addEventListener('keydown', (e) => {
                if (e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                }
            });
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveCounts();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.showClearConfirmation();
        });

        // Modal buttons
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideClearConfirmation();
        });

        document.getElementById('confirmBtn').addEventListener('click', () => {
            this.clearAll();
            this.hideClearConfirmation();
        });

        // Close modal on background click
        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') {
                this.hideClearConfirmation();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    this.saveCounts();
                }
            }
            if (e.key === 'Escape') {
                this.hideClearConfirmation();
            }
        });
    }

    // Increment count for a denomination
    incrementCount(denomination) {
        if (this.denominations[denomination]) {
            this.denominations[denomination].currentCount++;
            this.updateCurrentCountDisplay(denomination);
            this.updateGrandTotal();
            this.addButtonFeedback(event.target);
        }
    }

    // Decrement count for a denomination
    decrementCount(denomination) {
        if (this.denominations[denomination]) {
            this.denominations[denomination].currentCount--;
            this.updateCurrentCountDisplay(denomination);
            this.updateGrandTotal();
            this.addButtonFeedback(event.target);
        }
    }

    // Set current count for a denomination
    setCurrentCount(denomination, count) {
        if (this.denominations[denomination]) {
            this.denominations[denomination].currentCount = count;
            this.updateCurrentCountDisplay(denomination);
            this.updateGrandTotal();
        }
    }

    // Update current count display
    updateCurrentCountDisplay(denomination) {
        const input = document.getElementById(`count-${denomination}`);
        if (input) {
            input.value = this.denominations[denomination].currentCount;
        }
    }

    // Update denomination total display
    updateDenominationTotal(denomination) {
        const totalElement = document.getElementById(`total-${denomination}`);
        if (totalElement) {
            const total = this.denominations[denomination].totalCount * this.denominations[denomination].value;
            totalElement.textContent = `₱${total.toLocaleString()}`;
        }
    }

    // Update grand total display
    updateGrandTotal() {
        let grandTotal = 0;
        
        // Add current counts
        Object.values(this.denominations).forEach(denom => {
            grandTotal += (denom.currentCount * denom.value);
        });
        
        // Add saved totals
        Object.values(this.denominations).forEach(denom => {
            grandTotal += (denom.totalCount * denom.value);
        });

        document.getElementById('grandTotal').textContent = `₱${grandTotal.toLocaleString()}`;
    }

    // Update all displays
    updateAllDisplays() {
        Object.keys(this.denominations).forEach(denomination => {
            this.updateCurrentCountDisplay(denomination);
            this.updateDenominationTotal(denomination);
        });
        this.updateGrandTotal();
    }

    // Save current counts to totals
    saveCounts() {
        let hasChanges = false;
        
        Object.keys(this.denominations).forEach(denomination => {
            if (this.denominations[denomination].currentCount !== 0) {
                this.denominations[denomination].totalCount += this.denominations[denomination].currentCount;
                this.denominations[denomination].currentCount = 0;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            this.saveToStorage();
            this.updateAllDisplays();
            this.showSaveSuccess();
        } else {
            this.showNoChangesMessage();
        }
    }

    // Clear all data
    clearAll() {
        Object.keys(this.denominations).forEach(denomination => {
            this.denominations[denomination].currentCount = 0;
            this.denominations[denomination].totalCount = 0;
        });
        
        this.saveToStorage();
        this.updateAllDisplays();
        this.showClearSuccess();
    }

    // Show clear confirmation modal
    showClearConfirmation() {
        document.getElementById('confirmModal').classList.add('show');
    }

    // Hide clear confirmation modal
    hideClearConfirmation() {
        document.getElementById('confirmModal').classList.remove('show');
    }

    // Add visual feedback for button presses
    addButtonFeedback(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    // Show save success message
    showSaveSuccess() {
        this.showToast('Counts saved successfully!', 'success');
    }

    // Show clear success message
    showClearSuccess() {
        this.showToast('All data cleared successfully!', 'success');
    }

    // Show no changes message
    showNoChangesMessage() {
        this.showToast('No changes to save', 'info');
    }

    // Show toast notification
    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast styles
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        switch (type) {
            case 'success':
                toast.style.background = '#10b981';
                break;
            case 'error':
                toast.style.background = '#ef4444';
                break;
            case 'info':
            default:
                toast.style.background = '#2563eb';
                break;
        }

        // Add to document
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Format currency
    formatCurrency(amount) {
        return `₱${amount.toLocaleString()}`;
    }

    // Get total value
    getTotalValue() {
        let total = 0;
        Object.values(this.denominations).forEach(denom => {
            total += ((denom.currentCount + denom.totalCount) * denom.value);
        });
        return total;
    }

    // Export data
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            denominations: this.denominations,
            totalValue: this.getTotalValue()
        };
        return JSON.stringify(data, null, 2);
    }

    // Import data
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.denominations) {
                Object.keys(this.denominations).forEach(key => {
                    if (data.denominations[key]) {
                        this.denominations[key] = { ...this.denominations[key], ...data.denominations[key] };
                    }
                });
                this.saveToStorage();
                this.updateAllDisplays();
                this.showToast('Data imported successfully!', 'success');
                return true;
            }
        } catch (error) {
            this.showToast('Error importing data', 'error');
            return false;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.billCoinCounter = new BillCoinCounter();
});

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

