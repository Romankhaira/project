// js/animations.js - Updated class
class AnimationSystem {
    constructor() {
        this.initCursor();
        this.initScrollAnimations();
        this.initPageTransitions();
        
        // Initialize cards that are already in the DOM
        this.initExistingCards();
        
        // Watch for new cards being added (for dynamic content)
        this.observeCardChanges();
    }

    initExistingCards() {
        // Initialize all existing cards
        document.querySelectorAll('.card:not([data-animated])').forEach(card => {
            AnimationSystem.initCardTilt(card);
            AnimationSystem.initCardGlow(card);
            card.dataset.animated = 'true';
        });
    }

    observeCardChanges() {
        // Watch for new cards being added to the DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Check if node is a card or contains cards
                            if (node.classList && node.classList.contains('card')) {
                                AnimationSystem.initCardTilt(node);
                                AnimationSystem.initCardGlow(node);
                                node.dataset.animated = 'true';
                            }
                            
                            // Check child elements for cards
                            const cards = node.querySelectorAll ? node.querySelectorAll('.card:not([data-animated])') : [];
                            cards.forEach(card => {
                                AnimationSystem.initCardTilt(card);
                                AnimationSystem.initCardGlow(card);
                                card.dataset.animated = 'true';
                            });
                        }
                    });
                }
            });
        });

        // Start observing the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    initCursor() {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        
        if (!cursor || !follower) return;

        // Initially hide cursor until we have mouse movement
        gsap.set([cursor, follower], { opacity: 0 });

        let posX = 0, posY = 0;
        let mouseX = 0, mouseY = 0;

        const updateCursor = () => {
            posX += (mouseX - posX) / 9;
            posY += (mouseY - posY) / 9;
            
            gsap.set(cursor, {
                css: {
                    left: mouseX - 4, // Center the cursor
                    top: mouseY - 4
                }
            });
            
            gsap.set(follower, {
                css: {
                    left: posX - 20,
                    top: posY - 20
                }
            });
            
            requestAnimationFrame(updateCursor);
        };

        // Start animation loop
        requestAnimationFrame(updateCursor);

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Show cursor on first movement
            gsap.to([cursor, follower], {
                opacity: 1,
                duration: 0.3
            });
        });

        // Interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .card, .cart-icon-container');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursor, {
                    width: 16,
                    height: 16,
                    duration: 0.3
                });
                gsap.to(follower, {
                    scale: 1.5,
                    borderColor: 'var(--accent-primary)',
                    opacity: 0.5,
                    duration: 0.3
                });
            });
            
            el.addEventListener('mouseleave', () => {
                gsap.to(cursor, {
                    width: 8,
                    height: 8,
                    duration: 0.3
                });
                gsap.to(follower, {
                    scale: 1,
                    borderColor: 'var(--accent-primary)',
                    opacity: 0.3,
                    duration: 0.3
                });
            });
        });
    }

    initScrollAnimations() {
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            if (typeof ScrollTrigger === 'undefined') {
                console.warn('ScrollTrigger not loaded');
                return;
            }

            // Kill any existing ScrollTriggers to avoid conflicts
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());

            // Animate section headers
            gsap.utils.toArray('.section-header').forEach((header, i) => {
                ScrollTrigger.create({
                    trigger: header,
                    start: 'top 85%',
                    once: true,
                    onEnter: () => {
                        gsap.from(header.children, {
                            y: 30,
                            opacity: 0,
                            duration: 1,
                            stagger: 0.2,
                            ease: 'power2.out'
                        });
                    }
                });
            });

            // Refresh ScrollTrigger after setup
            ScrollTrigger.refresh();
        }, 500);
    }

    initPageTransitions() {
        // Page transition logic remains the same
        // ... (keep existing code)
    }

    // Static methods remain the same
    static initCardTilt(card) {
        if (!card || card.dataset.tiltInitialized) return;
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateY = ((x - centerX) / centerX) * 5;
            const rotateX = ((centerY - y) / centerY) * 5;
            
            gsap.to(card, {
                duration: 0.3,
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.5,
                rotateX: 0,
                rotateY: 0,
                ease: 'power2.out'
            });
        });
        
        card.dataset.tiltInitialized = 'true';
    }

    static initCardGlow(card) {
        if (!card || card.querySelector('.card-glow')) return;
        
        const glow = document.createElement('div');
        glow.className = 'card-glow';
        glow.style.cssText = `
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, 
                transparent 20%, 
                var(--accent-primary) 50%, 
                transparent 80%
            );
            border-radius: inherit;
            z-index: -1;
            opacity: 0;
            filter: blur(10px);
            pointer-events: none;
        `;
        
        // Ensure card has relative positioning
        if (getComputedStyle(card).position === 'static') {
            card.style.position = 'relative';
        }
        
        card.appendChild(glow);
        
        card.addEventListener('mouseenter', () => {
            gsap.to(glow, {
                opacity: 0.3,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(glow, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    }
}

// Initialize animation system
document.addEventListener('DOMContentLoaded', () => {
    // Wait for GSAP to be fully loaded
    if (typeof gsap === 'undefined') {
        console.error('GSAP not loaded');
        return;
    }
    
    // Initialize with a small delay to ensure DOM is ready
    setTimeout(() => {
        window.animationSystem = new AnimationSystem();
    }, 100);
    
    // Initialize tilt and glow for cards
    document.querySelectorAll('.card').forEach(card => {
        AnimationSystem.initCardTilt(card);
        AnimationSystem.initCardGlow(card);
    });
});