const translations = {
    en: {
      welcome: "Welcome",
      button: "Click Here",
      phrase: "Want to know about your mission?"
    },
    pt: {
      welcome: "Bem-vindo",
      button: "Clique Aqui",
      phrase: "Quer saber sobre a sua missão?"
    },
    es: {
      welcome: "Bienvenido",
      button: "Haga Clic Aqui",
      phrase: "Quieres saber acerca de tu misión?"
    }
  };

  function changeLanguage(lang) {
    const text = translations[lang];
    document.getElementById('welcome').textContent = text.welcome;
    document.getElementById('mainBtn').textContent = text.button;
    document.getElementById('phrase').textContent = text.phrase;
  }