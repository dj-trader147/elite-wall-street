/* ================================================
   ELITE WALL STREET - Sidebar Controller
   ================================================ */

const Sidebar = (function() {

    // DOM Elements
    let sidebar = null;
    let overlay = null;
    let hamburgerBtn = null;
    let closeBtn = null;
    let body = null;

    // State
    let isOpen = false;
    let isAnimating = false;

    // Configuration
    const config = {
        animationDuration: 400,
        bodyClass: 'sidebar-open',
        activeClass: 'active'
    };

    // Initialize
    function init() {
        // Get DOM elements
        sidebar = document.getElementById('sidebar');
        overlay = document.getElementById('sidebarOverlay');
        hamburgerBtn = document.getElementById('hamburgerBtn');
        closeBtn = document.getElementById('closeSidebar');
        body = document.body;

        if (!sidebar || !hamburgerBtn) {
            console.warn('Sidebar elements not found');
            return false;
        }

        // Bind events
        bindEvents();

        Utils.log('Sidebar Initialized', 'success');
        return true;
    }

    // Bind Events
    function bindEvents() {
        // Hamburger button click
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggle();
            });
        }

        // Close button click
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                close();
            });
        }

        // Overlay click
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                e.preventDefault();
                close();
            });
        }

        // Escape key press
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                close();
            }
        });

        // Sidebar link clicks
        const sidebarLinks = sidebar.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Close sidebar after clicking a link (mobile)
                if (window.innerWidth < 1024) {
                    setTimeout(function() {
                        close();
                    }, 150);
                }
            });
        });

        // Prevent body scroll when sidebar is open (touch devices)
        sidebar.addEventListener('touchmove', function(e) {
            e.stopPropagation();
        }, { passive: true });

        // Window resize handler
        window.addEventListener('resize', Utils.debounce(function() {
            if (window.innerWidth >= 1024 && isOpen) {
                close();
            }
        }, 250));
    }

    // Open Sidebar
    function open() {
        if (isOpen || isAnimating) return;

        isAnimating = true;

        // Add classes
        Utils.addClass(sidebar, config.activeClass);
        Utils.addClass(overlay, config.activeClass);
        Utils.addClass(hamburgerBtn, config.activeClass);
        Utils.addClass(body, config.bodyClass);

        isOpen = true;

        // Animate sidebar items
        animateSidebarItems();

        // Focus trap
        trapFocus();

        setTimeout(function() {
            isAnimating = false;
        }, config.animationDuration);

        Utils.log('Sidebar Opened', 'info');
    }

    // Close Sidebar
    function close() {
        if (!isOpen || isAnimating) return;

        isAnimating = true;

        // Remove classes
        Utils.removeClass(sidebar, config.activeClass);
        Utils.removeClass(overlay, config.activeClass);
        Utils.removeClass(hamburgerBtn, config.activeClass);
        Utils.removeClass(body, config.bodyClass);

        isOpen = false;

        // Release focus trap
        releaseFocus();

        setTimeout(function() {
            isAnimating = false;
        }, config.animationDuration);

        Utils.log('Sidebar Closed', 'info');
    }

    // Toggle Sidebar
    function toggle() {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }

    // Animate Sidebar Items
    function animateSidebarItems() {
        const items = sidebar.querySelectorAll('.sidebar-item');
        
        items.forEach(function(item, index) {
            item.style.opacity = '0';
            item.style.transform = 'translateX(30px)';
            
            setTimeout(function() {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100 + (index * 50));
        });
    }

    // Animate Counter Numbers
    function animateCounters() {
        const counters = sidebar.querySelectorAll('.stat-number[data-count]');
        
        counters.forEach(function(counter) {
            const target = parseInt(counter.getAttribute('data-count'), 10);
            Utils.animateCounter(counter, 0, target, 1500);
        });
    }

    // Focus Trap (Accessibility)
    function trapFocus() {
        const focusableElements = sidebar.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element
        firstElement.focus();

        // Handle tab key
        sidebar.addEventListener('keydown', handleTabKey);

        function handleTabKey(e) {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }

        // Store handler for removal
        sidebar._tabHandler = handleTabKey;
    }

    // Release Focus Trap
    function releaseFocus() {
        if (sidebar._tabHandler) {
            sidebar.removeEventListener('keydown', sidebar._tabHandler);
            delete sidebar._tabHandler;
        }

        // Return focus to hamburger button
        if (hamburgerBtn) {
            hamburgerBtn.focus();
        }
    }

    // Set Active Link
    function setActiveLink(href) {
        const links = sidebar.querySelectorAll('.sidebar-link');
        
        links.forEach(function(link) {
            Utils.removeClass(link, config.activeClass);
            
            if (link.getAttribute('href') === href) {
                Utils.addClass(link, config.activeClass);
            }
        });
    }

    // Highlight Active Page
    function highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        const links = sidebar.querySelectorAll('.sidebar-link');
        
        links.forEach(function(link) {
            const href = link.getAttribute('href');
            
            Utils.removeClass(link, config.activeClass);
            
            if (href === currentPage || 
                (currentPage === '' && href === 'index.html') ||
                (currentPage === '/' && href === 'index.html')) {
                Utils.addClass(link, config.activeClass);
            }
        });
    }

    // Update Stats
    function updateStats(stats) {
        if (stats.members) {
            const membersEl = sidebar.querySelector('.stat-number[data-count]');
            if (membersEl) {
                membersEl.setAttribute('data-count', stats.members);
                membersEl.textContent = Utils.formatNumber(stats.members);
            }
        }
        
        if (stats.trades) {
            const tradesEl = sidebar.querySelectorAll('.stat-number[data-count]')[1];
            if (tradesEl) {
                tradesEl.setAttribute('data-count', stats.trades);
                tradesEl.textContent = Utils.formatNumber(stats.trades);
            }
        }
    }

    // Get State
    function getState() {
        return {
            isOpen: isOpen,
            isAnimating: isAnimating
        };
    }

    // Destroy
    function destroy() {
        close();

        // Remove event listeners
        if (hamburgerBtn) {
            hamburgerBtn.removeEventListener('click', toggle);
        }
        
        if (closeBtn) {
            closeBtn.removeEventListener('click', close);
        }
        
        if (overlay) {
            overlay.removeEventListener('click', close);
        }

        // Reset variables
        sidebar = null;
        overlay = null;
        hamburgerBtn = null;
        closeBtn = null;
        isOpen = false;
        isAnimating = false;

        Utils.log('Sidebar Destroyed', 'warning');
    }

    // Public API
    return {
        init: init,
        open: open,
        close: close,
        toggle: toggle,
        setActiveLink: setActiveLink,
        highlightCurrentPage: highlightCurrentPage,
        updateStats: updateStats,
        animateCounters: animateCounters,
        getState: getState,
        destroy: destroy
    };

})();

// Make Sidebar globally available
window.Sidebar = Sidebar;

// Log initialization
Utils.log('Sidebar Module Loaded', 'success');