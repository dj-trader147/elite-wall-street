/* ================================================
   ELITE WALL STREET - Main Application
   ================================================ */

const App = (function() {

    // Application State
    const state = {
        isLoading: true,
        isReady: false,
        currentPage: '',
        scrollPosition: 0
    };

    // DOM Elements
    let elements = {};

    // Initialize Application
    function init() {
        Utils.log('🚀 Elite Wall Street Initializing...', 'info');

        // Get current page
        state.currentPage = getCurrentPage();

        // Cache DOM elements
        cacheElements();

        // Initialize modules
        initModules();

        // Bind global events
        bindEvents();

        // Initialize page-specific features
        initPageFeatures();

        // Hide preloader
        hidePreloader();

        state.isReady = true;
        Utils.log('✅ Elite Wall Street Ready!', 'success');
    }

    // Get Current Page
    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page;
    }

    // Cache DOM Elements
    function cacheElements() {
        elements = {
            preloader: document.getElementById('preloader'),
            preloaderProgress: document.querySelector('.preloader-progress'),
            preloaderPercentage: document.querySelector('.preloader-percentage'),
            header: document.getElementById('mainHeader'),
            backToTop: document.getElementById('backToTop'),
            toastContainer: document.getElementById('toastContainer'),
            heroChart: document.getElementById('heroChart'),
            particleCanvas: document.getElementById('particleCanvas')
        };
    }

    // Initialize All Modules
    function initModules() {
        // Initialize Sidebar
        if (typeof Sidebar !== 'undefined') {
            Sidebar.init();
            Sidebar.highlightCurrentPage();
        }

        // Initialize Particle System
        if (typeof ParticleSystem !== 'undefined' && elements.particleCanvas) {
            ParticleSystem.init('particleCanvas');
            ParticleSystem.start();
        }

        // Initialize Ticker
        if (typeof Ticker !== 'undefined') {
            Ticker.init();
        }

        // Initialize Auth
        if (typeof Auth !== 'undefined') {
            Auth.init();
            Auth.updateUI();
        }

        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 50,
                delay: 100
            });
        }
    }

    // Bind Global Events
    function bindEvents() {
        // Scroll events
        window.addEventListener('scroll', Utils.throttle(handleScroll, 100));

        // Resize events
        window.addEventListener('resize', Utils.debounce(handleResize, 250));

        // Back to top button
        if (elements.backToTop) {
            elements.backToTop.addEventListener('click', function(e) {
                e.preventDefault();
                Utils.scrollToTop();
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    Utils.scrollTo(target, 100);
                }
            });
        });

        // Form submissions
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);

        // Visibility change (pause animations when tab is hidden)
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Online/Offline status
        window.addEventListener('online', function() {
            showToast('Connection restored', 'success');
            if (typeof Ticker !== 'undefined') {
                Ticker.refresh();
            }
        });

        window.addEventListener('offline', function() {
            showToast('Connection lost', 'error');
        });

        // Auth state changes
        window.addEventListener('authStateChange', handleAuthStateChange);
    }

    // Initialize Page-Specific Features
    function initPageFeatures() {
        switch (state.currentPage) {
            case 'index':
                initHomePage();
                break;
            case 'market':
                initMarketPage();
                break;
            case 'community':
                initCommunityPage();
                break;
            case 'courses':
                initCoursesPage();
                break;
            case 'about':
                initAboutPage();
                break;
            case 'contact':
                initContactPage();
                break;
            case 'auth':
                initAuthPage();
                break;
            default:
                initHomePage();
        }
    }

    // Home Page Initialization - ✅ FIXED
    function initHomePage() {
        Utils.log('Initializing Home Page', 'info');

        // Initialize Hero Chart
        if (elements.heroChart && typeof Charts !== 'undefined') {
            Charts.createHeroChart('heroChart', 4);
            
            // ✅ FIX: Timeframe buttons click event
            var timeframeButtons = document.querySelectorAll('.tf-btn');
            timeframeButtons.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    // Remove active from all
                    timeframeButtons.forEach(function(b) {
                        b.classList.remove('active');
                    });
                    // Add active to clicked
                    this.classList.add('active');
                    // Get hours and update chart
                    var hours = parseInt(this.getAttribute('data-timeframe'), 10);
                    Charts.createHeroChart('heroChart', hours);
                });
            });
        }

        // Animate hero stats
        animateHeroStats();

        // Initialize feature cards hover effects
        initFeatureCards();

        // Initialize testimonials carousel
        initTestimonialsCarousel();
    }

    // Market Page Initialization
    function initMarketPage() {
        Utils.log('Initializing Market Page', 'info');

        // Load market data
        if (typeof API !== 'undefined') {
            loadMarketData();
        }
    }

    // Community Page Initialization
    function initCommunityPage() {
        Utils.log('Initializing Community Page', 'info');
    }

    // Courses Page Initialization
    function initCoursesPage() {
        Utils.log('Initializing Courses Page', 'info');

        // Initialize course filters
        initCourseFilters();
    }

    // About Page Initialization
    function initAboutPage() {
        Utils.log('Initializing About Page', 'info');

        // Animate team cards
        initTeamCards();
    }

    // Contact Page Initialization
    function initContactPage() {
        Utils.log('Initializing Contact Page', 'info');

        // Initialize contact form
        initContactForm();
    }

    // Auth Page Initialization
    function initAuthPage() {
        Utils.log('Initializing Auth Page', 'info');

        // Get mode from URL
        const params = Utils.getUrlParams();
        const mode = params.mode || 'login';

        // Initialize auth forms
        initAuthForms(mode);
    }

    // Animate Hero Stats
    function animateHeroStats() {
        const stats = document.querySelectorAll('.hero-stat .stat-value[data-count]');

        stats.forEach(function(stat) {
            const target = parseInt(stat.getAttribute('data-count'), 10);
            
            // Use Intersection Observer
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        Utils.animateCounter(stat, 0, target, 2000);
                        observer.unobserve(stat);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(stat);
        });
    }

    // Initialize Feature Cards
    function initFeatureCards() {
        const cards = document.querySelectorAll('.feature-card');

        cards.forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Initialize Testimonials Carousel
    function initTestimonialsCarousel() {
        const carousel = document.getElementById('testimonialsCarousel');
        if (!carousel) return;

        const track = carousel.querySelector('.carousel-track');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        const dots = carousel.querySelectorAll('.carousel-dots .dot');

        if (!track) return;

        let currentIndex = 0;
        const cards = track.querySelectorAll('.testimonial-card');
        const totalCards = cards.length;

        function updateCarousel() {
            // Update dots
            dots.forEach(function(dot, index) {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentIndex = (currentIndex - 1 + totalCards) % totalCards;
                updateCarousel();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentIndex = (currentIndex + 1) % totalCards;
                updateCarousel();
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                currentIndex = index;
                updateCarousel();
            });
        });

        // Auto-rotate
        setInterval(function() {
            currentIndex = (currentIndex + 1) % totalCards;
            updateCarousel();
        }, 5000);
    }

    // Load Market Data
    function loadMarketData() {
        const marketsGrid = document.getElementById('marketsGrid');
        if (!marketsGrid) return;

        // Show loading state
        marketsGrid.innerHTML = '<div class="loading-state"><div class="loader"></div><p>Loading markets...</p></div>';

        API.getMarketData('usd', 6)
            .then(function(data) {
                renderMarketCards(marketsGrid, data);
            })
            .catch(function(error) {
                marketsGrid.innerHTML = '<div class="error-state"><p>Failed to load market data</p><button class="btn-primary" onclick="App.loadMarketData()">Retry</button></div>';
            });
    }

    // Render Market Cards
    function renderMarketCards(container, data) {
        container.innerHTML = '';

        data.forEach(function(coin, index) {
            const isPositive = coin.price_change_percentage_24h >= 0;
            const changeClass = isPositive ? 'positive' : 'negative';
            const changeIcon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';

            const card = document.createElement('div');
            card.className = 'market-card';
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', (index * 100).toString());

            card.innerHTML = `
                <div class="market-header">
                    <img src="${coin.image}" alt="${coin.symbol}" class="market-icon">
                    <div class="market-name">
                        <h3>${coin.symbol.toUpperCase()}</h3>
                        <span>${coin.name}</span>
                    </div>
                </div>
                <div class="market-price">
                    <span class="current-price">$${coin.current_price.toLocaleString()}</span>
                </div>
                <div class="market-stats">
                    <div class="market-stat">
                        <span class="label">24h Change</span>
                        <span class="value ${changeClass}">
                            <i class="fas ${changeIcon}"></i>
                            ${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </span>
                    </div>
                    <div class="market-stat">
                        <span class="label">Market Cap</span>
                        <span class="value">$${Utils.formatCompact(coin.market_cap)}</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', function() {
                window.location.href = 'market.html?asset=' + coin.id;
            });

            container.appendChild(card);
        });

        // Refresh AOS
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    // Initialize Course Filters
    function initCourseFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const courseCards = document.querySelectorAll('.course-card');

        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');

                // Update active button
                filterBtns.forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');

                // Filter cards
                courseCards.forEach(function(card) {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeIn 0.5s ease';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Initialize Team Cards
    function initTeamCards() {
        const teamCards = document.querySelectorAll('.team-card');

        teamCards.forEach(function(card) {
            card.addEventListener('click', function() {
                const memberId = this.getAttribute('data-member');
                showTeamMemberModal(memberId);
            });
        });
    }

    // Initialize Contact Form
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Validate
            if (!data.name || !data.email || !data.message) {
                showToast('Please fill all required fields', 'error');
                return;
            }

            if (!Utils.isValidEmail(data.email)) {
                showToast('Please enter a valid email', 'error');
                return;
            }

            // Simulate submission
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            setTimeout(function() {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                form.reset();
                showToast('Message sent successfully!', 'success');
            }, 1500);
        });
    }

    // Initialize Auth Forms
    function initAuthForms(mode) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotForm = document.getElementById('forgotPasswordForm');

        // Show correct form
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(function(form) {
            form.style.display = 'none';
        });

        if (mode === 'login' && loginForm) {
            loginForm.style.display = 'block';
        } else if (mode === 'signup' && registerForm) {
            registerForm.style.display = 'block';
        } else if (mode === 'forgot' && forgotForm) {
            forgotForm.style.display = 'block';
        }

        // Login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleLogin(this);
            });
        }

        // Register form submission
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleRegister(this);
            });
        }

        // Forgot password form submission
        if (forgotForm) {
            forgotForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleForgotPassword(this);
            });
        }

        // Toggle password visibility
        const toggleBtns = document.querySelectorAll('.toggle-password');
        toggleBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const icon = this.querySelector('i');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });

        // Password strength meter
        const passwordInput = document.getElementById('registerPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                updatePasswordStrength(this.value);
            });
        }
    }

    // Handle Login
    function handleLogin(form) {
        const email = form.querySelector('[name="email"]').value;
        const password = form.querySelector('[name="password"]').value;
        const remember = form.querySelector('[name="remember"]');
        const rememberMe = remember ? remember.checked : false;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        Auth.login(email, password, rememberMe)
            .then(function(result) {
                showToast('Login successful!', 'success');
                setTimeout(function() {
                    Auth.redirectAfterLogin();
                }, 1000);
            })
            .catch(function(error) {
                showToast(error.error, 'error');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            });
    }

    // Handle Register
    function handleRegister(form) {
        const formData = new FormData(form);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            newsletter: formData.get('newsletter') === 'on'
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        Auth.register(data)
            .then(function(result) {
                showToast('Registration successful!', 'success');
                setTimeout(function() {
                    Auth.redirectAfterLogin();
                }, 1000);
            })
            .catch(function(error) {
                showToast(error.error, 'error');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            });
    }

    // Handle Forgot Password
    function handleForgotPassword(form) {
        const email = form.querySelector('[name="email"]').value;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        Auth.forgotPassword(email)
            .then(function(result) {
                showToast(result.message, 'success');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            })
            .catch(function(error) {
                showToast(error.error, 'error');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            });
    }

    // Update Password Strength
    function updatePasswordStrength(password) {
        const meter = document.querySelector('.password-strength-meter');
        const text = document.querySelector('.password-strength-text');
        
        if (!meter || !text) return;

        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const levels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
        const colors = ['#ff4444', '#ffaa00', '#ffff00', '#88ff00', '#00ff88'];

        meter.style.width = (strength * 20) + '%';
        meter.style.backgroundColor = colors[strength - 1] || '#ff4444';
        text.textContent = levels[strength - 1] || 'Very Weak';
    }

    // Handle Scroll
    function handleScroll() {
        state.scrollPosition = window.pageYOffset;

        // Header scroll effect
        if (elements.header) {
            if (state.scrollPosition > 50) {
                elements.header.classList.add('scrolled');
            } else {
                elements.header.classList.remove('scrolled');
            }
        }

        // Back to top button
        if (elements.backToTop) {
            if (state.scrollPosition > 300) {
                elements.backToTop.classList.add('visible');
            } else {
                elements.backToTop.classList.remove('visible');
            }
        }
    }

    // Handle Resize
    function handleResize() {
        // Close sidebar on desktop
        if (window.innerWidth >= 1024 && typeof Sidebar !== 'undefined') {
            const sidebarState = Sidebar.getState();
            if (sidebarState.isOpen) {
                Sidebar.close();
            }
        }

        // Refresh AOS
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    // Handle Keyboard Shortcuts
    function handleKeyboardShortcuts(e) {
        // Escape - Close modals/sidebar
        if (e.key === 'Escape') {
            if (typeof Sidebar !== 'undefined') {
                const sidebarState = Sidebar.getState();
                if (sidebarState.isOpen) {
                    Sidebar.close();
                }
            }
        }

        // Ctrl/Cmd + K - Search (Future feature)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            Utils.log('Search shortcut triggered', 'info');
        }
    }

    // Handle Visibility Change
    function handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause animations
            if (typeof ParticleSystem !== 'undefined') {
                ParticleSystem.pause();
            }
            if (typeof Ticker !== 'undefined') {
                Ticker.pause();
            }
        } else {
            // Page is visible - resume animations
            if (typeof ParticleSystem !== 'undefined') {
                ParticleSystem.resume();
            }
            if (typeof Ticker !== 'undefined') {
                Ticker.resume();
            }
        }
    }

    // Handle Auth State Change
    function handleAuthStateChange(e) {
        const detail = e.detail;
        
        Utils.log('Auth State Changed: ' + detail.type, 'info');

        // Update UI
        if (typeof Auth !== 'undefined') {
            Auth.updateUI();
        }
    }

    // Handle Newsletter Submit
    function handleNewsletterSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;

        if (!Utils.isValidEmail(email)) {
            showToast('Please enter a valid email', 'error');
            return;
        }

        // Simulate submission
        const btn = form.querySelector('button');
        btn.disabled = true;

        setTimeout(function() {
            form.reset();
            btn.disabled = false;
            showToast('Subscribed successfully!', 'success');
        }, 1000);
    }

    // Hide Preloader
    function hidePreloader() {
        const preloader = elements.preloader;
        const progress = elements.preloaderProgress;
        const percentage = elements.preloaderPercentage;

        if (!preloader) {
            state.isLoading = false;
            return;
        }

        let currentProgress = 0;
        const interval = setInterval(function() {
            currentProgress += Utils.random(5, 15);
            
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);

                // Hide preloader
                setTimeout(function() {
                    preloader.classList.add('hidden');
                    state.isLoading = false;

                    // Remove from DOM after animation
                    setTimeout(function() {
                        if (preloader.parentNode) {
                            preloader.parentNode.removeChild(preloader);
                        }
                    }, 500);
                }, 300);
            }

            if (progress) {
                progress.style.width = currentProgress + '%';
            }
            if (percentage) {
                percentage.textContent = currentProgress + '%';
            }
        }, 50);
    }

    // Show Toast Notification
    function showToast(message, type = 'info', duration = 4000) {
        const container = elements.toastContainer;
        if (!container) return;

        const icons = {
            success: 'fa-check',
            error: 'fa-times',
            warning: 'fa-exclamation',
            info: 'fa-info'
        };

        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[type] || icons.info}"></i>
            </div>
            <span class="toast-message">${message}</span>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', function() {
            removeToast(toast);
        });

        container.appendChild(toast);

        // Auto remove
        setTimeout(function() {
            removeToast(toast);
        }, duration);
    }

    // Remove Toast
    function removeToast(toast) {
        toast.classList.add('hiding');
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // Show Team Member Modal
    function showTeamMemberModal(memberId) {
        Utils.log('Show team member: ' + memberId, 'info');
        // Implement modal functionality
    }

    // Public API
    return {
        init: init,
        showToast: showToast,
        loadMarketData: loadMarketData,
        getState: function() { return state; }
    };

})();

// Make App globally available
window.App = App;

// Initialize App when DOM is ready
Utils.ready(function() {
    App.init();
});

// Log initialization
Utils.log('Main Module Loaded', 'success');