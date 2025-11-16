/**
 * ============================================================================
 * FIREBASE AUTHENTICATION SYSTEM
 * ============================================================================
 *
 * PURPOSE:
 * This system provides cloud-based authentication using Firebase, allowing users
 * to login from multiple devices and have their data synchronized across platforms.
 *
 * KEY FEATURES:
 * - Cross-device login (login on phone, continue on laptop)
 * - Cloud-based user management via Firebase
 * - Automatic fallback to local storage if Firebase is unavailable
 * - Session persistence and state management
 * - Secure PIN-based authentication (4 digits)
 *
 * HOW IT WORKS:
 * 1. Converts usernames to email format (username@databhandaar.local) for Firebase
 * 2. Uses Firebase Authentication API for user creation and login
 * 3. Stores session data locally for quick access
 * 4. Listens to Firebase auth state changes for real-time updates
 *
 * INTERVIEW TIP:
 * Explain that Firebase allows the app to work across devices while maintaining
 * a simple 4-digit PIN system instead of complex passwords.
 * ============================================================================
 */

class FirebaseAuthSystem {
    /**
     * Constructor - Initializes the Firebase authentication system
     *
     * PROPERTIES:
     * @property {Object} auth - Firebase authentication instance
     * @property {Object} currentUser - Currently logged in Firebase user
     * @property {Object} storageSystem - Reference to the storage manager
     */
    constructor() {
        this.auth = null;              // Will hold Firebase Auth instance
        this.currentUser = null;       // Currently authenticated user
        this.storageSystem = null;     // Storage system (initialized separately)
        this.init();                   // Start initialization process
    }

    /**
     * Initialize Firebase Authentication
     *
     * PROCESS:
     * 1. Check if Firebase SDK is loaded
     * 2. Initialize Firebase app with config from firebase-config.js
     * 3. Set up auth state listener (monitors login/logout events)
     * 4. Set up appropriate page listeners based on current page
     *
     * FALLBACK:
     * If Firebase fails, falls back to localStorage-based authentication
     */
    async init() {
        console.log('Initializing Firebase Auth System...');

        // Initialize Firebase
        try {
            // Check if Firebase SDK is loaded from CDN
            if (typeof firebase === 'undefined') {
                console.error('Firebase SDK not loaded. Please include Firebase scripts in HTML.');
                this.fallbackToLocalStorage();
                return;
            }

            // Initialize Firebase app with config (only if not already initialized)
            if (!firebase.apps.length) {
                firebase.initializeApp(window.firebaseConfig);
                console.log('Firebase initialized successfully');
            }

            // Get Firebase Authentication instance
            this.auth = firebase.auth();

            /**
             * Auth State Listener - Monitors authentication changes
             * This fires whenever user logs in, logs out, or refreshes page
             * Allows real-time sync across devices
             */
            this.auth.onAuthStateChanged((user) => {
                console.log('Auth state changed:', user ? user.email : 'No user');
                this.currentUser = user;

                // If user is logged in and we're not on login page, update session
                if (user && !window.location.pathname.includes('login.html')) {
                    this.handleAuthenticatedUser(user);
                }
            });

        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.fallbackToLocalStorage();  // Fall back to local auth
            return;
        }

        // Determine which page we're on and set up appropriate listeners
        if (window.location.pathname.includes('login.html') ||
            window.location.pathname === '/login.html' ||
            document.getElementById('loginForm')) {
            // We're on the login page - set up login/signup forms
            this.setupLoginPageListeners();
        } else {
            // We're on the main app - verify user is logged in
            this.checkAndRedirect();
        }
    }

    /**
     * Fallback to Local Storage Authentication
     *
     * WHY: If Firebase is not available (offline, SDK not loaded, etc.),
     * the app can still work using browser's localStorage
     *
     * This creates a basic user database in the browser
     */
    fallbackToLocalStorage() {
        console.warn('Falling back to localStorage authentication');
        // Create a Map to store user data (Map allows fast lookups by username)
        this.users = new Map();
        this.loadLocalUsers();  // Load any existing users from localStorage
    }

    /**
     * Load Users from Local Storage
     *
     * Retrieves previously registered users from browser's localStorage
     * Users are stored as a JSON array of [username, userData] pairs
     */
    loadLocalUsers() {
        const storedUsers = localStorage.getItem('data_bhandaar_users');
        if (storedUsers) {
            try {
                const usersArray = JSON.parse(storedUsers);
                this.users = new Map(usersArray);  // Convert array back to Map
                console.log('Loaded local users:', Array.from(this.users.keys()));
            } catch (e) {
                console.error('Error loading local users:', e);
            }
        }
    }

    /**
     * Setup Login Page Event Listeners
     *
     * Attaches event handlers to all login/signup form elements:
     * - Login form submission
     * - Signup form submission
     * - Switch between login and signup views
     *
     * Also clears any existing session (forces re-login)
     */
    setupLoginPageListeners() {
        // Get references to all form elements
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const switchToSignup = document.getElementById('switchToSignup');
        const switchToLogin = document.getElementById('switchToLogin');

        // Attach submit handler to login form
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Attach submit handler to signup form
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Attach click handler to "Create Account" link
        if (switchToSignup) {
            switchToSignup.addEventListener('click', () => this.switchToSignup());
        }

        // Attach click handler to "Back to Login" link
        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => this.switchToLogin());
        }

        // Clear any existing session when on login page (forces fresh login)
        this.clearLocalSession();
    }

    /**
     * Switch to Signup Form
     *
     * Hides login form and shows signup form
     * Used when user clicks "Create Account"
     */
    switchToSignup() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        if (loginForm && signupForm) {
            loginForm.style.display = 'none';      // Hide login
            signupForm.style.display = 'flex';     // Show signup
            this.clearErrors();                    // Clear any error messages
        }
    }

    /**
     * Switch to Login Form
     *
     * Hides signup form and shows login form
     * Used when user clicks "Back to Login"
     */
    switchToLogin() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        if (loginForm && signupForm) {
            signupForm.style.display = 'none';     // Hide signup
            loginForm.style.display = 'flex';      // Show login
            this.clearErrors();                    // Clear any error messages
        }
    }

    /**
     * Clear Error Messages
     *
     * Hides all error message elements on the login page
     * Used when switching between forms
     */
    clearErrors() {
        const errorMessage = document.getElementById('errorMessage');
        const signupErrorMessage = document.getElementById('signupErrorMessage');
        if (errorMessage) errorMessage.style.display = 'none';
        if (signupErrorMessage) signupErrorMessage.style.display = 'none';
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('Firebase login attempt');

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('errorMessage');

        if (!usernameInput || !passwordInput) {
            console.error('Login form elements not found');
            return;
        }

        const username = usernameInput.value.trim();
        const pin = passwordInput.value.trim();

        if (!username || !pin) {
            this.showError(errorMessage, 'PLEASE_FILL_ALL_FIELDS');
            return;
        }

        // Validate inputs
        if (!this.validateInputs(username, pin)) {
            this.showError(errorMessage, 'INVALID_INPUT_FORMAT_(USERNAME:_3-20_CHARS,_PIN:_4_DIGITS)');
            return;
        }

        // Show loading state
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.querySelector('.btn-text').textContent = 'AUTHENTICATING...';
            loginBtn.disabled = true;
        }

        try {
            // Convert username to email format for Firebase
            const email = this.usernameToEmail(username);

            // Authenticate with Firebase
            await this.auth.signInWithEmailAndPassword(email, pin);

            // Success! Firebase will trigger onAuthStateChanged
            this.showError(errorMessage, 'ACCESS_GRANTED_REDIRECTING...', 'success');

            // Store username in localStorage for quick access
            localStorage.setItem('data_bhandaar_current_user', username);

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            console.error('Firebase login error:', error);

            let errorMsg = 'LOGIN_FAILED';
            if (error.code === 'auth/user-not-found') {
                errorMsg = 'USER_NOT_FOUND_PLEASE_REGISTER';
            } else if (error.code === 'auth/wrong-password') {
                errorMsg = 'INVALID_PIN';
            } else if (error.code === 'auth/too-many-requests') {
                errorMsg = 'TOO_MANY_ATTEMPTS_TRY_LATER';
            } else if (error.code === 'auth/network-request-failed') {
                errorMsg = 'NETWORK_ERROR_CHECK_CONNECTION';
            }

            this.showError(errorMessage, errorMsg);
        } finally {
            // Restore button state
            if (loginBtn) {
                loginBtn.querySelector('.btn-text').textContent = 'LOGIN';
                loginBtn.disabled = false;
            }
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        console.log('Firebase signup attempt');

        const usernameInput = document.getElementById('newUsername');
        const passwordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const errorMessage = document.getElementById('signupErrorMessage');

        if (!usernameInput || !passwordInput || !confirmPasswordInput) {
            console.error('Signup form elements not found');
            return;
        }

        const username = usernameInput.value.trim();
        const pin = passwordInput.value.trim();
        const confirmPin = confirmPasswordInput.value.trim();

        if (!username || !pin || !confirmPin) {
            this.showError(errorMessage, 'PLEASE_FILL_ALL_FIELDS');
            return;
        }

        // Validate inputs
        if (!this.validateInputs(username, pin)) {
            this.showError(errorMessage, 'INVALID_INPUT_FORMAT_(USERNAME:_3-20_CHARS,_PIN:_4_DIGITS)');
            return;
        }

        if (pin !== confirmPin) {
            this.showError(errorMessage, 'PINS_DO_NOT_MATCH');
            return;
        }

        // Show loading state
        const signupBtn = document.querySelector('.signup-form .login-btn');
        if (signupBtn) {
            signupBtn.querySelector('.btn-text').textContent = 'CREATING_ACCOUNT...';
            signupBtn.disabled = true;
        }

        try {
            // Convert username to email format for Firebase
            const email = this.usernameToEmail(username);

            // Create user with Firebase
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, pin);

            // Update profile with display name (username)
            await userCredential.user.updateProfile({
                displayName: username
            });

            console.log('Firebase account created successfully for:', username);

            this.showError(errorMessage, 'ACCOUNT_CREATED_REDIRECTING...', 'success');

            // Store username in localStorage
            localStorage.setItem('data_bhandaar_current_user', username);

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            console.error('Firebase signup error:', error);

            let errorMsg = 'ACCOUNT_CREATION_FAILED';
            if (error.code === 'auth/email-already-in-use') {
                errorMsg = 'USERNAME_ALREADY_EXISTS';
            } else if (error.code === 'auth/weak-password') {
                errorMsg = 'PIN_TOO_WEAK_(USE_4_DIGITS)';
            } else if (error.code === 'auth/network-request-failed') {
                errorMsg = 'NETWORK_ERROR_CHECK_CONNECTION';
            }

            this.showError(errorMessage, errorMsg);
        } finally {
            // Restore button state
            if (signupBtn) {
                signupBtn.querySelector('.btn-text').textContent = 'CREATE_ACCOUNT';
                signupBtn.disabled = false;
            }
        }
    }

    validateInputs(username, pin) {
        const validationPatterns = {
            username: /^[a-zA-Z0-9_]{3,20}$/, // Alphanumeric and underscore, 3-20 chars
            pin: /^\d{4}$/ // Exactly 4 digits
        };

        return validationPatterns.username.test(username) &&
               validationPatterns.pin.test(pin);
    }

    // Convert username to email format for Firebase
    // Since Firebase requires email, we create a pseudo-email from username
    usernameToEmail(username) {
        return `${username.toLowerCase()}@databhandaar.local`;
    }

    // Extract username from email
    emailToUsername(email) {
        return email.split('@')[0];
    }

    handleAuthenticatedUser(user) {
        // User is logged in
        const username = user.displayName || this.emailToUsername(user.email);

        const session = {
            username: username,
            email: user.email,
            uid: user.uid,
            loginTime: new Date().toISOString(),
            provider: 'firebase'
        };

        try {
            localStorage.setItem('data_bhandaar_session', JSON.stringify(session));
            localStorage.setItem('data_bhandaar_current_user', username);
            console.log('Session created for:', username);
        } catch (e) {
            console.error('Error saving session:', e);
        }
    }

    clearLocalSession() {
        try {
            localStorage.removeItem('data_bhandaar_session');
            localStorage.removeItem('data_bhandaar_current_user');
        } catch (e) {
            console.error('Error clearing session:', e);
        }
    }

    showError(element, message, type = 'error') {
        if (element) {
            element.textContent = `>_ ${message}`;
            element.style.display = 'block';
            element.className = 'error-message';

            if (type === 'success') {
                element.classList.add('success');
            }

            setTimeout(() => {
                element.style.display = 'none';
                element.classList.remove('success');
            }, 5000);
        }
    }

    checkAndRedirect() {
        // Check if user is authenticated with Firebase
        if (!this.auth) {
            console.log('Firebase not initialized, checking local session');
            const session = this.getCurrentSession();
            if (!session) {
                console.log('No session, redirecting to login');
                window.location.href = 'login.html';
                return null;
            }
            return session;
        }

        // Firebase will handle auth state through onAuthStateChanged
        const user = this.auth.currentUser;
        if (!user) {
            // Wait a moment for Firebase to initialize
            setTimeout(() => {
                if (!this.auth.currentUser) {
                    console.log('No Firebase user, redirecting to login');
                    window.location.href = 'login.html';
                }
            }, 1000);
            return null;
        }

        console.log('Firebase user authenticated:', user.email);
        return {
            username: user.displayName || this.emailToUsername(user.email),
            email: user.email
        };
    }

    getCurrentSession() {
        try {
            const session = localStorage.getItem('data_bhandaar_session');
            return session ? JSON.parse(session) : null;
        } catch (e) {
            console.error('Error getting session:', e);
            return null;
        }
    }

    getCurrentUser() {
        if (this.auth && this.auth.currentUser) {
            return this.auth.currentUser.displayName ||
                   this.emailToUsername(this.auth.currentUser.email);
        }

        const session = this.getCurrentSession();
        return session ? session.username : null;
    }

    static checkAuth() {
        // Check Firebase auth first
        if (typeof firebase !== 'undefined' && firebase.auth()) {
            const user = firebase.auth().currentUser;
            if (user) {
                return {
                    username: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    uid: user.uid
                };
            }
        }

        // Fallback to localStorage
        try {
            const session = localStorage.getItem('data_bhandaar_session');
            if (!session) {
                console.log('No session found');
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
                return null;
            }
            return JSON.parse(session);
        } catch (e) {
            console.error('Error checking auth:', e);
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
            return null;
        }
    }

    static async logout() {
        try {
            // Sign out from Firebase
            if (typeof firebase !== 'undefined' && firebase.auth()) {
                await firebase.auth().signOut();
                console.log('Firebase logout successful');
            }

            // Clear localStorage
            localStorage.removeItem('data_bhandaar_session');
            localStorage.removeItem('data_bhandaar_current_user');
            console.log('Local session cleared');
        } catch (e) {
            console.error('Error during logout:', e);
        }
        window.location.href = 'login.html';
    }

    // Initialize storage system separately
    async initStorageSystem() {
        if (!this.storageSystem) {
            this.storageSystem = new StorageManager();
            await this.storageSystem.init();
            console.log('Storage system initialized');
        }
        return this.storageSystem;
    }

    getStorageSystem() {
        return this.storageSystem;
    }
}

// Initialize Firebase auth system
const authSystem = new FirebaseAuthSystem();

// Make auth system globally available
window.AuthSystem = FirebaseAuthSystem;
window.authSystem = authSystem;
