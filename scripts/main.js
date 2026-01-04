// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });

    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.textContent = '☰';
        });
    });
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll Reveal Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Optionally unobserve after revealing
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with scroll-reveal class
document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});

// Fade-in animations for hero elements
window.addEventListener('load', () => {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        setTimeout(() => {
            el.classList.add('visible');
        }, 100);
    });
});

// Navigation Background on Scroll
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add background when scrolled
    if (currentScroll > 100) {
        nav.style.background = 'rgba(10, 10, 10, 0.95)';
    } else {
        nav.style.background = 'rgba(10, 10, 10, 0.8)';
    }

    lastScroll = currentScroll;
});

// Update Current Year in Footer
const yearElement = document.getElementById('currentYear');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// Add active state to navigation based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinksAll.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Parallax effect for gradient orbs
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const orbs = document.querySelectorAll('.gradient-orb');

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.5;
        orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Add hover effect to cards
const cards = document.querySelectorAll('.card, .project-card, .testimonial-card');
cards.forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transition = 'all 0.3s ease';
    });
});

// Performance: Reduce animations on low-end devices
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    // Disable animations for users who prefer reduced motion
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-base', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
}

// Console Easter Egg
console.log('%c¡Hola! 👋', 'font-size: 20px; font-weight: bold; color: #3b82f6;');
console.log('%c¿Interesado en el código? Visita mi GitHub o contáctame en raykumar@gmail.com', 'font-size: 14px; color: #8b5cf6;');
console.log('%cBuilt with ❤️ by Raj Kumar Bhag', 'font-size: 12px; color: #666;');

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        formStatus.style.display = 'none';
        formStatus.className = 'form-status';

        // Get form data
        const formData = new FormData(this);

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success
                formStatus.textContent = '¡Mensaje enviado exitosamente! Te contactaré pronto.';
                formStatus.classList.add('success');
                formStatus.style.display = 'block';
                this.reset();

                // Track form submission in Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submission', {
                        'event_category': 'Contact',
                        'event_label': 'Contact Form'
                    });
                }
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            // Error
            formStatus.textContent = 'Hubo un error al enviar el mensaje. Por favor, intenta de nuevo o contáctame directamente por email.';
            formStatus.classList.add('error');
            formStatus.style.display = 'block';
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });
}
