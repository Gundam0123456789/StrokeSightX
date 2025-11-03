import i18n from "i18next";

function LanguageSwitch() {
  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    document.body.style.fontFamily =
      lng === "th" ? "Prompt, sans-serif" : "Poppins, sans-serif";
  };

  return (
    <div>
      <button onClick={() => changeLang("th")}>ไทย</button>
      <button onClick={() => changeLang("en")}>English</button>
    </div>
  );
}
