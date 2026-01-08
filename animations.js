// js/animations.js - UPDATED with visible animations

class AnimationSystem {
    constructor() {
        this.initCursor();
        this.initPageTransitions();
        this.initCardAnimations();
        this.observeCardChanges();
    }

    initCursor() {
        // ... keep cursor code exactly as is ...
    }

    initPageTransitions() {
        // ... keep page transition code exactly as is ...
    }

    initCardAnimations() {
        console.log('Initializing card animations...');
        
        // FIRST: Hide cards initially with GSAP (not CSS)
        this.hideCardsInitially();
        
        // THEN: Set up animations after a delay
        setTimeout(() => {
            this.applyHoverToCards();
            this.setupGridAnimations();
        }, 300);
    }

    // NEW: Hide cards initially so the reveal animation is visible
    hideCardsInitially() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            // Set initial hidden state with GSAP (not CSS)
            gsap.set(card, {
                opacity: 0,
                y: 50
            });
        });
    }

    // ANIMATION 2: Hover Scale Animation
    applyHoverToCards() {
        console.log('Applying hover animations...');
        const cards = document.querySelectorAll('.card');
        
        if (cards.length === 0) {
            console.log('No cards found for hover animation');
            return;
        }
        
        console.log(`Found ${cards.length} cards for hover animation`);
        
        cards.forEach(card => {
            if (card.dataset.hoverApplied === 'true') return;
            
            // Create hover animation
            const hover = gsap.to(card, {
                scale: 1.03,
                duration: 0.3,
                ease: 'power2.out',
                paused: true
            });

            // Add event listeners
            card.addEventListener('mouseenter', () => hover.play());
            card.addEventListener('mouseleave', () => hover.reverse());
            
            card.dataset.hoverApplied = 'true';
        });
    }

    // ANIMATION 1: Staggered Grid Scroll Animation
    setupGridAnimations() {
        console.log('Setting up grid animations...');
        
        // Grid containers to animate
        const gridSelectors = [
            '.brands-grid',
            '.materials-grid', 
            '.products-grid'
        ];
        
        let animationsCreated = 0;
        
        gridSelectors.forEach(selector => {
            const grid = document.querySelector(selector);
            if (!grid) return;
            
            const cards = grid.querySelectorAll('.card');
            if (cards.length === 0) return;
            
            console.log(`Found ${cards.length} cards in ${selector}`);
            
            // Calculate start position - make it more sensitive
            const isMobile = window.innerWidth <= 768;
            const startPosition = isMobile ? 'top 95%' : 'top 85%';
            
            // Kill any existing ScrollTriggers for this grid
            const existingTriggers = ScrollTrigger.getAll().filter(t => t.trigger === grid);
            existingTriggers.forEach(t => t.kill());
            
            // IMPORTANT: Animate EACH CARD individually for better control
            cards.forEach((card, index) => {
                // Reset to hidden state for animation
                gsap.set(card, {
                    opacity: 0,
                    y: 50
                });
                
                // Create individual animation for each card
                const animation = gsap.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    delay: index * 0.1, // Stagger effect
                    scrollTrigger: {
                        trigger: grid,
                        start: startPosition,
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse',
                        markers: false,
                        onEnter: () => {
                            console.log(`Card ${index} entered viewport`);
                        }
                    }
                });
                
                animationsCreated++;
            });
        });
        
        console.log(`Created ${animationsCreated} card animations`);
        
        // Force refresh ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
            console.log('ScrollTrigger refreshed');
        }
        
        // TEST: Force trigger animations after 2 seconds to make sure they work
        setTimeout(() => {
            console.log('Forcing animation test...');
            this.testAnimations();
        }, 2000);
    }

    // TEST FUNCTION: Force animations to play so you can see them
    testAnimations() {
        const cards = document.querySelectorAll('.card');
        console.log(`Testing animations on ${cards.length} cards`);
        
        // Test 1: Play staggered animation
        gsap.to(cards, {
            opacity: 0,
            y: 50,
            duration: 0.5,
            stagger: 0.1,
            onComplete: () => {
                console.log('Cards hidden for test');
                
                // Then animate them in
                gsap.to(cards, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power4.out',
                    stagger: 0.12,
                    onComplete: () => {
                        console.log('Test animation complete!');
                    }
                });
            }
        });
    }

    observeCardChanges() {
        const observer = new MutationObserver((mutations) => {
            let cardsAdded = false;
            
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('card')) {
                                cardsAdded = true;
                                // Hide new card initially
                                gsap.set(node, { opacity: 0, y: 50 });
                            }
                            
                            const childCards = node.querySelectorAll ? node.querySelectorAll('.card:not([data-hover-applied])') : [];
                            if (childCards.length > 0) {
                                cardsAdded = true;
                                childCards.forEach(card => {
                                    gsap.set(card, { opacity: 0, y: 50 });
                                });
                            }
                        }
                    });
                }
            });
            
            if (cardsAdded) {
                setTimeout(() => {
                    this.applyHoverToCards();
                    this.setupGridAnimations();
                }, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Public method to manually trigger animations
    refreshAnimations() {
        console.log('Manually refreshing animations...');
        this.applyHoverToCards();
        this.setupGridAnimations();
    }
    
    // Force play all animations (for debugging)
    playAllAnimations() {
        const cards = document.querySelectorAll('.card');
        
        // Hide all cards first
        gsap.set(cards, { opacity: 0, y: 50 });
        
        // Then animate them in with stagger
        gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power4.out',
            stagger: 0.12,
            onComplete: () => {
                console.log('All animations played!');
            }
        });
    }
}

// Initialize animation system
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP or ScrollTrigger not loaded');
        return;
    }
    
    console.log('GSAP and ScrollTrigger loaded, initializing animations...');
    
    // Initialize with delay
    setTimeout(() => {
        window.animationSystem = new AnimationSystem();
        console.log('AnimationSystem initialized');
        
        // Add debug function to window
        window.playCardAnimations = () => {
            if (window.animationSystem && window.animationSystem.playAllAnimations) {
                window.animationSystem.playAllAnimations();
            }
        };
    }, 500);
});