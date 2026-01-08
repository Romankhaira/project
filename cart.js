// js/cart.js - Updated class

class CartSystem {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }

    loadCart() {
        // Load cart from localStorage and remove any placeholder items
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Filter out any placeholder items (items added by testing)
        const filteredCart = cart.filter(item => 
            item.id && 
            item.name && 
            !item.name.includes('[TEST]') && 
            !item.name.includes('Example') &&
            !item.name.includes('Placeholder')
        );
        
        // Save filtered cart back
        if (filteredCart.length !== cart.length) {
            localStorage.setItem('cart', JSON.stringify(filteredCart));
        }
        
        return filteredCart;
    }

    init() {
        // Update cart count
        this.updateCartCount();
        
        // Initialize cart display
        this.updateCartDisplay();
    }

    addToCart(productId, productName, imageUrl, color = null) {
        // Check if this exact product with same color already exists
        const existingItemIndex = this.cart.findIndex(item => 
            item.id === productId && 
            JSON.stringify(item.color) === JSON.stringify(color)
        );
        
        if (existingItemIndex > -1) {
            // Update quantity of existing item
            this.cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item
            this.cart.push({
                id: productId,
                name: productName,
                imageUrl: imageUrl,
                quantity: 1,
                color: color // Store color information
            });
        }

        // Save and update UI
        this.saveCart();
        this.updateCartDisplay();
        
        // Show success animation
        this.showAddToCartAnimation();
    }

    removeFromCart(productId, color = null) {
        this.cart = this.cart.filter(item => 
            !(item.id === productId && JSON.stringify(item.color) === JSON.stringify(color))
        );
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(productId, change, color = null) {
        const itemIndex = this.cart.findIndex(item => 
            item.id === productId && 
            JSON.stringify(item.color) === JSON.stringify(color)
        );
        
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            item.quantity += change;
            
            if (item.quantity <= 0) {
                this.removeFromCart(productId, color);
            } else {
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        const summaryText = document.getElementById('cart-summary-text');
        
        if (cartItemsContainer) {
            if (this.cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                        <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">
                            Continue Shopping
                        </a>
                    </div>
                `;
            } else {
                cartItemsContainer.innerHTML = this.cart.map((item, index) => {
                    // Generate data URL for image placeholder based on product name
                    const placeholderImage = this.generateProductPlaceholder(item.name);
                    
                    // Generate color info HTML if color exists
                    const colorHTML = item.color ? `
                        <div class="cart-item-color">
                            <div class="cart-color-swatch" style="background-color: ${item.color.hex}"></div>
                            <span>${item.color.name}</span>
                        </div>
                    ` : '';
                    
                    return `
                        <div class="cart-item" data-index="${index}">
                            <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image"
                                 onerror="this.src='${placeholderImage}'">
                            <div class="cart-item-info">
                                <div class="cart-item-name">${item.name}</div>
                                ${colorHTML}
                                <div class="cart-item-quantity">
                                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                                    <span class="quantity">${item.quantity}</span>
                                    <button class="quantity-btn increase" data-index="${index}">+</button>
                                </div>
                            </div>
                            <button class="remove-item" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }).join('');

                // Add event listeners for quantity buttons
                cartItemsContainer.querySelectorAll('.decrease').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.target.dataset.index);
                        const item = this.cart[index];
                        this.updateQuantity(item.id, -1, item.color);
                    });
                });

                cartItemsContainer.querySelectorAll('.increase').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.target.dataset.index);
                        const item = this.cart[index];
                        this.updateQuantity(item.id, 1, item.color);
                    });
                });

                cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.target.closest('.remove-item').dataset.index);
                        const item = this.cart[index];
                        this.removeFromCart(item.id, item.color);
                    });
                });
            }
        }

        // Update summary text
        if (summaryText) {
            summaryText.textContent = this.generateCartSummary();
        }
    }

    generateProductPlaceholder(productName) {
        // Create a simple placeholder image with product name initials
        const initials = productName
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
        
        const backgroundColor = '#2A2F36';
        const textColor = '#EAEAEA';
        
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='${encodeURIComponent(backgroundColor)}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='${encodeURIComponent(textColor)}' font-family='Arial' font-size='14'%3E${encodeURIComponent(initials)}%3C/text%3E%3C/svg%3E`;
    }

    generateCartSummary() {
        if (this.cart.length === 0) return 'Cart is empty';

        let summary = '🛒 CART SUMMARY\n\n';
        this.cart.forEach((item, index) => {
            summary += `Item ${index + 1}:\n`;
            summary += `• Product: ${item.name}\n`;
            summary += `• Quantity: ${item.quantity}\n`;
            if (item.color) {
                summary += `• Color: ${item.color.name} (${item.color.code})\n`;
                summary += `• Color Code: ${item.color.hex}\n`;
            }
            summary += '\n';
        });
        
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        summary += `━━━━━━━━━━━━━━━━━━━━\n`;
        summary += `Total Items: ${totalItems}\n`;
        summary += `\nThank you for your order!`;
        
        return summary;
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
        window.appState.cart = this.cart; // Update global app state
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }

    // Rest of the methods remain the same...
    copyCartSummary() {
        const summary = this.generateCartSummary();
        navigator.clipboard.writeText(summary).then(() => {
            this.showNotification('Cart summary copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    generateWhatsAppMessage() {
        const summary = this.generateCartSummary();
        const phoneNumber = '+33695225960'; // Replace with actual number
        const encodedMessage = encodeURIComponent(summary + '\n\nI want to order these products.');
        return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    }

    showAddToCartAnimation() {
        // Create floating animation
        const cartIcon = document.querySelector('.cart-icon-container');
        if (!cartIcon) return;

        const animation = document.createElement('div');
        animation.innerHTML = '<i class="fas fa-check"></i>';
        animation.style.cssText = `
            position: fixed;
            background: var(--success);
            color: var(--bg-primary);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            z-index: 10000;
            pointer-events: none;
        `;

        // Get click position or use center
        const rect = cartIcon.getBoundingClientRect();
        animation.style.left = rect.left + rect.width / 2 - 20 + 'px';
        animation.style.top = rect.top + rect.height / 2 - 20 + 'px';

        document.body.appendChild(animation);

        // Animate to cart icon
        gsap.to(animation, {
            x: 0,
            y: 0,
            scale: 1.2,
            duration: 0.5,
            ease: 'back.out(1.7)',
            onComplete: () => {
                gsap.to(animation, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                    delay: 0.2,
                    onComplete: () => animation.remove()
                });
            }
        });
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInUp 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutDown 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing placeholder data from localStorage
    const cleanup = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cleanCart = cart.filter(item => 
            item.id && 
            item.name && 
            !item.name.includes('[TEST]') && 
            !item.name.includes('Example') &&
            !item.name.includes('Placeholder') &&
            !item.name.includes('Sample')
        );
        
        if (cleanCart.length !== cart.length) {
            localStorage.setItem('cart', JSON.stringify(cleanCart));
        }
    };
    
    // Run cleanup
    cleanup();
    
    // Initialize cart system
    const cartSystem = new CartSystem();
    window.cartSystem = cartSystem;

    // Copy cart button
    const copyCartBtn = document.getElementById('copy-cart');
    if (copyCartBtn) {
        copyCartBtn.addEventListener('click', () => {
            cartSystem.copyCartSummary();
        });
    }

    // WhatsApp order button
    const whatsappBtn = document.getElementById('whatsapp-order');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            if (cartSystem.cart.length === 0) {
                cartSystem.showNotification('Your cart is empty!');
                return;
            }
            const url = cartSystem.generateWhatsAppMessage();
            window.open(url, '_blank');
        });
    }
});