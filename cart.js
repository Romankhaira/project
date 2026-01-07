// Cart Management System
class CartManager {
  constructor() {
    this.cart = this.loadCart();
    this.init();
  }

  loadCart() {
    return JSON.parse(localStorage.getItem('paint_cart')) || [];
  }

  saveCart() {
    localStorage.setItem('paint_cart', JSON.stringify(this.cart));
  }

  init() {
    // Listen for add to cart events
    document.addEventListener('addToCart', (e) => {
      this.addItem(e.detail);
    });

    // Listen for remove from cart events
    document.addEventListener('removeFromCart', (e) => {
      this.removeItem(e.detail.productId, e.detail.color);
    });

    // Listen for quantity update events
    document.addEventListener('updateQuantity', (e) => {
      this.updateQuantity(e.detail.productId, e.detail.color, e.detail.quantity);
    });
  }

  addItem(product) {
    const { id, name, image_url, selectedColor } = product;
    
    // Check if item already exists in cart
    const existingIndex = this.cart.findIndex(item => 
      item.id === id && item.selectedColor === selectedColor
    );
    
    if (existingIndex > -1) {
      // Update quantity
      this.cart[existingIndex].quantity += 1;
    } else {
      // Add new item
      this.cart.push({
        id,
        name,
        image_url,
        selectedColor,
        quantity: 1,
        addedAt: new Date().toISOString()
      });
    }
    
    this.saveCart();
    this.dispatchCartUpdate();
  }

  removeItem(productId, color) {
    this.cart = this.cart.filter(item => 
      !(item.id === productId && item.selectedColor === color)
    );
    
    this.saveCart();
    this.dispatchCartUpdate();
  }

  updateQuantity(productId, color, quantity) {
    const item = this.cart.find(item => 
      item.id === productId && item.selectedColor === color
    );
    
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId, color);
      } else {
        item.quantity = quantity;
        this.saveCart();
        this.dispatchCartUpdate();
      }
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.dispatchCartUpdate();
  }

  getCartSummary() {
    const items = this.cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      color: item.selectedColor
    }));
    
    const totalQuantity = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      items,
      totalQuantity,
      timestamp: new Date().toLocaleString()
    };
  }

  getWhatsAppMessage(customerInfo = {}) {
    const summary = this.getCartSummary();
    const template = window.SupabaseClient.WHATSAPP_MESSAGE_TEMPLATE;
    
    const orderSummary = summary.items.map(item => 
      `• ${item.name} (${item.color || 'No color selected'}) - Qty: ${item.quantity}`
    ).join('\n');
    
    return template
      .replace('{ORDER_SUMMARY}', orderSummary)
      .replace('{CUSTOMER_NAME}', customerInfo.name || 'Not provided')
      .replace('{CUSTOMER_PHONE}', customerInfo.phone || 'Not provided')
      .replace('{CUSTOMER_ADDRESS}', customerInfo.address || 'Not provided')
      .replace('{CUSTOMER_NOTE}', customerInfo.note || 'None')
      .replace('{TOTAL_QUANTITY}', summary.totalQuantity)
      .replace('{ORDER_DATE}', summary.timestamp);
  }

  dispatchCartUpdate() {
    const event = new CustomEvent('cartUpdate', {
      detail: {
        cart: this.cart,
        totalItems: this.cart.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
    
    document.dispatchEvent(event);
  }
}

// Initialize cart manager
document.addEventListener('DOMContentLoaded', () => {
  window.cartManager = new CartManager();
});