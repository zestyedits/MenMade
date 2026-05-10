// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close menu when link is clicked
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Navbar scroll effect
let lastScrollY = 0;
window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');
    if (lastScrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// GSAP Scroll Animations for cards
gsap.utils.toArray('.impact-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1
    });
});

// GSAP Scroll Animations for step items
gsap.utils.toArray('.step-item').forEach((step, index) => {
    gsap.from(step, {
        scrollTrigger: {
            trigger: step,
            start: 'top 75%',
            toggleActions: 'play none none none'
        },
        x: -40,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.15
    });
});

// Step circles - add hover effect
document.querySelectorAll('.step-circle').forEach(circle => {
    circle.addEventListener('mouseenter', function() {
        gsap.to(this, {
            transform: 'scale(1.1)',
            duration: 0.3
        });
    });
    
    circle.addEventListener('mouseleave', function() {
        gsap.to(this, {
            transform: 'scale(1)',
            duration: 0.3
        });
    });
});

// Impact cards - hover effects
document.querySelectorAll('.impact-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        gsap.to(this, {
            transform: 'translateY(-8px)',
            duration: 0.3
        });
    });
    
    card.addEventListener('mouseleave', function() {
        gsap.to(this, {
            transform: 'translateY(0)',
            duration: 0.3
        });
    });
});

// Stats counter animation
function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const isDecimal = target.toString().includes('.');
    const increment = target / (duration / 16);
    
    const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(counter);
        }
        element.textContent = isDecimal 
            ? current.toFixed(1)
            : Math.floor(current).toLocaleString();
    }, 16);
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(element => {
                const text = element.textContent;
                // Extract numeric part
                const match = text.match(/([\d.]+)/);
                if (match) {
                    const target = parseFloat(match[1]);
                    animateCounter(element, target);
                }
            });
            entry.target.dataset.animated = 'true';
        }
    });
}, { threshold: 0.5 });

const socialProof = document.querySelector('.social-proof');
if (socialProof) {
    statsObserver.observe(socialProof);
}

// Button ripple effect
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    // Remove existing ripples
    const existing = button.querySelector('.ripple');
    if (existing) {
        existing.remove();
    }
    
    button.appendChild(ripple);
}

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mousedown', createRipple);
});

// Parallax effect on hero badge
const heroBadge = document.querySelector('.hero-badge');
if (heroBadge) {
    gsap.to(heroBadge, {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'center center',
            scrub: 0.5
        },
        opacity: 0.3,
        y: 50
    });
}

// Ambient gradient animation
function animateAmbientGradient() {
    const gradient = document.querySelector('.ambient-gradient');
    if (gradient) {
        gsap.to(gradient, {
            x: 30,
            y: -30,
            duration: 8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}

animateAmbientGradient();

// ScrollTrigger refresh
ScrollTrigger.refresh();

console.log('MenMade premium landing page loaded successfully!');

