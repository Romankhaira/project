// js/main.js
// Shared utilities and event listeners

class AppState {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
    }
}

// Initialize app state
const appState = new AppState();

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Clear any test/placeholder data from localStorage on first load
    if (!localStorage.getItem('cart_initialized')) {
        localStorage.removeItem('cart');
        localStorage.setItem('cart_initialized', 'true');
    }

    // Initialize app state
    const appState = new AppState();
    window.appState = appState;

    // Add loading states to grids
    const brandsGrid = document.getElementById('brands-grid');
    const materialsGrid = document.getElementById('materials-grid');
    
    if (brandsGrid) brandsGrid.classList.add('loading');
    if (materialsGrid) materialsGrid.classList.add('loading');
    
    // Remove loading states after a timeout (safety)
    setTimeout(() => {
        if (brandsGrid) brandsGrid.classList.remove('loading');
        if (materialsGrid) materialsGrid.classList.remove('loading');
    }, 3000);
    
    // Cart icon click handler
    const cartIcon = document.querySelector('.cart-icon-container');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.querySelector('.close-cart');

    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartModal.classList.contains('active')) {
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});



// Add a function to remove loading states
window.removeLoadingStates = () => {
    const brandsGrid = document.getElementById('brands-grid');
    const materialsGrid = document.getElementById('materials-grid');
    
    if (brandsGrid) brandsGrid.classList.remove('loading');
    if (materialsGrid) materialsGrid.classList.remove('loading');
};

// Export app state for use in other files
window.appState = appState;