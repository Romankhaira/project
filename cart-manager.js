// Cart Management System - UPDATED WITH COLOR SUPPORT

class CartManager {
    constructor() {
        this.cartKey = 'peintureLandCart';
        this.cart = this.loadCart();
        this.initEventListeners();
    }
    
    // Initialize event listeners
    initEventListeners() {
        // Delegate add-to-cart clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') || 
                e.target.closest('.add-to-cart')) {
                e.preventDefault();
                this.handleAddToCart(e);
            }
        });
    }
    
    // Handle add to cart button click
    handleAddToCart(e) {
        const button = e.target.classList.contains('add-to-cart') ? 
            e.target : e.target.closest('.add-to-cart');
        
        const productId = button.dataset.productId;
        const productName = button.dataset.productName;
        const productDescription = button.dataset.productDescription;
        const productImage = button.dataset.productImage;
        const brandId = button.dataset.brandId;
        
        const product = {
            id: productId,
            name: productName,
            description: productDescription,
            image_url: productImage,
            brand_id: brandId
        };
        
        this.addItem(product);
    }
    
    // Load cart from localStorage with error handling and migration
    loadCart() {
        try {
            const cartData = localStorage.getItem(this.cartKey);
            if (!cartData) return [];
            
            const cart = JSON.parse(cartData);
            
            // MIGRATION: Convert old cart items to new format
            const migratedCart = cart.map(item => {
                // If item already has key, it's in new format
                if (item.key) return item;
                
                // Convert old format to new format
                // Note: old items had shade as a string, not an object
                let shadeObj = null;
                if (item.shade) {
                    // Try to parse shade string to extract code and name
                    const shadeParts = item.shade.split(' - ');
                    shadeObj = {
                        id: 'migrated_' + Date.now() + Math.random(),
                        code: shadeParts[0] || '',
                        name: shadeParts[1] || '',
                        hex: null
                    };
                }
                
                return {
                    key: shadeObj ? `${item.id}_${shadeObj.id}` : `${item.id}_no-shade`,
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    image_url: item.image_url,
                    brand_id: item.brand_id,
                    shade: shadeObj,
                    quantity: item.quantity || 1
                };
            });
            
            // Save migrated cart back
            if (cart.length > 0 && !cart[0].key) {
                localStorage.setItem(this.cartKey, JSON.stringify(migratedCart));
                console.log('Cart migrated to new format:', migratedCart.length, 'items');
            }
            
            return migratedCart;
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }
    
    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
            this.updateCartCount();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }
    
    // Update cart count in UI
    updateCartCount() {
        const cartCount = this.getTotalItems();
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        cartCountElements.forEach(element => {
            element.textContent = cartCount;
            
            // Animate cart count update
            element.classList.add('animate-pulse');
            setTimeout(() => {
                element.classList.remove('animate-pulse');
            }, 300);
        });
    }
    
    // Add item to cart
    addItem(product, quantity = 1) {
        // Create unique key: product ID + shade ID (or 'no-shade')
        const shadeId = product.shade ? product.shade.id : 'no-shade';
        const itemKey = `${product.id}_${shadeId}`;
        
        // Find existing item by KEY (not just ID)
        const existingItem = this.cart.find(item => item.key === itemKey);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                key: itemKey,           // NEW: Unique identifier
                id: product.id,
                name: product.name,
                description: product.description,
                image_url: product.image_url,
                brand_id: product.brand_id,
                shade: product.shade,   // Store full color info
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.showNotification(`${product.name} added to cart`);
    }
    
    // Remove item from cart
    removeItem(itemKey) {
        this.cart = this.cart.filter(item => item.key !== itemKey);
        this.saveCart();
    }
    
    // Update item quantity
    updateQuantity(itemKey, quantity) {
        const item = this.cart.find(item => item.key === itemKey);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemKey);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }
    
    // Clear entire cart
    clearCart() {
        this.cart = [];
        this.saveCart();
    }
    
    // Get cart items
    getCartItems() {
        return [...this.cart];
    }
    
    // Get total items count
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }
    
    // Show notification
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            font-weight: 600;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Add global helper function
window.updateCartCountGlobal = function() {
    if (window.cartManager) {
        window.cartManager.updateCartCount();
    } else {
        const cart = JSON.parse(localStorage.getItem('peintureLandCart')) || [];
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = cartCount;
        });
    }
};

// Update cart-manager.js - Add auto-initialization
window.initializeCartManager = function() {
    if (!window.cartManager) {
        window.cartManager = new CartManager();
        console.log('Cart manager initialized');
    }
};

// Initialize automatically
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.initializeCartManager();
    });
} else {
    window.initializeCartManager();
}