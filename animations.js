// js/animations.js - UPDATED
class AnimationSystem {
    constructor() {
        this.initCursor();
        this.initScrollAnimations();
        this.initPageTransitions();
        this.initCardAnimations(); // NEW: Initialize card animations
        this.observeCardChanges(); // Keep for dynamic cards
    }

    // Keep cursor animation as is
    initCursor() {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        
        if (!cursor || !follower) return;

        // ... keep existing cursor code unchanged ...
        // (I'll keep the exact same cursor code you already have)
        
        let posX = 0, posY = 0;
        let mouseX = 0, mouseY = 0;

        gsap.to({}, 0.016, {
            repeat: -1,
            onRepeat: () => {
                posX += (mouseX - posX) / 9;
                posY += (mouseY - posY) / 9;
                
                gsap.set(cursor, {
                    css: {
                        left: mouseX,
                        top: mouseY
                    }
                });
                
                gsap.set(follower, {
                    css: {
                        left: posX - 20,
                        top: posY - 20
                    }
                });
            }
        });

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const interactiveElements = document.querySelectorAll('a, button, .cart-icon-container');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '16px';
                cursor.style.height = '16px';
                follower.style.transform = 'scale(1.5)';
                follower.style.borderColor = 'var(--accent-primary)';
                follower.style.opacity = '0.5';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '8px';
                cursor.style.height = '8px';
                follower.style.transform = 'scale(1)';
                follower.style.borderColor = 'var(--accent-primary)';
                follower.style.opacity = '0.3';
            });
        });
    }

    // REMOVED: initScrollAnimations (old card animations)
    initScrollAnimations() {
        // Empty - old card animations removed
    }

    // Keep page transitions
    initPageTransitions() {
        // ... keep existing page transition code unchanged ...
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.includes('#') && !link.target && 
                link.href.includes(window.location.origin)) {
                e.preventDefault();
                
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: var(--bg-primary);
                    z-index: 10000;
                    transform: scaleY(0);
                    transform-origin: bottom;
                `;
                document.body.appendChild(overlay);
                
                gsap.to(overlay, {
                    scaleY: 1,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        window.location.href = link.href;
                    }
                });
            }
        });

        gsap.from('body', {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        });
    }

    // NEW: Initialize ONLY the two required card animations
    initCardAnimations() {
        // Initialize animations for existing cards
        this.initExistingCardAnimations();
        
        // Set up grid scroll animations
        this.setupGridScrollAnimations();
    }

    // Initialize hover animation for existing cards
    initExistingCardAnimations() {
        const cards = document.querySelectorAll('.card:not([data-animated])');
        cards.forEach(card => {
            this.applyHoverAnimation(card);
            card.dataset.animated = 'true';
        });
    }

    // Apply hover animation to a single card
    applyHoverAnimation(card) {
        // Remove any existing hover animations
        if (card._hoverAnimation) {
            card._hoverAnimation.kill();
        }
        
        // Create new hover animation
        const hover = gsap.to(card, {
            scale: 1.03,
            duration: 0.3,
            ease: 'power2.out',
            paused: true
        });
        
        // Store reference
        card._hoverAnimation = hover;
        
        // Remove any existing event listeners
        card.removeEventListener('mouseenter', card._mouseEnterHandler);
        card.removeEventListener('mouseleave', card._mouseLeaveHandler);
        
        // Create new handlers
        card._mouseEnterHandler = () => hover.play();
        card._mouseLeaveHandler = () => hover.reverse();
        
        // Add event listeners
        card.addEventListener('mouseenter', card._mouseEnterHandler);
        card.addEventListener('mouseleave', card._mouseLeaveHandler);
    }

    // Set up staggered scroll animations for grid containers
    setupGridScrollAnimations() {
        // Define grid containers to animate
        const gridContainers = [
            '.brands-grid',
            '.materials-grid', 
            '.products-grid',
            '.properties-grid',
            '.color-swatches'
        ];
        
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            gridContainers.forEach(selector => {
                const grid = document.querySelector(selector);
                if (!grid) return;
                
                // Mark cards in this grid for reveal
                const cards = grid.querySelectorAll('.card');
                cards.forEach(card => {
                    card.classList.add('reveal-card');
                });
                
                // Set up scroll animation for this grid
                this.setupStaggeredGridAnimation(grid);
            });
            
            // Refresh ScrollTrigger after setup
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }, 100);
    }

    // Set up staggered animation for a specific grid
    setupStaggeredGridAnimation(grid) {
        // Get all reveal cards in this grid
        const cards = grid.querySelectorAll('.reveal-card');
        if (cards.length === 0) return;
        
        // Calculate start position based on viewport height
        const isMobile = window.innerWidth <= 768;
        const startPosition = isMobile ? 'top 90%' : 'top 80%';
        
        // Create staggered animation
        gsap.from(cards, {
            opacity: 0,
            y: 80,
            duration: 1,
            ease: 'power4.out',
            stagger: 0.12,
            scrollTrigger: {
                trigger: grid,
                start: startPosition,
                once: true, // Animate only once
                markers: false // Set to true for debugging
            }
        });
    }

    // Observe for new cards being added
    observeCardChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Check if node is a card
                            if (node.classList && node.classList.contains('card')) {
                                this.applyHoverAnimation(node);
                                node.dataset.animated = 'true';
                                
                                // Add to reveal group if in a grid
                                const grid = node.closest('.brands-grid, .materials-grid, .products-grid');
                                if (grid) {
                                    node.classList.add('reveal-card');
                                    // Re-setup grid animation
                                    this.setupStaggeredGridAnimation(grid);
                                }
                            }
                            
                            // Check child elements for cards
                            const cards = node.querySelectorAll ? node.querySelectorAll('.card:not([data-animated])') : [];
                            cards.forEach(card => {
                                this.applyHoverAnimation(card);
                                card.dataset.animated = 'true';
                                
                                // Add to reveal group if in a grid
                                const grid = card.closest('.brands-grid, .materials-grid, .products-grid');
                                if (grid) {
                                    card.classList.add('reveal-card');
                                }
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize animation system
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined') {
        console.error('GSAP not loaded');
        return;
    }
    
    // Wait a bit for DOM to be ready
    setTimeout(() => {
        window.animationSystem = new AnimationSystem();
    }, 100);
});