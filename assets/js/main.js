/* ==========================================================================
   Premium Portfolio Interactive Logic
   Author: Alexander Vance
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Disable scrolling while preloader runs
    document.body.style.overflow = 'hidden';

    // Initialize components
    initNavbar();
    initMobileMenu();
    initParticleCanvas();
    initScrollReveal();
    initContactForm();
    initScrollProgressBar();
    initBackToTopButton();
    initFAQAccordion();
});

/* ==========================================================================
   1. Navbar Auto-Hide & Translucent Scroll Trigger
   ========================================================================== */
function initNavbar() {
    const header = document.getElementById('main-header');
    let lastScrollY = window.scrollY;
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Add translucent background and blur when scrolled down
        if (currentScrollY > scrollThreshold) {
            header.classList.add('navbar-scrolled');
        } else {
            header.classList.remove('navbar-scrolled');
        }

        // Auto-hide menu bar on scroll down, reveal on scroll up
        if (currentScrollY > lastScrollY && currentScrollY > 300) {
            // Scrolling Down - Hide
            header.classList.add('navbar-hidden');
        } else {
            // Scrolling Up - Reveal
            header.classList.remove('navbar-hidden');
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
}

/* ==========================================================================
   2. Mobile Drawer Navigation & Accessibilities
   ========================================================================== */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    const toggleMenu = () => {
        const isOpen = menuBtn.classList.contains('menu-toggle-active');
        
        // Toggle active states
        menuBtn.classList.toggle('menu-toggle-active');
        mobileMenu.classList.toggle('mobile-menu-active');
        
        // Accessibility attributes update
        menuBtn.setAttribute('aria-expanded', !isOpen);
        mobileMenu.setAttribute('aria-hidden', isOpen);
        
        // Disable body scroll when drawer is active
        document.body.style.overflow = isOpen ? '' : 'hidden';
    };

    menuBtn.addEventListener('click', toggleMenu);

    // Close mobile nav drawer when links are selected
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('mobile-menu-active')) {
                toggleMenu();
            }
        });
    });
}

/* ==========================================================================
   3. Performant Canvas Particle Network
   ========================================================================== */
function initParticleCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const maxParticles = 60;
    const connectionDistance = 120;
    
    // Mouse status object
    const mouse = {
        x: null,
        y: null,
        radius: 150 // Repulsion zone size
    };

    // Responsive Canvas Size
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        initParticles();
    }

    // Particle Object Blueprint
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            // Standard inertia movement
            this.x += this.vx;
            this.y += this.vy;

            // Boundaries bouncing checks
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // Mouse repulsion dynamics
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.hypot(dx, dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Move particle away from cursor
                    const forceX = (dx / distance) * force * 1.5;
                    const forceY = (dy / distance) * force * 1.5;
                    
                    this.x += forceX;
                    this.y += forceY;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(165, 180, 252, 0.4)'; // Light indigo glow
            ctx.fill();
        }
    }

    // Populate particles set
    function initParticles() {
        particles = [];
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
    }

    // Connect close particle nodes with lines
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.hypot(dx, dy);

                if (distance < connectionDistance) {
                    // Line transparency gets brighter the closer particles are
                    const alpha = (1 - distance / connectionDistance) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    // Render loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        drawConnections();
        animationFrameId = requestAnimationFrame(animate);
    }

    // Handle Cursor Updates
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Resize event with debounce/simple listen
    window.addEventListener('resize', resizeCanvas);
    
    // Performance optimization: Pause animations when canvas is viewport invisible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate();
            } else {
                cancelAnimationFrame(animationFrameId);
            }
        });
    }, { threshold: 0.05 });

    // Bootstrap
    resizeCanvas();
    observer.observe(canvas.parentElement);
}

/* ==========================================================================
   4. Scroll Intersection Observer for Entrance Animation
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                // Unobserve since we only need the entry reveal once
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Reveal slightly before crossing border
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}

/* ==========================================================================
   5. Interactive Contact Form with Validation State Handling
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    if (!form) return;

    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const subjectInput = document.getElementById('form-subject');
    const messageInput = document.getElementById('form-message');
    const submitBtn = document.getElementById('btn-form-submit');
    const statusMsg = document.getElementById('form-status-msg');

    if (!nameInput || !emailInput || !messageInput || !submitBtn || !statusMsg) return;

    // Strict Email regex check helper
    function isValidEmail(email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
    }

    // Input error togglers
    function showError(input, errorElement) {
        input.classList.add('invalid-input');
        if (errorElement) errorElement.style.display = 'block';
    }

    function clearError(input, errorElement) {
        input.classList.remove('invalid-input');
        if (errorElement) errorElement.style.display = 'none';
    }

    // Event listeners to clear error styling as user types
    nameInput.addEventListener('input', () => clearError(nameInput, document.getElementById('name-error')));
    emailInput.addEventListener('input', () => clearError(emailInput, document.getElementById('email-error')));
    messageInput.addEventListener('input', () => clearError(messageInput, document.getElementById('message-error')));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let hasErrors = false;
        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const subjectVal = subjectInput ? subjectInput.value.trim() : '';
        const messageVal = messageInput.value.trim();
        
        // Full Name validation check
        if (!nameVal) {
            showError(nameInput, document.getElementById('name-error'));
            hasErrors = true;
        } else {
            clearError(nameInput, document.getElementById('name-error'));
        }

        // Email Address format check
        if (!emailVal || !isValidEmail(emailVal)) {
            showError(emailInput, document.getElementById('email-error'));
            hasErrors = true;
        } else {
            clearError(emailInput, document.getElementById('email-error'));
        }

        // Message content check
        if (!messageVal) {
            showError(messageInput, document.getElementById('message-error'));
            hasErrors = true;
        } else {
            clearError(messageInput, document.getElementById('message-error'));
        }

        if (hasErrors) {
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
            return;
        }

        // Set Button Loading State
        submitBtn.disabled = true;
        const originalBtnHTML = submitBtn.innerHTML;
        
        submitBtn.innerHTML = `
            <span>Sending...</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-loader" aria-hidden="true" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        `;
        submitBtn.style.opacity = '0.75';
        submitBtn.style.cursor = 'not-allowed';

        // Prepare Form Payload with Reply-To header configuration
        const payload = {
            name: nameVal,
            email: emailVal,
            subject: subjectVal || `Portfolio Inquiry from ${nameVal}`,
            message: messageVal,
            _replyto: emailVal,
            _subject: subjectVal || `Portfolio Inquiry from ${nameVal}`,
            _template: 'table',
            _captcha: 'false'
        };

        try {
            // Asynchronous AJAX submit targeting my9057832@gmail.com
            const response = await fetch('https://formsubmit.co/ajax/my9057832@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success === 'true' || data.success === true) {
                // Success State Banner & Toast
                statusMsg.style.display = 'block';
                statusMsg.className = 'form-status status-success';
                statusMsg.innerHTML = `<strong>✓ Message sent!</strong><br>Thank you ${nameVal}, your inquiry has been delivered to my inbox. I will reply to <strong>${emailVal}</strong> soon.`;

                // Clear input fields ONLY on successful submit
                form.reset();

                // Auto hide status banner after 8 seconds
                setTimeout(() => {
                    statusMsg.style.display = 'none';
                    statusMsg.className = 'form-status';
                }, 8000);
            } else if (data.message && (data.message.includes('Activation') || data.message.includes('actived') || data.message.includes('activated'))) {
                // One-Time Form Activation Required Notice
                statusMsg.style.display = 'block';
                statusMsg.className = 'form-status status-warning';
                statusMsg.innerHTML = `<strong>📧 One-Time Form Activation Required!</strong><br>FormSubmit sent an activation email to <strong>my9057832@gmail.com</strong>. Please check your Gmail inbox (or Spam folder) and click <strong>"Activate Form"</strong> once. After clicking activate, all future messages will land directly in your inbox!`;
            } else {
                throw new Error(data.message || 'Server rejected submission');
            }
        } catch (err) {
            console.error('Contact Form Submission Error:', err);
            // Error State Banner - preserves user's typed content!
            statusMsg.style.display = 'block';
            statusMsg.className = 'form-status status-error';
            statusMsg.innerHTML = `<strong>✕ Sending Failed:</strong><br>Unable to send message automatically right now. Please try again or email me directly at <a href="mailto:my9057832@gmail.com" style="color: inherit; font-weight: 700; text-decoration: underline;">my9057832@gmail.com</a>. Your typed message is preserved.`;
        } finally {
            // Restore Submit Button State
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    });
}

/* ==========================================================================
   6. Page Preloader Fade-Out Trigger
   ========================================================================== */
let preloaderFired = false;
function hidePreloader() {
    if (preloaderFired) return;
    preloaderFired = true;
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('preloader-fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
            document.body.style.overflow = ''; // Restore page scrolling
        }, 600);
    } else {
        document.body.style.overflow = ''; // Safe fallback
    }
}

window.addEventListener('load', hidePreloader);

// Safe fail-safe: automatically hide preloader after 3 seconds in case resource loads hang
setTimeout(hidePreloader, 3000);

/* ==========================================================================
   7. Scroll Progress Bar
   ========================================================================== */
function initScrollProgressBar() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        progressBar.style.width = scrolled + '%';
    }, { passive: true });
}

/* ==========================================================================
   8. Back-To-Top Smooth Scroll Button
   ========================================================================== */
function initBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('btn-visible');
        } else {
            backToTopBtn.classList.remove('btn-visible');
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ==========================================================================
   9. FAQ Accordion Dropdown Toggles
   ========================================================================== */
function initFAQAccordion() {
    const triggers = document.querySelectorAll('.faq-trigger');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            const panel = document.getElementById(trigger.getAttribute('aria-controls'));
            
            // Close all other panels first for a clean accordion effect
            triggers.forEach(otherTrigger => {
                if (otherTrigger !== trigger) {
                    otherTrigger.setAttribute('aria-expanded', 'false');
                    const otherPanel = document.getElementById(otherTrigger.getAttribute('aria-controls'));
                    if (otherPanel) {
                        otherPanel.style.maxHeight = null;
                        otherPanel.classList.remove('faq-panel-open');
                    }
                    const otherIcon = otherTrigger.querySelector('.faq-icon-indicator');
                    if (otherIcon) otherIcon.classList.remove('faq-icon-active');
                }
            });

            // Toggle current panel
            trigger.setAttribute('aria-expanded', !isExpanded);
            const icon = trigger.querySelector('.faq-icon-indicator');
            
            if (!isExpanded) {
                panel.classList.add('faq-panel-open');
                panel.style.maxHeight = panel.scrollHeight + 'px';
                if (icon) icon.classList.add('faq-icon-active');
            } else {
                panel.style.maxHeight = null;
                panel.classList.remove('faq-panel-open');
                if (icon) icon.classList.remove('faq-icon-active');
            }
        });
    });
}

