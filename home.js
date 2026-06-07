// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase config - Sizning haqiqiy Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCtxk7gcilx1Be8k44SQ32eio6EBmh8IVc",
    authDomain: "loyiha1-773ba.firebaseapp.com",
    databaseURL: "https://loyiha1-773ba-default-rtdb.firebaseio.com",
    projectId: "loyiha1-773ba",
    storageBucket: "loyiha1-773ba.firebasestorage.app",
    messagingSenderId: "612930407157",
    appId: "1:612930407157:web:64c442205ec691518f93bc",
    measurementId: "G-H2HE37T18W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Global Variables
let currentUser = null;
let userData = null;
let currentLanguage = 'en';

// Language Translations
const translations = {
    en: {
        welcome: "Welcome back!",
        subtitle: "Choose your role to get started",
        totalBalance: "Total Balance",
        publisher: "Publisher",
        publisherSub: "Show ads & earn",
        advertiser: "Advertiser",
        advertiserSub: "Create campaigns",
        language: "Language",
        totalAds: "Total Ads",
        active: "Active",
        today: "Today"
    },
    uz: {
        welcome: "Xush kelibsiz!",
        subtitle: "Rolni tanlang va boshlang",
        totalBalance: "Umumiy Balans",
        publisher: "Nashriyotchi",
        publisherSub: "Reklama ko'rsating va pul ishlang",
        advertiser: "Reklamaberuvchi",
        advertiserSub: "Kampaniya yarating",
        language: "Til",
        totalAds: "Jami Reklamalar",
        active: "Faol",
        today: "Bugun"
    },
    ru: {
        welcome: "Добро пожаловать!",
        subtitle: "Выберите роль для начала",
        totalBalance: "Общий Баланс",
        publisher: "Издатель",
        publisherSub: "Показывай рекламу и зарабатывай",
        advertiser: "Рекламодатель",
        advertiserSub: "Создавай кампании",
        language: "Язык",
        totalAds: "Всего Объявлений",
        active: "Активно",
        today: "Сегодня"
    }
};

// Initialize App
async function initializeApp() {
    try {
        showLoading(true);

        // Get Telegram user data
        const telegramUser = tg.initDataUnsafe?.user;
        
        if (!telegramUser) {
            console.error('Telegram user data not available');
            // For testing purposes, use dummy data
            const dummyUser = {
                id: 123456789,
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser'
            };
            await authenticateUser(dummyUser);
        } else {
            await authenticateUser(telegramUser);
        }

        showLoading(false);
    } catch (error) {
        console.error('Initialization error:', error);
        showLoading(false);
        tg.showAlert('Error initializing app. Please try again.');
    }
}

// Authenticate User
async function authenticateUser(telegramUser) {
    try {
        // Sign in anonymously to Firebase
        const userCredential = await signInAnonymously(auth);
        currentUser = userCredential.user;

        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', telegramUser.id.toString());
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // Create new user
            userData = {
                telegramId: telegramUser.id,
                firstName: telegramUser.first_name || '',
                lastName: telegramUser.last_name || '',
                username: telegramUser.username || '',
                balance: 0,
                totalAds: 0,
                activeAds: 0,
                todayEarnings: 0,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            await setDoc(userDocRef, userData);
            console.log('New user created:', userData);
        } else {
            // Update existing user
            userData = userDoc.data();
            await updateDoc(userDocRef, {
                lastLogin: new Date().toISOString()
            });
            console.log('User logged in:', userData);
        }

        // Update UI with user data
        updateUI();
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}

// Update UI
function updateUI() {
    // Update user info
    const userInitial = document.getElementById('userInitial');
    if (userData.firstName) {
        userInitial.textContent = userData.firstName.charAt(0).toUpperCase();
    }

    // Update welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.textContent = `${translations[currentLanguage].welcome}, ${userData.firstName || 'User'}`;

    // Update user ID
    const userId = document.getElementById('userId');
    userId.textContent = userData.telegramId;

    // Update balance
    const balanceAmount = document.getElementById('balanceAmount');
    balanceAmount.textContent = userData.balance.toFixed(2);

    // Update stats
    document.getElementById('totalAds').textContent = userData.totalAds || 0;
    document.getElementById('activeAds').textContent = userData.activeAds || 0;
    document.getElementById('todayEarnings').textContent = `$${(userData.todayEarnings || 0).toFixed(2)}`;

    // Set Telegram theme colors
    if (tg.themeParams.bg_color) {
        document.documentElement.style.setProperty('--bg-primary', tg.themeParams.bg_color);
    }
    if (tg.themeParams.secondary_bg_color) {
        document.documentElement.style.setProperty('--bg-card', tg.themeParams.secondary_bg_color);
    }
    if (tg.themeParams.text_color) {
        document.documentElement.style.setProperty('--text-primary', tg.themeParams.text_color);
    }
}

// Show/Hide Loading Screen
function showLoading(show) {
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContent = document.getElementById('mainContent');
    
    if (show) {
        loadingScreen.style.display = 'flex';
        mainContent.style.display = 'none';
    } else {
        loadingScreen.style.display = 'none';
        mainContent.style.display = 'block';
    }
}

// Update Language
function updateLanguage(lang) {
    currentLanguage = lang;
    const trans = translations[lang];

    document.querySelector('.welcome-section h2').textContent = trans.welcome;
    document.querySelector('.welcome-subtitle').textContent = trans.subtitle;
    document.querySelector('.balance-label').textContent = trans.totalBalance;
    
    // Update button texts
    const publisherBtn = document.querySelector('.publisher-btn');
    publisherBtn.querySelector('.btn-title').textContent = trans.publisher;
    publisherBtn.querySelector('.btn-subtitle').textContent = trans.publisherSub;

    const advertiserBtn = document.querySelector('.advertiser-btn');
    advertiserBtn.querySelector('.btn-title').textContent = trans.advertiser;
    advertiserBtn.querySelector('.btn-subtitle').textContent = trans.advertiserSub;

    const languageBtn = document.querySelector('.language-btn');
    languageBtn.querySelector('.btn-title').textContent = trans.language;

    // Update stats labels
    document.querySelectorAll('.stat-label')[0].textContent = trans.totalAds;
    document.querySelectorAll('.stat-label')[1].textContent = trans.active;
    document.querySelectorAll('.stat-label')[2].textContent = trans.today;

    // Update current language display
    const languageNames = {
        en: 'English',
        uz: "O'zbekcha",
        ru: 'Русский'
    };
    document.getElementById('currentLanguage').textContent = languageNames[lang];
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Publisher button
    document.getElementById('publisherBtn').addEventListener('click', () => {
        tg.HapticFeedback.impactOccurred('medium');
        // Navigate to publisher page
        window.location.href = 'publisher.html';
    });

    // Advertiser button
    document.getElementById('advertiserBtn').addEventListener('click', () => {
        tg.HapticFeedback.impactOccurred('medium');
        // Navigate to advertiser page
        window.location.href = 'advertiser.html';
    });

    // Language button
    document.getElementById('languageBtn').addEventListener('click', () => {
        tg.HapticFeedback.impactOccurred('light');
        showLanguageSelector();
    });

    // Initialize app
    initializeApp();
});

// Show Language Selector
function showLanguageSelector() {
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'uz', name: "O'zbekcha" },
        { code: 'ru', name: 'Русский' }
    ];

    const buttons = languages.map(lang => ({
        text: lang.name,
        action: () => {
            updateLanguage(lang.code);
            tg.HapticFeedback.notificationOccurred('success');
        }
    }));

    // Show Telegram popup
    tg.showPopup({
        title: 'Select Language',
        message: 'Choose your preferred language',
        buttons: languages.map(lang => ({
            text: lang.name,
            id: lang.code
        }))
    }, (buttonId) => {
        if (buttonId) {
            updateLanguage(buttonId);
            tg.HapticFeedback.notificationOccurred('success');
        }
    });
}

// Monitor auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log('User authenticated:', user.uid);
    } else {
        console.log('User signed out');
    }
});

// Export functions for testing
window.adseroApp = {
    updateLanguage,
    userData: () => userData,
    refreshBalance: async () => {
        if (userData) {
            const userDocRef = doc(db, 'users', userData.telegramId.toString());
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                userData = userDoc.data();
                updateUI();
            }
        }
    }
};
