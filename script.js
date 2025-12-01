// Cargar y mostrar proyectos
(async function () {
  try {
    const response = await fetch('./projects.json');
    const data = await response.json();
    const projects = data.projects;
    const categories = data.categories;

    const filtersContainer = document.getElementById('filtersContainer');
    const projectsGrid = document.getElementById('projectsGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let activeFilter = 'all';
    let showAll = false;
    let visibleCount = getInitialVisibleCount();

    // Función para obtener cantidad inicial de proyectos según dispositivo
    function getInitialVisibleCount() {
      const w = window.innerWidth;
      if (w < 768) return 4;      // Móvil: 4 proyectos
      if (w < 1024) return 6;     // Tablet: 6 proyectos
      return 9;                   // Escritorio: 9 proyectos
    }

    // Crear botones de filtro
    categories.forEach((category) => {
      const button = document.createElement('button');
      button.className = `filter-btn ${category.id === 'all' ? 'active' : ''}`;
      button.textContent = category.name;
      button.setAttribute('data-filter', category.id);

      button.addEventListener('click', () => {
        // Actualizar botón activo
        document.querySelectorAll('.filter-btn').forEach((btn) => {
          btn.classList.remove('active');
        });
        button.classList.add('active');
        activeFilter = category.id;
        showAll = false;
        visibleCount = getInitialVisibleCount();
        loadMoreBtn.style.display = 'none';

        // Filtrar y mostrar proyectos
        renderProjects();
      });

      filtersContainer.appendChild(button);
    });

    // Función para filtrar proyectos
    function filterProjects() {
      return projects.filter((project) => {
        if (activeFilter === 'all') {
          return true;
        }
        return project.categories.includes(activeFilter);
      });
    }

    // Renderizar proyectos
    function renderProjects() {
      const filteredProjects = filterProjects();
      projectsGrid.innerHTML = '';

      filteredProjects.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-categories', project.categories.join(','));
        
        // Mostrar u ocultar según visibleCount
        if (index >= visibleCount && !showAll) {
          card.classList.add('hidden');
        }
        
        card.innerHTML = `
          <div class="project-image">
            <img src="${project.image}" alt="${project.title}" />
          </div>
          <div class="project-content">
            <span class="project-category">${project.categories.map(cat => getCategoryName(cat, categories)).join(', ')}</span>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
          </div>
        `;
        projectsGrid.appendChild(card);
      });

      // Mostrar/ocultar botón "Ver Más"
      const isMobileOrTablet = window.innerWidth < 1024;
      if (isMobileOrTablet && filteredProjects.length > visibleCount && !showAll) {
        loadMoreBtn.style.display = 'block';
      } else if (window.innerWidth >= 1024 && filteredProjects.length > 9 && !showAll) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    // Manejador del botón "Ver Más"
    loadMoreBtn.addEventListener('click', () => {
      showAll = true;
      const visibleCards = document.querySelectorAll('.project-card.hidden');
      visibleCards.forEach((card) => {
        card.classList.remove('hidden');
      });
      loadMoreBtn.style.display = 'none';
    });

    // Actualizar al cambiar tamaño de ventana
    window.addEventListener('resize', () => {
      const newCount = getInitialVisibleCount();
      if (newCount !== visibleCount && !showAll) {
        visibleCount = newCount;
        renderProjects();
      }
    });

    function getCategoryName(categoryId, categories) {
      const category = categories.find((cat) => cat.id === categoryId);
      return category ? category.name : categoryId;
    }

    // Inicializar
    renderProjects();
  } catch (error) {
    console.error('Error al cargar los proyectos:', error);
  }
})();

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
