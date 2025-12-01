// Menú móvil
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Smooth scroll para anclajes
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: "smooth",
      });
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
      }
    }
  });
});

// Formulario (simulado)
const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert(
      "¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto."
    );
    form.reset();
  });
}

// Carrusel de proyectos
(function () {
  const carouselTrack = document.querySelector(".carousel-track");
  if (!carouselTrack) return;

  const slides = Array.from(carouselTrack.children);
  let index = 0;
  const total = slides.length;
  const intervalMs = 3000;
  let autoplay = null;

  function calcSlidesPerView() {
    const w = window.innerWidth;
    if (w < 768) return 1;
    if (w < 900) return 2;
    return 3;
  }

  function goTo(i) {
    let slidesPerView = calcSlidesPerView();
    const maxIdx = Math.max(0, total - slidesPerView);
    
    if (i < 0) i = 0;
    if (i > maxIdx) i = 0;
    index = i;

    // Calcular desplazamiento basado en el ancho real de los slides
    let offset = 0;
    for (let j = 0; j < i; j++) {
      offset += slides[j].offsetWidth + 16; // 16px = 1rem gap
    }
    
    carouselTrack.style.transform = `translateX(-${offset}px)`;
  }

  function startAutoplay() {
    if (autoplay) clearInterval(autoplay);
    autoplay = setInterval(() => {
      let slidesPerView = calcSlidesPerView();
      const maxIdx = Math.max(0, total - slidesPerView);
      const next = index + 1;
      if (next > maxIdx) goTo(0);
      else goTo(next);
    }, intervalMs);
  }

  function stopAutoplay() {
    if (autoplay) {
      clearInterval(autoplay);
      autoplay = null;
    }
  }

  // Initialize
  function init() {
    requestAnimationFrame(() => {
      goTo(0);
      startAutoplay();
    });
  }

  const container = carouselTrack.parentElement;
  container.addEventListener("mouseenter", stopAutoplay);
  container.addEventListener("mouseleave", startAutoplay);

  window.addEventListener("resize", () => {
    requestAnimationFrame(() => goTo(index));
  });

  // Start when images are loaded
  const images = carouselTrack.querySelectorAll("img");
  let loaded = 0;
  
  images.forEach((img) => {
    if (img.complete) {
      loaded++;
    } else {
      img.addEventListener("load", () => {
        loaded++;
        if (loaded === images.length) init();
      });
    }
  });
  
  if (loaded === images.length) init();
})();
