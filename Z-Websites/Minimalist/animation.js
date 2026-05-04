// ===================================
// Animation Controller
// ===================================

class AnimationController {
    constructor() {
        this.observers = [];
        this.init();
    }
    
    init() {
        console.log('Animation Controller Initialized');
        this.setupIntersectionObservers();
        this.setupParallaxEffects();
        this.setupHoverEffects();
        this.listenForSectionChanges();
    }
    
    // Intersection Observer for fade-in animations
    setupIntersectionObservers() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe all elements with fade-in class
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
        
        this.observers.push(observer);
    }
    
    // Parallax effects for images
    setupParallaxEffects() {
        const images = document.querySelectorAll('.image-container img, .large-image img, .sensory-image img');
        
        images.forEach(img => {
            img.addEventListener('mousemove', (e) => {
                const rect = img.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const percentX = (x - centerX) / centerX;
                const percentY = (y - centerY) / centerY;
                
                const maxRotation = 5;
                const rotateX = percentY * maxRotation;
                const rotateY = -percentX * maxRotation;
                
                img.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            });
            
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            });
        });
    }
    
    // Hover effects for interactive elements
    setupHoverEffects() {
        // Pink accent hover effects
        const pinkAccents = document.querySelectorAll('.pink-accent, .pink-accent-large, .pink-accent-left, .pink-accent-right');
        
        pinkAccents.forEach(accent => {
            accent.addEventListener('mouseenter', () => {
                this.animatePinkAccent(accent, 'enter');
            });
            
            accent.addEventListener('mouseleave', () => {
                this.animatePinkAccent(accent, 'leave');
            });
        });
        
        // Button hover animations
        const buttons = document.querySelectorAll('.nav-arrow, .cta-button');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.animateButton(btn, 'enter');
            });
            
            btn.addEventListener('mouseleave', () => {
                this.animateButton(btn, 'leave');
            });
        });
    }
    
    animatePinkAccent(element, state) {
        if (state === 'enter') {
            element.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.transform = 'scale(1.1) rotate(5deg)';
        } else {
            element.style.transform = 'scale(1) rotate(0deg)';
        }
    }
    
    animateButton(element, state) {
        if (state === 'enter') {
            element.style.transition = 'all 0.3s ease';
            element.style.transform = 'scale(1.1)';
        } else {
            element.style.transform = 'scale(1)';
        }
    }
    
    // Listen for section changes
    listenForSectionChanges() {
        document.addEventListener('sectionChange', (e) => {
            const sectionNumber = e.detail.section;
            this.onSectionChange(sectionNumber);
        });
    }
    
    onSectionChange(sectionNumber) {
        console.log(`Animation triggered for section ${sectionNumber}`);
        
        // Get the active section
        const section = document.querySelector(`#section-${sectionNumber}`);
        if (!section) return;
        
        // Trigger specific animations based on section
        switch(sectionNumber) {
            case 1:
                this.animateHeroSection(section);
                break;
            case 2:
                this.animateEditorialSection(section);
                break;
            case 3:
                this.animateSensorySection(section);
                break;
        }
    }
    
    animateHeroSection(section) {
        const title = section.querySelector('.section-title');
        const subtitle = section.querySelector('.section-subtitle');
        const pinkAccent = section.querySelector('.pink-accent');
        
        // Stagger animations
        setTimeout(() => {
            if (subtitle) subtitle.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            if (title) title.style.opacity = '1';
        }, 200);
        
        setTimeout(() => {
            if (pinkAccent) pinkAccent.style.opacity = '1';
        }, 400);
    }
    
    animateEditorialSection(section) {
        const title = section.querySelector('.editorial-title');
        const verticalText = section.querySelector('.editorial-text-vertical');
        const pinkAccent = section.querySelector('.pink-accent-large');
        
        setTimeout(() => {
            if (title) title.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            if (verticalText) verticalText.style.opacity = '1';
        }, 300);
        
        setTimeout(() => {
            if (pinkAccent) pinkAccent.style.opacity = '1';
        }, 500);
    }
    
    animateSensorySection(section) {
        const titles = section.querySelectorAll('.sensory-title, .sensory-title-2');
        const image = section.querySelector('.sensory-image');
        const pinkAccents = section.querySelectorAll('.pink-accent-left, .pink-accent-right');
        
        titles.forEach((title, index) => {
            setTimeout(() => {
                title.style.opacity = '1';
            }, 100 * (index + 1));
        });
        
        setTimeout(() => {
            if (image) image.style.opacity = '1';
        }, 400);
        
        pinkAccents.forEach((accent, index) => {
            setTimeout(() => {
                accent.style.opacity = '1';
            }, 200 * (index + 1));
        });
    }
    
    // Utility: Create custom cursor effect
    createCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border: 2px solid #000;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.2s ease;
            display: none;
        `;
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.display = 'block';
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        // Expand cursor on interactive elements
        document.querySelectorAll('a, button, .nav-link').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(2)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
            });
        });
    }
    
    // Destroy observers on cleanup
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
    }
}

// Initialize animation controller
let animationController;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        animationController = new AnimationController();
    });
} else {
    animationController = new AnimationController();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}