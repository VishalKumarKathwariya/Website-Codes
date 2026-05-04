// ===================================
// Main Application Logic
// ===================================

class VanityApp {
    constructor() {
        this.currentSection = 1;
        this.totalSections = 3;
        this.isAnimating = false;
        this.sections = document.querySelectorAll('.section');
        
        this.init();
    }
    
    init() {
        console.log('Vanity App Initialized');
        this.setupEventListeners();
        this.showSection(1);
    }
    
    setupEventListeners() {
        // Navigation arrow buttons
        document.querySelectorAll('.nav-arrow.prev').forEach(btn => {
            btn.addEventListener('click', () => this.navigateToPrev());
        });
        
        document.querySelectorAll('.nav-arrow.next').forEach(btn => {
            btn.addEventListener('click', () => this.navigateToNext());
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isAnimating) return;
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                this.navigateToPrev();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                this.navigateToNext();
            }
        });
        
        // Mobile touch support
        this.setupTouchSupport();
    }
    
    setupTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next section
                this.navigateToNext();
            } else {
                // Swipe right - previous section
                this.navigateToPrev();
            }
        }
    }
    
    navigateToNext() {
        if (this.isAnimating) return;
        
        const nextSection = this.currentSection < this.totalSections 
            ? this.currentSection + 1 
            : 1;
        
        this.showSection(nextSection);
    }
    
    navigateToPrev() {
        if (this.isAnimating) return;
        
        const prevSection = this.currentSection > 1 
            ? this.currentSection - 1 
            : this.totalSections;
        
        this.showSection(prevSection);
    }
    
    showSection(sectionNumber) {
        if (this.isAnimating || sectionNumber === this.currentSection) return;
        
        this.isAnimating = true;
        
        // Get current and target sections
        const currentSectionEl = document.querySelector(`#section-${this.currentSection}`);
        const targetSectionEl = document.querySelector(`#section-${sectionNumber}`);
        
        if (!targetSectionEl) {
            this.isAnimating = false;
            return;
        }
        
        // Determine direction
        const isForward = sectionNumber > this.currentSection || 
                         (this.currentSection === this.totalSections && sectionNumber === 1);
        
        // Remove active class from current section
        if (currentSectionEl) {
            currentSectionEl.classList.remove('active');
            currentSectionEl.classList.add('prev');
            
            // Reset animations
            setTimeout(() => {
                this.resetAnimations(currentSectionEl);
            }, 600);
        }
        
        // Add active class to target section
        targetSectionEl.classList.remove('prev');
        targetSectionEl.classList.add('active');
        
        // Update current section
        this.currentSection = sectionNumber;
        
        // Trigger animations for the new section
        setTimeout(() => {
            this.triggerAnimations(targetSectionEl);
        }, 100);
        
        // Re-enable navigation after animation completes
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
        
        // Update URL hash (optional)
        window.location.hash = `section-${sectionNumber}`;
        
        console.log(`Navigated to section ${sectionNumber}`);
    }
    
    triggerAnimations(section) {
        // This is handled by CSS animations
        // Additional custom animations can be triggered here
        const event = new CustomEvent('sectionChange', {
            detail: { section: this.currentSection }
        });
        document.dispatchEvent(event);
    }
    
    resetAnimations(section) {
        const fadeElements = section.querySelectorAll('.fade-in');
        fadeElements.forEach(el => {
            el.style.animation = 'none';
            setTimeout(() => {
                el.style.animation = '';
            }, 10);
        });
    }
    
    // Public API
    goToSection(number) {
        if (number >= 1 && number <= this.totalSections) {
            this.showSection(number);
        }
    }
    
    getCurrentSection() {
        return this.currentSection;
    }
}

// Initialize app when DOM is ready
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new VanityApp();
    });
} else {
    app = new VanityApp();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VanityApp;
}