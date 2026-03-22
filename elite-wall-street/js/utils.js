/* ================================================
   ELITE WALL STREET - Utility Functions
   ================================================ */

// Utility Object
const Utils = {
    
    // DOM Ready Function
    ready: function(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    },

    // Select Single Element
    select: function(selector, parent = document) {
        return parent.querySelector(selector);
    },

    // Select Multiple Elements
    selectAll: function(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },

    // Add Event Listener
    on: function(element, event, handler, options = false) {
        if (element) {
            element.addEventListener(event, handler, options);
        }
    },

    // Add Event to Multiple Elements
    onAll: function(elements, event, handler, options = false) {
        elements.forEach(function(element) {
            element.addEventListener(event, handler, options);
        });
    },

    // Remove Event Listener
    off: function(element, event, handler) {
        if (element) {
            element.removeEventListener(event, handler);
        }
    },

    // Add Class
    addClass: function(element, className) {
        if (element) {
            element.classList.add(className);
        }
    },

    // Remove Class
    removeClass: function(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    },

    // Toggle Class
    toggleClass: function(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },

    // Has Class
    hasClass: function(element, className) {
        if (element) {
            return element.classList.contains(className);
        }
        return false;
    },

    // Set Attribute
    setAttr: function(element, attr, value) {
        if (element) {
            element.setAttribute(attr, value);
        }
    },

    // Get Attribute
    getAttr: function(element, attr) {
        if (element) {
            return element.getAttribute(attr);
        }
        return null;
    },

    // Set CSS Style
    setStyle: function(element, property, value) {
        if (element) {
            element.style[property] = value;
        }
    },

    // Set Multiple CSS Styles
    setStyles: function(element, styles) {
        if (element) {
            Object.keys(styles).forEach(function(property) {
                element.style[property] = styles[property];
            });
        }
    },

    // Get Computed Style
    getStyle: function(element, property) {
        if (element) {
            return window.getComputedStyle(element).getPropertyValue(property);
        }
        return null;
    },

    // Show Element
    show: function(element, display = 'block') {
        if (element) {
            element.style.display = display;
        }
    },

    // Hide Element
    hide: function(element) {
        if (element) {
            element.style.display = 'none';
        }
    },

    // Fade In
    fadeIn: function(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = 0;
        element.style.display = 'block';
        element.style.transition = 'opacity ' + duration + 'ms ease';
        
        setTimeout(function() {
            element.style.opacity = 1;
        }, 10);
    },

    // Fade Out
    fadeOut: function(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = 1;
        element.style.transition = 'opacity ' + duration + 'ms ease';
        element.style.opacity = 0;
        
        setTimeout(function() {
            element.style.display = 'none';
        }, duration);
    },

    // Slide Down
    slideDown: function(element, duration = 300) {
        if (!element) return;
        
        element.style.display = 'block';
        var height = element.scrollHeight;
        element.style.overflow = 'hidden';
        element.style.height = '0';
        element.style.transition = 'height ' + duration + 'ms ease';
        
        setTimeout(function() {
            element.style.height = height + 'px';
        }, 10);
        
        setTimeout(function() {
            element.style.height = '';
            element.style.overflow = '';
        }, duration);
    },

    // Slide Up
    slideUp: function(element, duration = 300) {
        if (!element) return;
        
        element.style.overflow = 'hidden';
        element.style.height = element.scrollHeight + 'px';
        element.style.transition = 'height ' + duration + 'ms ease';
        
        setTimeout(function() {
            element.style.height = '0';
        }, 10);
        
        setTimeout(function() {
            element.style.display = 'none';
            element.style.height = '';
            element.style.overflow = '';
        }, duration);
    },

    // Debounce Function
    debounce: function(func, wait = 100) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    },

    // Throttle Function
    throttle: function(func, limit = 100) {
        var inThrottle;
        return function() {
            var context = this;
            var args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    },

    // Format Number with Commas
    formatNumber: function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Format Currency
    formatCurrency: function(amount, currency = 'USD', locale = 'en-US') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    // Format Percentage
    formatPercent: function(value, decimals = 2) {
        var sign = value >= 0 ? '+' : '';
        return sign + value.toFixed(decimals) + '%';
    },

    // Format Large Numbers (K, M, B)
    formatCompact: function(number) {
        if (number >= 1000000000) {
            return (number / 1000000000).toFixed(1) + 'B';
        }
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        }
        if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        return number.toString();
    },

    // Generate Random Number
    random: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Generate Random Float
    randomFloat: function(min, max, decimals = 2) {
        var value = Math.random() * (max - min) + min;
        return parseFloat(value.toFixed(decimals));
    },

    // Generate UUID
    uuid: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Deep Clone Object
    clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Check if Object is Empty
    isEmpty: function(obj) {
        if (obj === null || obj === undefined) return true;
        if (typeof obj === 'string') return obj.trim() === '';
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return false;
    },

    // Get URL Parameters
    getUrlParams: function() {
        var params = {};
        var search = window.location.search.substring(1);
        if (search) {
            search.split('&').forEach(function(param) {
                var pair = param.split('=');
                params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            });
        }
        return params;
    },

    // Set URL Parameter
    setUrlParam: function(key, value) {
        var url = new URL(window.location.href);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
    },

    // Local Storage Get
    storageGet: function(key) {
        try {
            var item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage Get Error:', e);
            return null;
        }
    },

    // Local Storage Set
    storageSet: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage Set Error:', e);
            return false;
        }
    },

    // Local Storage Remove
    storageRemove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage Remove Error:', e);
            return false;
        }
    },

    // Session Storage Get
    sessionGet: function(key) {
        try {
            var item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Session Get Error:', e);
            return null;
        }
    },

    // Session Storage Set
    sessionSet: function(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Session Set Error:', e);
            return false;
        }
    },

    // Cookie Get
    getCookie: function(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    },

    // Cookie Set
    setCookie: function(name, value, days = 30) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
    },

    // Cookie Delete
    deleteCookie: function(name) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    },

    // Validate Email
    isValidEmail: function(email) {
        var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Validate Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
    isValidPassword: function(password) {
        var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    },

    // Capitalize First Letter
    capitalize: function(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    // Truncate String
    truncate: function(str, length = 100, suffix = '...') {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length).trim() + suffix;
    },

    // Scroll To Element
    scrollTo: function(element, offset = 0, duration = 500) {
        if (!element) return;
        
        var targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    // Scroll To Top
    scrollToTop: function(duration = 500) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },

    // Check if Element in Viewport
    isInViewport: function(element, threshold = 0) {
        if (!element) return false;
        
        var rect = element.getBoundingClientRect();
        return (
            rect.top >= -threshold &&
            rect.left >= -threshold &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) + threshold
        );
    },

    // Get Scroll Position
    getScrollPosition: function() {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    },

    // Device Detection
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isIOS: function() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },

    isAndroid: function() {
        return /Android/.test(navigator.userAgent);
    },

    isTouchDevice: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Get Browser Info
    getBrowser: function() {
        var ua = navigator.userAgent;
        var browser = 'Unknown';
        
        if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
        else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
        else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
        else if (ua.indexOf('Edg') > -1) browser = 'Edge';
        else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) browser = 'IE';
        
        return browser;
    },

    // Copy to Clipboard
    copyToClipboard: function(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        
        // Fallback
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return Promise.resolve();
        } catch (e) {
            document.body.removeChild(textarea);
            return Promise.reject(e);
        }
    },

    // Animate Counter
    animateCounter: function(element, start, end, duration = 2000) {
        if (!element) return;
        
        var startTime = null;
        var step = function(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var value = Math.floor(progress * (end - start) + start);
            element.textContent = Utils.formatNumber(value);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    },

    // Create Element
    createElement: function(tag, attributes = {}, content = '') {
        var element = document.createElement(tag);
        
        Object.keys(attributes).forEach(function(attr) {
            if (attr === 'class') {
                element.className = attributes[attr];
            } else if (attr === 'style' && typeof attributes[attr] === 'object') {
                Object.assign(element.style, attributes[attr]);
            } else {
                element.setAttribute(attr, attributes[attr]);
            }
        });
        
        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else if (content instanceof Element) {
                element.appendChild(content);
            }
        }
        
        return element;
    },

    // Wait/Delay
    wait: function(ms) {
        return new Promise(function(resolve) {
            setTimeout(resolve, ms);
        });
    },

    // Log with Styling
    log: function(message, type = 'info') {
        var styles = {
            info: 'color: #00aaff; font-weight: bold;',
            success: 'color: #00ff88; font-weight: bold;',
            warning: 'color: #ffaa00; font-weight: bold;',
            error: 'color: #ff4444; font-weight: bold;'
        };
        console.log('%c[EWS] ' + message, styles[type] || styles.info);
    }
};

// Make Utils globally available
window.Utils = Utils;

// Log initialization
Utils.log('Utils Module Loaded', 'success');