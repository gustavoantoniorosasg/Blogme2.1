/* ============================
   TOGGLE MODO OSCURO
============================ */
const toggleDarkMode = () => {
  document.body.classList.toggle("dark-mode");

  // Guarda preferencia
  const current = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", current);
};

// Al cargar la página aplicar preferencia
(function () {
  const saved = localStorage.getItem("theme");

  if (saved === "dark") {
    document.body.classList.add("dark-mode");
  }
})();

document.getElementById("theme-toggle")?.addEventListener("click", toggleDarkMode);

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("open");

  const expanded = navToggle.getAttribute("aria-expanded") === "true" || false;
  navToggle.setAttribute("aria-expanded", !expanded);
});
