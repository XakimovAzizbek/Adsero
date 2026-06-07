// Firebase Realtime Database
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getDatabase, ref, set, get, update } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';

// Firebase Config
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
const database = getDatabase(app);

// Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Global Variables
let userData = null;
let currentLanguage = 'en';

// Language Translations
const translations = {
    en: {
        welcome: "Welcome back",
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
        welcome: "Xush kelibsiz",
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
        welcome: "Добро пожаловать",
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
async function initApp() {
    try {
        showLoading(true);

        // Get Telegram user data
        const telegramUser = tg.initDataUnsafe?.user;
        
        if (!telegramUser) {
            console.log('Telegram user not found - using test data');
            // Test uchun dummy data
            const dummyUser = {
                id: 123456789,
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser'
            };
            await loadUserData(dummyUser);
        } else {
            console.log('Telegram user found:', telegramUser);
            await loadUserData(telegramUser);
        }

        showLoading(false);
    } catch (error) {
        console.error('Initialization error:', error);
        showLoading(false);
        tg.showAlert('Xatolik yuz berdi: ' + error.message);
    }
}

// Load or Create User Data
async function loadUserData(telegramUser) {
    try {
        const userId = telegramUser.id.toString();
        const userRef = ref(database, 'users/' + userId);
        
        console.log('Loading user data for ID:', userId);
        
        // Check if user exists
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            // User mavjud - ma'lumotlarni yuklash
            userData = snapshot.val();
            console.log('User loaded:', userData);
            
            // Last login yangilash
            await update(userRef, {
                lastLogin: new Date().toISOString()
            });
        } else {
            // Yangi user yaratish
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
            
            await set(userRef, userData);
            console.log('New user created:', userData);
        }
        
        // UI ni yangilash
        updateUI();
        
    } catch (error) {
        console.error('Load user error:', error);
        throw error;
    }
}

// Update UI
function updateUI() {
    console.log('Updating UI with user data:', userData);
    
    // User avatar
    const userInitial = document.getElementById('userInitial');
    if (userData.firstName) {
        userInitial.textContent = userData.firstName.charAt(0).toUpperCase();
    } else {
        userInitial.textContent = 'U';
    }

    // Welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    const name = userData.firstName ? ', ' + userData.firstName : '';
    welcomeMessage.textContent = translations[currentLanguage].welcome + name + '!';

    // User ID - TO'G'RILANDI!
    const userIdElement = document.getElementById('userId');
    if (userIdElement && userData.telegramId) {
        userIdElement.textContent = userData.telegramId;
        console.log('User ID set to:', userData.telegramId);
    }

    // Balance
    const balanceAmount = document.getElementById('balanceAmount');
    if (balanceAmount) {
        balanceAmount.textContent = (userData.balance || 0).toFixed(2);
    }

    // Stats
    const totalAdsElement = document.getElementById('totalAds');
    const activeAdsElement = document.getElementById('activeAds');
    const todayEarningsElement = document.getElementById('todayEarnings');
    
    if (totalAdsElement) totalAdsElement.textContent = userData.totalAds || 0;
    if (activeAdsElement) activeAdsElement.textContent = userData.activeAds || 0;
    if (todayEarningsElement) todayEarningsElement.textContent = `$${(userData.todayEarnings || 0).toFixed(2)}`;

    // Telegram theme colors
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

// Show/Hide Loading
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

    // Welcome section
    const welcomeMessage = document.getElementById('welcomeMessage');
    const name = userData.firstName ? ', ' + userData.firstName : '';
    welcomeMessage.textContent = trans.welcome + name + '!';
    
    document.querySelector('.welcome-subtitle').textContent = trans.subtitle;
    document.querySelector('.balance-label').textContent = trans.totalBalance;
    
    // Buttons
    const publisherBtn = document.querySelector('.publisher-btn');
    publisherBtn.querySelector('.btn-title').textContent = trans.publisher;
    publisherBtn.querySelector('.btn-subtitle').textContent = trans.publisherSub;

    const advertiserBtn = document.querySelector('.advertiser-btn');
    advertiserBtn.querySelector('.btn-title').textContent = trans.advertiser;
    advertiserBtn.querySelector('.btn-subtitle').textContent = trans.advertiserSub;

    const languageBtn = document.querySelector('.language-btn');
    languageBtn.querySelector('.btn-title').textContent = trans.language;

    // Stats
    const statLabels = document.querySelectorAll('.stat-label');
    statLabels[0].textContent = trans.totalAds;
    statLabels[1].textContent = trans.active;
    statLabels[2].textContent = trans.today;

    // Current language
    const languageNames = {
        en: 'English',
        uz: "O'zbekcha",
        ru: 'Русский'
    };
    document.getElementById('currentLanguage').textContent = languageNames[lang];
}

// Show Language Selector
function showLanguageSelector() {
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'uz', name: "O'zbekcha" },
        { code: 'ru', name: 'Русский' }
    ];

    // Telegram popup
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    // Publisher button - publisher.html ga o'tish
    document.getElementById('publisherBtn').addEventListener('click', () => {
        console.log('Publisher button clicked');
        tg.HapticFeedback.impactOccurred('medium');
        window.location.href = 'publisher.html';
    });

    // Advertiser button - advertiser.html ga o'tish
    document.getElementById('advertiserBtn').addEventListener('click', () => {
        console.log('Advertiser button clicked');
        tg.HapticFeedback.impactOccurred('medium');
        window.location.href = 'advertiser.html';
    });

    // Language button
    document.getElementById('languageBtn').addEventListener('click', () => {
        console.log('Language button clicked');
        tg.HapticFeedback.impactOccurred('light');
        showLanguageSelector();
    });

    // Initialize app
    initApp();
});

// Export for testing
window.adseroApp = {
    updateLanguage,
    getUserData: () => userData,
    refreshData: async () => {
        if (userData) {
            const userRef = ref(database, 'users/' + userData.telegramId);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                userData = snapshot.val();
                updateUI();
            }
        }
    }
};
