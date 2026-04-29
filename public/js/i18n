{
  "nav": {
    "home": "Home",
    "programs": "Programs",
    "workforce": "Join Workforce",
    "contractors": "Contractor Hub",
    "sectors": "Sectors",
    "about": "About Us"
  },
  "sectors": {
    "energy": "Energy & Power",
    "water": "Water & Sanitation",
    "transport": "Transportation",
    "digital": "Digital Infrastructure",
    "health": "Health & Education",
    "climate": "Climate & Resilience"
  },
  "cta": {
    "view_programs": "View Programs →",
    "join_us": "Partner With Us",
    "submit": "Submit Registration"
  }
}

 SET this file in VScode  src/index.js 🛡️ The "Strict" Worker Logic

export default {
  async fetch(request, env) {
    // 1. Detect the visitor's country (ISO 2-letter code like US, SA, BR)
    const country = request.cf.country;
 
    // 2. Map countries to your 10-language JSON files
    const languageMap = {
      "US": "en", // USA
      "SA": "ar", // Saudi Arabia (Arabic)
      "IL": "he", // Israel (Hebrew)
      "BR": "pt", // Brazil (Portuguese)
      "FR": "fr", // France
      "RU": "ru", // Russia
      "CN": "zh", // China
      "KE": "sw", // Kenya (Swahili)
      "IN": "hi", // India
      "MX": "es", // Mexico (Spanish)
    };

    // 3. Determine the correct language (default to English)
    const lang = languageMap[country] || "en";

    // 4. Fetch the specific JSON from your backend or KV store
    // (Ensure your JSON files are stored at /i18n/en.json, etc.)
    const translationUrl = `https://globalinfrastructureadvisory.com{lang}.json`;
 
    return fetch(translationUrl);
  },
};


// Translation data object
const translations = {
  en: { home: "Home", capabilities: "Capabilities", contact: "Contact" },
  es: { home: "Inicio", capabilities: "Capacidades", contact: "Contacto" },
  fr: { home: "Accueil", capabilities: "Capacités", contact: "Contact" },
  ar: { home: "الرئيسية", capabilities: "القدرات", contact: "اتصل بنا" },
  zh: { home: "首页", capabilities: "业务能力", contact: "联系我们" },
  pt: { home: "Início", capabilities: "Capacidades", contact: "Contato" }
};

function setLanguage(lang) {
  // Save preference to browser
  localStorage.setItem('selectedLanguage', lang);
 
  // Update all elements with the 'data-i18n' attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Handle Right-to-Left for Arabic
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

// Load saved language on startup
window.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('selectedLanguage') || 'en';
  setLanguage(savedLang);
});


document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      // Toggle a CSS class to show/hide the menu
      navLinks.classList.toggle('active');
 
      // Accessibility: Update aria-expanded status
      const isExpanded = navLinks.classList.contains('active');
      menuBtn.setAttribute('aria-expanded', isExpanded);
    });
  }
});

<header class="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
    <!-- Logo Section -->
    <div class="flex items-center gap-2">
      <div class="h-9 w-9 rounded-sm bg-emerald-500/10 ring-1 ring-emerald-400/40 flex items-center justify-center">
        <span class="text-sm font-semibold tracking-tight text-emerald-300">GIA</span>
      </div>
      <div>
        <p class="text-sm font-semibold tracking-tight text-slate-50">Global Infrastructure Advisory</p>
      </div>
    </div>

    <!-- Desktop Nav \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\& Language Picker -->
    <div class="hidden items-center gap-8 md:flex">
      <nav class="flex gap-6 text-sm text-slate-300">
        <a href="#hero" data-i18n="home" class="hover:text-emerald-300 transition">Home</a>
        <a href="#capabilities" data-i18n="capabilities" class="hover:text-emerald-300 transition">Capabilities</a>
        <a href="#approach" class="hover:text-emerald-300 transition">How We Work</a>
        <a href="#contact" data-i18n="contact" class="hover:text-emerald-300 transition">Contact</a>
      </nav>
 
      <!-- Language Buttons -->
      <div class="flex gap-2 border-l border-slate-700 pl-6 text-\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\[10px] font-bold text-slate-500">
        <button onclick="setLanguage('en')" class="hover:text-emerald-400">EN</button>
        <button onclick="setLanguage('es')" class="hover:text-emerald-400">ES</button>
        <button onclick="setLanguage('fr')" class="hover:text-emerald-400">FR</button>
        <button onclick="setLanguage('ar')" class="hover:text-emerald-400">العربية</button>
      </div>
    </div>

    <!-- Mobile Menu Button -->
    <button id="menu-toggle" class="block md:hidden text-slate-300">
      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
    </button>
  </div>

  <!-- Mobile Dropdown (Hidden by default) -->
  <div id="mobile-menu" class="hidden border-t border-slate-800 bg-slate-950 px-4 py-6 md:hidden">
    <nav class="flex flex-col gap-4 text-center text-slate-300">
      <a href="#hero" data-i18n="home" class="py-2">Home</a>
      <a href="#capabilities" data-i18n="capabilities" class="py-2">Capabilities</a>
      <div class="flex justify-center gap-4 pt-4 border-t border-slate-800">
        <button onclick="setLanguage('en')">EN</button>
        <button onclick="setLanguage('es')">ES</button>
        <button onclick="setLanguage('fr')">FR</button>
        <button onclick="setLanguage('ar')">AR</button>
      </div>
    </nav>
  </div>
</header>

<script>



// 1. LANGUAGE SWITCHER LOGIC



const translations = {



\\\\\\\\\\\\\\\&#x20; en: { home: "Home", capabilities: "Capabilities", contact: "Contact" },



\\\\\\\\\\\\\\\&#x20; es: { home: "Inicio", capabilities: "Capacidades", contact: "Contacto" },



\\\\\\\\\\\\\\\&#x20; fr: { home: "Accueil", capabilities: "Capacités", contact: "Contact" },



\\\\\\\\\\\\\\\&#x20; ar: { home: "الرئيسية", capabilities: "القدرات", contact: "اتصل بنا" }



};







function setLanguage(lang) {



\\\\\\\\\\\\\\\&#x20; localStorage.setItem('gia\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_lang', lang);



\\\\\\\\\\\\\\\&#x20; document.querySelectorAll('\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\[data-i18n]').forEach(el => {



\\\\\\\\\\\\\\\&#x20;   const key = el.getAttribute('data-i18n');



\\\\\\\\\\\\\\\&#x20;   if (translations\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\[lang]\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\[key]) el.textContent = translations\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\[lang]\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\[key];



\\\\\\\\\\\\\\\&#x20; });



\\\\\\\\\\\\\\\&#x20; document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';



}







// 2. MENU BAR LOGIC



document.getElementById('menu-toggle').addEventListener('click', () => {



\\\\\\\\\\\\\\\&#x20; const menu = document.getElementById('mobile-menu');



\\\\\\\\\\\\\\\&#x20; menu.classList.toggle('hidden');



});







// Initialize



window.onload = () => setLanguage(localStorage.getItem('gia\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_lang') || 'en');







document.addEventListener('DOMContentLoaded', () => {

\\\\\\\&#x20; const menuBtn = document.getElementById('menu-toggle');

\\\\\\\&#x20; const navLinks = document.getElementById('nav-links');



\\\\\\\&#x20; if (menuBtn \\\\\\\\\\\\\\\&\\\\\\\\\\\\\\\& navLinks) {

\\\\\\\&#x20;   menuBtn.addEventListener('click', () => {

\\\\\\\&#x20;     // Toggle a CSS class to show/hide the menu

\\\\\\\&#x20;     navLinks.classList.toggle('active');

\\\\\\\&#x20;

\\\\\\\&#x20;     // Accessibility: Update aria-expanded status

\\\\\\\&#x20;     const isExpanded = navLinks.classList.contains('active');

\\\\\\\&#x20;     menuBtn.setAttribute('aria-expanded', isExpanded);

\\\\\\\&#x20;   });

\\\\\\\&#x20; }

});





/\\\\\\\\\\\\\\\* Navbar Container \\\\\\\\\\\\\\\*/

.navbar {

\\\\\\\&#x20; display: flex;

\\\\\\\&#x20; justify-content: space-between;

\\\\\\\&#x20; align-items: center;

\\\\\\\&#x20; padding: 1rem 5%;

\\\\\\\&#x20; background: #0a7a5a; /\\\\\\\\\\\\\\\* Your GIA Green \\\\\\\\\\\\\\\*/

\\\\\\\&#x20; color: white;

}



.nav-menu {

\\\\\\\&#x20; display: flex;

\\\\\\\&#x20; list-style: none;

\\\\\\\&#x20; gap: 20px;

}



.nav-menu a {

\\\\\\\&#x20; color: white;

\\\\\\\&#x20; text-decoration: none;

\\\\\\\&#x20; font-weight: 500;

}



/\\\\\\\\\\\\\\\* Hide Hamburger on Desktop \\\\\\\\\\\\\\\*/

.hamburger {

\\\\\\\&#x20; display: none;

\\\\\\\&#x20; cursor: pointer;

\\\\\\\&#x20; background: none;

\\\\\\\&#x20; border: none;

}



.hamburger span {

\\\\\\\&#x20; display: block;

\\\\\\\&#x20; width: 25px;

\\\\\\\&#x20; height: 3px;

\\\\\\\&#x20; background: white;

\\\\\\\&#x20; margin: 5px 0;

}



/\\\\\\\\\\\\\\\* Mobile View (Screens smaller than 768px) \\\\\\\\\\\\\\\*/

@media (max-width: 768px) {

\\\\\\\&#x20; .hamburger { display: block; }



\\\\\\\&#x20; .nav-menu {

\\\\\\\&#x20;   display: none; /\\\\\\\\\\\\\\\* Hidden by default \\\\\\\\\\\\\\\*/

\\\\\\\&#x20;   flex-direction: column;

\\\\\\\&#x20;   position: absolute;

\\\\\\\&#x20;   top: 60px;

\\\\\\\&#x20;   right: 0;

\\\\\\\&#x20;   background: #0a7a5a;

\\\\\\\&#x20;   width: 100%;

\\\\\\\&#x20;   padding: 20px;

\\\\\\\&#x20;   text-align: center;

\\\\\\\&#x20; }



\\\\\\\&#x20; /\\\\\\\\\\\\\\\* This is what the JS toggles \\\\\\\\\\\\\\\*/

\\\\\\\&#x20; .nav-menu.active {

\\\\\\\&#x20;   display: flex;

\\\\\\\&#x20; }

}
