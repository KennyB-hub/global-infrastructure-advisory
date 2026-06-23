async function switchLanguage(lang) {
    try {
        const response = await fetch(`/public/i18n/${lang}.json`);
        const translations = await response.json();

        // Apply translations to all elements with data-i18n keys
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[key]) {
                el.innerText = translations[key];
            }
        });

        // Handle RTL languages
        const rtlLanguages = ["ar", "he", "fa"];
        document.documentElement.dir = rtlLanguages.includes(lang) ? "rtl" : "ltr";
        document.documentElement.lang = lang;

    } catch (err) {
        console.error("Language not supported:", lang, err);
    }
}
