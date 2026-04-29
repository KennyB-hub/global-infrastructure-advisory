const languages = {
    "en": {
        "welcome": "Welcome",
        "thankYou": "Thank you!"
    },
    "es": {
        "welcome": "Bienvenido",
        "thankYou": "¡Gracias!"
    },
    "fr": {
        "welcome": "Bienvenue",
        "thankYou": "Merci!"
    },
    "ar": {
        "welcome": "أهلا وسهلا",
        "thankYou": "شكرا!"
    },
    "zh": {
        "welcome": "欢迎",
        "thankYou": "谢谢!"
    },
    "pt": {
        "welcome": "Bem-vindo",
        "thankYou": "Obrigado!"
    }
};

function switchLanguage(lang) {
    if (languages[lang]) {
        document.getElementById('welcome').innerText = languages[lang].welcome;
        document.getElementById('thank-you').innerText = languages[lang].thankYou;
    } else {
        console.warn('Language not supported: ' + lang);
    }
}

// Example usage: switchLanguage('es'); // Switch to Español
