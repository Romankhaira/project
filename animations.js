// js/animations.js - ALL ANIMATIONS REMOVED
// This file is now a stub as all animations have been removed from the project.

class AnimationSystem {
    constructor() {
        console.log('AnimationSystem initialized (all animations disabled).');
        // All animation logic (cursor, page transitions, card animations) has been removed.
    }

    // Public method stubs to prevent errors if called from other scripts
    refreshAnimations() {
        console.log('Animations are disabled.');
    }
    
    playAllAnimations() {
        console.log('Animations are disabled.');
    }
}

// Initialize a minimal system to prevent reference errors
document.addEventListener('DOMContentLoaded', () => {
    window.animationSystem = new AnimationSystem();
    console.log('Animations are disabled for this project.');
});