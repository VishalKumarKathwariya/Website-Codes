// ===================================
// Scroll Controller
// ===================================

class ScrollController {
    constructor() {
        this.scrollThrottle = false;
        this.scrollTimeout = null;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isScrolling = false;
        this.wheelDelta = 0;
        this.wheelThreshold = 50;
        
        this.init();
    }
    
    init() {
        console.log('Scroll Controller Initialized');
        this.setupWheelScrolling();
        this.setupTouchScrolling();
        this.setupSmoothScrolling();
        this.preventDefaultScroll();
    }
    
    // Prevent default scroll behavior
    preventDefaultScroll() {
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (this.isScrolling) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // Wheel scrolling with accumulation
    setupWheelScrolling() {
        let wheelTimeout;
        
        document.addEventListener('wheel', (e) => {
            if (this.scrollThrottle) return;
            
            // Accumulate wheel delta
            this.wheelDelta += e.deltaY;
            
            // Clear previous timeout
            clearTimeout(wheelTimeout);
            
            // Set new timeout to reset delta
            wheelTimeout = setTimeout(() => {
                this.wheelDelta = 0;
            }, 200);
            
            // Check if threshold is met
            if (Math.abs(this.wheelDelta) >= this.wheelThreshold) {
                this.handleWheelScroll(this.wheelDelta);
                this.wheelDelta = 0;
            }
        }, { passive: false });
    }
    
    handleWheelScroll(delta) {
        this.scrollThrottle = true;
        
        if (delta > 0) {
            // Scroll down - next section
            this.navigateNext();
        } else {
            // Scroll up - previous section
            this.navigatePrev();
        }
        
        setTimeout(() => {
            this.scrollThrottle = false;
        }, 1000);
    }
    
    // Touch scrolling
    setupTouchScrolling() {
        document.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
            this.isScrolling = true;
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.isScrolling) return;
            
            this.touchEndY = e.touches[0].clientY;
            const deltaY = this.touchStartY - this.touchEndY;
            
            // Visual feedback during drag
            this.updateDragFeedback(deltaY);
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            if (!this.isScrolling) return;
            
            const deltaY = this.touchStartY - this.touchEndY;
            const threshold = 50;
            
            if (Math.abs(deltaY) > threshold) {
                if (deltaY > 0) {
                    // Swiped up - next section
                    this.navigateNext();
                } else {
                    // Swiped down - previous section
                    this.navigatePrev();
                }
            }
            
            this.resetDragFeedback();
            this.isScrolling = false;
            this.touchStartY = 0;
            this.touchEndY = 0;
        });
    }
    
    updateDragFeedback(deltaY) {
        const activeSection = document.querySelector('.section.active');
        if (!activeSection) return;
        
        const maxDrag = 100;
        const dragAmount = Math.max(-maxDrag, Math.min(maxDrag, deltaY));
        const opacity = 1 - (Math.abs(dragAmount) / maxDrag) * 0.3;
        
        activeSection.style.transform = `translateY(${-dragAmount}px)`;
        activeSection.style.opacity = opacity;
    }
    
    resetDragFeedback() {
        const activeSection = document.querySelector('.section.active');
        if (!activeSection) return;
        
        activeSection.style.transform = '';
        activeSection.style.opacity = '';
    }
    
    // Smooth scrolling with easing
    setupSmoothScrolling() {
        // Add smooth scroll behavior to navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    this.smoothScrollTo(href);
                }
            });
        });
    }
    
    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (!element) return;
        
        const start = window.pageYOffset;
        const targetPosition = element.getBoundingClientRect().top + start;
        const distance = targetPosition - start;
        const duration = 1000;
        let startTime = null;
        
        const easeInOutCubic = (t) => {
            return t < 0.5 
                ? 4 * t * t * t 
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };
        
        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutCubic(progress);
            
            window.scrollTo(0, start + distance * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    }
    
    // Navigation methods
    navigateNext() {
        if (window.app) {
            window.app.navigateToNext();
        } else if (typeof app !== 'undefined') {
            app.navigateToNext();
        }
    }
    
    navigatePrev() {
        if (window.app) {
            window.app.navigateToPrev();
        } else if (typeof app !== 'undefined') {
            app.navigateToPrev();
        }
    }
    
    // Scroll progress indicator
    createScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: #000;
            z-index: 9999;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(progressBar);
        
        document.addEventListener('sectionChange', (e) => {
            const section = e.detail.section;
            const totalSections = 3;
            const progress = (section / totalSections) * 100;
            progressBar.style.width = progress + '%';
        });
    }
    
    // Section indicator dots
    createSectionIndicators() {
        const indicators = document.createElement('div');
        indicators.className = 'section-indicators';
        indicators.style.cssText = `
            position: fixed;
            right: 40px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 1000;
        `;
        
        for (let i = 1; i <= 3; i++) {
            const dot = document.createElement('button');
            dot.className = 'section-indicator';
            dot.dataset.section = i;
            dot.style.cssText = `
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid #000;
                background: transparent;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            dot.addEventListener('click', () => {
                if (window.app) {
                    window.app.goToSection(i);
                } else if (typeof app !== 'undefined') {
                    app.goToSection(i);
                }
            });
            
            indicators.appendChild(dot);
        }
        
        document.body.appendChild(indicators);
        
        // Update active indicator
        document.addEventListener('sectionChange', (e) => {
            const section = e.detail.section;
            indicators.querySelectorAll('.section-indicator').forEach((dot, index) => {
                if (index + 1 === section) {
                    dot.style.background = '#000';
                } else {
                    dot.style.background = 'transparent';
                }
            });
        });
        
        // Set initial active state
        const firstDot = indicators.querySelector('.section-indicator');
        if (firstDot) firstDot.style.background = '#000';
    }
    
    // Enable/disable scrolling
    enableScrolling() {
        this.scrollThrottle = false;
    }
    
    disableScrolling() {
        this.scrollThrottle = true;
    }
}

// Initialize scroll controller
let scrollController;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        scrollController = new ScrollController();
        // Optional: Add scroll progress and indicators
        // scrollController.createScrollProgress();
        // scrollController.createSectionIndicators();
    });
} else {
    scrollController = new ScrollController();
    // Optional: Add scroll progress and indicators
    // scrollController.createScrollProgress();
    // scrollController.createSectionIndicators();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollController;
}