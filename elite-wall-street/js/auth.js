/* ================================================
   ELITE WALL STREET - Authentication System
   ================================================ */

const Auth = (function() {

    // Configuration
    const config = {
        storageKey: 'ews_user',
        sessionKey: 'ews_session',
        tokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
        minPasswordLength: 8,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes
    };

    // State
    let currentUser = null;
    let isAuthenticated = false;
    let loginAttempts = 0;
    let lockoutUntil = null;

    // Initialize
    function init() {
        // Check for existing session
        checkSession();

        // Listen for storage changes (multi-tab sync)
        window.addEventListener('storage', function(e) {
            if (e.key === config.storageKey) {
                checkSession();
            }
        });

        Utils.log('Auth Module Initialized', 'success');
        return isAuthenticated;
    }

    // Check Existing Session
    function checkSession() {
        const session = Utils.storageGet(config.sessionKey);
        const user = Utils.storageGet(config.storageKey);

        if (session && user) {
            // Check if session is expired
            if (Date.now() < session.expiry) {
                currentUser = user;
                isAuthenticated = true;
                Utils.log('Session Restored: ' + user.email, 'info');
                
                // Dispatch auth event
                dispatchAuthEvent('sessionRestored', user);
            } else {
                // Session expired
                logout();
                Utils.log('Session Expired', 'warning');
            }
        }

        return isAuthenticated;
    }

    // Register New User
    function register(userData) {
        return new Promise(function(resolve, reject) {
            // Validate input
            const validation = validateRegistration(userData);
            if (!validation.valid) {
                reject({ success: false, error: validation.error });
                return;
            }

            // Check if user already exists
            const existingUsers = Utils.storageGet('ews_users') || [];
            const userExists = existingUsers.some(function(u) {
                return u.email.toLowerCase() === userData.email.toLowerCase();
            });

            if (userExists) {
                reject({ success: false, error: 'Email already registered' });
                return;
            }

            // Create new user
            const newUser = {
                id: Utils.uuid(),
                firstName: userData.firstName.trim(),
                lastName: userData.lastName.trim(),
                email: userData.email.toLowerCase().trim(),
                password: hashPassword(userData.password),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                settings: {
                    theme: 'dark',
                    notifications: true,
                    newsletter: userData.newsletter || false
                },
                profile: {
                    avatar: null,
                    bio: '',
                    location: '',
                    website: ''
                },
                stats: {
                    trades: 0,
                    profit: 0,
                    winRate: 0
                }
            };

            // Save user
            existingUsers.push(newUser);
            Utils.storageSet('ews_users', existingUsers);

            // Auto login after registration
            const userWithoutPassword = { ...newUser };
            delete userWithoutPassword.password;

            createSession(userWithoutPassword);

            Utils.log('User Registered: ' + newUser.email, 'success');
            
            // Dispatch event
            dispatchAuthEvent('registered', userWithoutPassword);

            resolve({ 
                success: true, 
                message: 'Registration successful',
                user: userWithoutPassword 
            });
        });
    }

    // Login User
    function login(email, password, rememberMe = false) {
        return new Promise(function(resolve, reject) {
            // Check lockout
            if (isLockedOut()) {
                const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000);
                reject({ 
                    success: false, 
                    error: 'Account locked. Try again in ' + remaining + ' minutes' 
                });
                return;
            }

            // Validate input
            if (!email || !password) {
                reject({ success: false, error: 'Email and password are required' });
                return;
            }

            if (!Utils.isValidEmail(email)) {
                reject({ success: false, error: 'Invalid email format' });
                return;
            }

            // Find user
            const users = Utils.storageGet('ews_users') || [];
            const user = users.find(function(u) {
                return u.email.toLowerCase() === email.toLowerCase();
            });

            if (!user) {
                handleFailedLogin();
                reject({ success: false, error: 'Invalid email or password' });
                return;
            }

            // Verify password
            if (user.password !== hashPassword(password)) {
                handleFailedLogin();
                reject({ success: false, error: 'Invalid email or password' });
                return;
            }

            // Success - reset login attempts
            loginAttempts = 0;
            lockoutUntil = null;

            // Create session
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;

            createSession(userWithoutPassword, rememberMe);

            Utils.log('User Logged In: ' + user.email, 'success');

            // Dispatch event
            dispatchAuthEvent('loggedIn', userWithoutPassword);

            resolve({ 
                success: true, 
                message: 'Login successful',
                user: userWithoutPassword 
            });
        });
    }

    // Logout User
    function logout() {
        const user = currentUser;

        // Clear session
        Utils.storageRemove(config.sessionKey);
        Utils.storageRemove(config.storageKey);

        currentUser = null;
        isAuthenticated = false;

        Utils.log('User Logged Out', 'info');

        // Dispatch event
        dispatchAuthEvent('loggedOut', user);

        return { success: true, message: 'Logged out successfully' };
    }

    // Create Session
    function createSession(user, rememberMe = false) {
        const expiry = rememberMe 
            ? Date.now() + config.tokenExpiry 
            : Date.now() + (24 * 60 * 60 * 1000); // 24 hours

        const session = {
            token: Utils.uuid(),
            userId: user.id,
            expiry: expiry,
            createdAt: Date.now()
        };

        Utils.storageSet(config.sessionKey, session);
        Utils.storageSet(config.storageKey, user);

        currentUser = user;
        isAuthenticated = true;
    }

    // Update User Profile
    function updateProfile(updates) {
        return new Promise(function(resolve, reject) {
            if (!isAuthenticated || !currentUser) {
                reject({ success: false, error: 'Not authenticated' });
                return;
            }

            // Get all users
            const users = Utils.storageGet('ews_users') || [];
            const userIndex = users.findIndex(function(u) {
                return u.id === currentUser.id;
            });

            if (userIndex === -1) {
                reject({ success: false, error: 'User not found' });
                return;
            }

            // Update user data
            const updatedUser = {
                ...users[userIndex],
                firstName: updates.firstName || users[userIndex].firstName,
                lastName: updates.lastName || users[userIndex].lastName,
                profile: {
                    ...users[userIndex].profile,
                    ...updates.profile
                },
                settings: {
                    ...users[userIndex].settings,
                    ...updates.settings
                },
                updatedAt: Date.now()
            };

            // Save
            users[userIndex] = updatedUser;
            Utils.storageSet('ews_users', users);

            // Update current user
            const userWithoutPassword = { ...updatedUser };
            delete userWithoutPassword.password;
            
            currentUser = userWithoutPassword;
            Utils.storageSet(config.storageKey, userWithoutPassword);

            Utils.log('Profile Updated: ' + currentUser.email, 'success');

            // Dispatch event
            dispatchAuthEvent('profileUpdated', userWithoutPassword);

            resolve({ 
                success: true, 
                message: 'Profile updated',
                user: userWithoutPassword 
            });
        });
    }

    // Change Password
    function changePassword(currentPassword, newPassword) {
        return new Promise(function(resolve, reject) {
            if (!isAuthenticated || !currentUser) {
                reject({ success: false, error: 'Not authenticated' });
                return;
            }

            // Validate new password
            if (!validatePassword(newPassword)) {
                reject({ 
                    success: false, 
                    error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
                });
                return;
            }

            // Get all users
            const users = Utils.storageGet('ews_users') || [];
            const userIndex = users.findIndex(function(u) {
                return u.id === currentUser.id;
            });

            if (userIndex === -1) {
                reject({ success: false, error: 'User not found' });
                return;
            }

            // Verify current password
            if (users[userIndex].password !== hashPassword(currentPassword)) {
                reject({ success: false, error: 'Current password is incorrect' });
                return;
            }

            // Update password
            users[userIndex].password = hashPassword(newPassword);
            users[userIndex].updatedAt = Date.now();

            Utils.storageSet('ews_users', users);

            Utils.log('Password Changed: ' + currentUser.email, 'success');

            resolve({ success: true, message: 'Password changed successfully' });
        });
    }

    // Forgot Password (Simulated)
    function forgotPassword(email) {
        return new Promise(function(resolve, reject) {
            if (!email || !Utils.isValidEmail(email)) {
                reject({ success: false, error: 'Valid email is required' });
                return;
            }

            // Check if user exists
            const users = Utils.storageGet('ews_users') || [];
            const user = users.find(function(u) {
                return u.email.toLowerCase() === email.toLowerCase();
            });

            // Always show success message for security
            Utils.log('Password Reset Requested: ' + email, 'info');

            // Simulate email sending
            setTimeout(function() {
                resolve({ 
                    success: true, 
                    message: 'If an account exists, a password reset link has been sent.' 
                });
            }, 1000);
        });
    }

    // Delete Account
    function deleteAccount(password) {
        return new Promise(function(resolve, reject) {
            if (!isAuthenticated || !currentUser) {
                reject({ success: false, error: 'Not authenticated' });
                return;
            }

            // Get all users
            const users = Utils.storageGet('ews_users') || [];
            const userIndex = users.findIndex(function(u) {
                return u.id === currentUser.id;
            });

            if (userIndex === -1) {
                reject({ success: false, error: 'User not found' });
                return;
            }

            // Verify password
            if (users[userIndex].password !== hashPassword(password)) {
                reject({ success: false, error: 'Incorrect password' });
                return;
            }

            // Remove user
            const deletedUser = users.splice(userIndex, 1)[0];
            Utils.storageSet('ews_users', users);

            // Logout
            logout();

            Utils.log('Account Deleted: ' + deletedUser.email, 'warning');

            // Dispatch event
            dispatchAuthEvent('accountDeleted', { email: deletedUser.email });

            resolve({ success: true, message: 'Account deleted successfully' });
        });
    }

    // Validate Registration Data
    function validateRegistration(data) {
        if (!data.firstName || data.firstName.trim().length < 2) {
            return { valid: false, error: 'First name is required (min 2 characters)' };
        }

        if (!data.lastName || data.lastName.trim().length < 2) {
            return { valid: false, error: 'Last name is required (min 2 characters)' };
        }

        if (!data.email || !Utils.isValidEmail(data.email)) {
            return { valid: false, error: 'Valid email is required' };
        }

        if (!data.password || !validatePassword(data.password)) {
            return { 
                valid: false, 
                error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
            };
        }

        if (data.password !== data.confirmPassword) {
            return { valid: false, error: 'Passwords do not match' };
        }

        return { valid: true };
    }

    // Validate Password
    function validatePassword(password) {
        if (!password || password.length < config.minPasswordLength) {
            return false;
        }

        // Check for uppercase, lowercase, and number
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        return hasUppercase && hasLowercase && hasNumber;
    }

    // Hash Password (Simple hash for demo - use proper hashing in production)
    function hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'ews_' + Math.abs(hash).toString(16);
    }

    // Handle Failed Login
    function handleFailedLogin() {
        loginAttempts++;

        if (loginAttempts >= config.maxLoginAttempts) {
            lockoutUntil = Date.now() + config.lockoutDuration;
            Utils.log('Account locked due to too many failed attempts', 'error');
        }
    }

    // Check if Locked Out
    function isLockedOut() {
        if (lockoutUntil && Date.now() < lockoutUntil) {
            return true;
        }

        // Reset lockout
        lockoutUntil = null;
        loginAttempts = 0;
        return false;
    }

    // Dispatch Auth Event
    function dispatchAuthEvent(type, data) {
        window.dispatchEvent(new CustomEvent('authStateChange', {
            detail: {
                type: type,
                data: data,
                isAuthenticated: isAuthenticated,
                timestamp: Date.now()
            }
        }));
    }

    // Get Current User
    function getUser() {
        return currentUser;
    }

    // Check if Authenticated
    function isLoggedIn() {
        return isAuthenticated;
    }

    // Get User Full Name
    function getFullName() {
        if (!currentUser) return '';
        return currentUser.firstName + ' ' + currentUser.lastName;
    }

    // Get User Initials
    function getInitials() {
        if (!currentUser) return '';
        return (currentUser.firstName[0] + currentUser.lastName[0]).toUpperCase();
    }

    // Require Auth (Redirect if not logged in)
    function requireAuth(redirectUrl = 'auth.html?mode=login') {
        if (!isAuthenticated) {
            // Store intended destination
            Utils.sessionSet('ews_redirect', window.location.href);
            
            // Redirect to login
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Redirect After Login
    function redirectAfterLogin(defaultUrl = 'index.html') {
        const redirect = Utils.sessionGet('ews_redirect');
        Utils.storageRemove('ews_redirect');
        
        window.location.href = redirect || defaultUrl;
    }

    // Update UI Based on Auth State
    function updateUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const sidebarAuth = document.querySelector('.sidebar-auth');

        if (isAuthenticated && currentUser) {
            // Update header auth buttons
            if (authButtons) {
                authButtons.innerHTML = `
                    <div class="user-menu">
                        <button class="user-avatar" id="userMenuBtn">
                            <span class="avatar-initials">${getInitials()}</span>
                        </button>
                        <div class="user-dropdown" id="userDropdown">
                            <div class="dropdown-header">
                                <span class="user-name">${getFullName()}</span>
                                <span class="user-email">${currentUser.email}</span>
                            </div>
                            <div class="dropdown-divider"></div>
                            <a href="profile.html" class="dropdown-item">
                                <i class="fas fa-user"></i> Profile
                            </a>
                            <a href="settings.html" class="dropdown-item">
                                <i class="fas fa-cog"></i> Settings
                            </a>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item logout-btn" id="logoutBtn">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
                    </div>
                `;

                // Bind logout event
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', function() {
                        logout();
                        window.location.href = 'index.html';
                    });
                }
            }

            // Update sidebar auth
            if (sidebarAuth) {
                sidebarAuth.innerHTML = `
                    <div class="sidebar-user">
                        <div class="sidebar-avatar">
                            <span>${getInitials()}</span>
                        </div>
                        <div class="sidebar-user-info">
                            <span class="sidebar-user-name">${getFullName()}</span>
                            <span class="sidebar-user-email">${currentUser.email}</span>
                        </div>
                    </div>
                    <button class="sidebar-btn logout" id="sidebarLogoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                `;

                // Bind sidebar logout event
                const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
                if (sidebarLogoutBtn) {
                    sidebarLogoutBtn.addEventListener('click', function() {
                        logout();
                        window.location.href = 'index.html';
                    });
                }
            }
        }
    }

    // Public API
    return {
        init: init,
        register: register,
        login: login,
        logout: logout,
        updateProfile: updateProfile,
        changePassword: changePassword,
        forgotPassword: forgotPassword,
        deleteAccount: deleteAccount,
        getUser: getUser,
        isLoggedIn: isLoggedIn,
        getFullName: getFullName,
        getInitials: getInitials,
        requireAuth: requireAuth,
        redirectAfterLogin: redirectAfterLogin,
        updateUI: updateUI,
        validatePassword: validatePassword,
        checkSession: checkSession
    };

})();

// Make Auth globally available
window.Auth = Auth;

// Log initialization
Utils.log('Auth Module Loaded', 'success');