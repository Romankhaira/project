// logo-loader.js - Animated Logo Loading Effect

class LogoLoader {
    constructor() {
        this.logo = document.querySelector('.logo');
        if (this.logo) {
            this.init();
        }
    }
    
    init() {
        // Add animation class to logo
        this.logo.classList.add('animate-float', 'animate-pulse-slow');
        
        // Make logo rotate on hover
        this.logo.addEventListener('mouseenter', () => {
            this.logo.style.transition = 'transform 0.5s ease';
            this.logo.style.transform = 'rotate(15deg) scale(1.1)';
        });
        
        this.logo.addEventListener('mouseleave', () => {
            this.logo.style.transform = 'rotate(0deg) scale(1)';
        });
        
        // Add paint drip effect to logo on click
        this.logo.addEventListener('click', (e) => {
            e.preventDefault();
            this.createPaintDrip();
        });
        
        // Make logo bounce on page load
        setTimeout(() => {
            this.logo.classList.add('animate-bounce');
            setTimeout(() => {
                this.logo.classList.remove('animate-bounce');
            }, 2000);
        }, 1000);
    }
    
    createPaintDrip() {
        const colors = ['#4facfe', '#00f2fe', '#f093fb', '#f5576c', '#667eea', '#764ba2'];
        
        for (let i = 0; i < 5; i++) {
            const drip = document.createElement('div');
            drip.style.position = 'absolute';
            drip.style.width = '20px';
            drip.style.height = '40px';
            drip.style.background = colors[Math.floor(Math.random() * colors.length)];
            drip.style.borderRadius = '10px 10px 0 0';
            drip.style.top = '50px';
            drip.style.left = `${50 + Math.random() * 100 - 50}px`;
            drip.style.transformOrigin = 'top center';
            drip.style.zIndex = '1000';
            
            document.body.appendChild(drip);
            
            // Animate drip
            drip.animate([
                { transform: 'scaleY(0)', opacity: 1 },
                { transform: 'scaleY(1)', opacity: 1 },
                { transform: 'scaleY(1) translateY(100px)', opacity: 0 }
            ], {
                duration: 1000,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
            });
            
            // Remove after animation
            setTimeout(() => drip.remove(), 1000);
        }
    }
}

// Initialize logo loader
document.addEventListener('DOMContentLoaded', () => {
    window.logoLoader = new LogoLoader();
});