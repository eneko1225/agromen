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
    const projectsStatus = document.getElementById('projectsStatus');
    const params = new URLSearchParams(window.location.search);
    const urlFilter = params.get('categoria');
    let activeFilter = categories.some((cat) => cat.id === urlFilter) ? urlFilter : 'all';
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
      const isActive = category.id === activeFilter;
      button.type = 'button';
      button.className = `filter-btn ${isActive ? 'active' : ''}`;
      button.textContent = category.name;
      button.setAttribute('data-filter', category.id);
      button.setAttribute('aria-pressed', String(isActive));

      button.addEventListener('click', () => {
        // Actualizar botón activo
        document.querySelectorAll('.filter-btn').forEach((btn) => {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        activeFilter = category.id;
        updateUrl();
        showAll = false;
        visibleCount = getInitialVisibleCount();
        loadMoreBtn.style.display = 'none';

        // Filtrar y mostrar proyectos
        renderProjects();
      });

      filtersContainer.appendChild(button);
    });

    // Reflejar el filtro activo en la URL (?categoria=...)
    function updateUrl() {
      const url = new URL(window.location.href);
      if (activeFilter === 'all') {
        url.searchParams.delete('categoria');
      } else {
        url.searchParams.set('categoria', activeFilter);
      }
      history.replaceState(null, '', url);
    }

    function updateStatus(shown, total) {
      projectsStatus.textContent = total === 0
        ? 'No hay proyectos en esta categoría.'
        : `Mostrando ${shown} de ${total} proyectos.`;
    }

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

      if (filteredProjects.length === 0) {
        projectsGrid.innerHTML = '<p class="projects-empty">No hay proyectos en esta categoría.</p>';
      }

      filteredProjects.forEach((project, index) => {
        const card = document.createElement('article');
        card.className = 'project-card';
        card.setAttribute('data-categories', project.categories.join(','));
        
        // Mostrar u ocultar según visibleCount
        if (index >= visibleCount && !showAll) {
          card.classList.add('hidden');
        }
        
        card.innerHTML = `
          <div class="project-image">
            <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" width="${project.width}" height="${project.height}" loading="lazy" />
          </div>
          <div class="project-content">
            <span class="project-category">${escapeHtml(project.categories.map(cat => getCategoryName(cat, categories)).join(', '))}</span>
            <h3 class="project-title">${escapeHtml(project.title)}</h3>
            <p class="project-description">${escapeHtml(project.description)}</p>
          </div>
        `;
        projectsGrid.appendChild(card);
      });

      // Mostrar/ocultar botón "Ver más"
      const isMobileOrTablet = window.innerWidth < 1024;
      if (isMobileOrTablet && filteredProjects.length > visibleCount && !showAll) {
        loadMoreBtn.style.display = 'block';
      } else if (window.innerWidth >= 1024 && filteredProjects.length > 9 && !showAll) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
      }

      const shown = showAll ? filteredProjects.length : Math.min(visibleCount, filteredProjects.length);
      updateStatus(shown, filteredProjects.length);
    }

    // Manejador del botón "Ver más"
    loadMoreBtn.addEventListener('click', () => {
      showAll = true;
      const visibleCards = document.querySelectorAll('.project-card.hidden');
      visibleCards.forEach((card) => {
        card.classList.remove('hidden');
      });
      loadMoreBtn.style.display = 'none';
      const total = projectsGrid.querySelectorAll('.project-card').length;
      updateStatus(total, total);
    });

    // Actualizar al cambiar tamaño de ventana
    window.addEventListener('resize', () => {
      const newCount = getInitialVisibleCount();
      if (newCount !== visibleCount && !showAll) {
        visibleCount = newCount;
        renderProjects();
      }
    });

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function getCategoryName(categoryId, categories) {
      const category = categories.find((cat) => cat.id === categoryId);
      return category ? category.name : categoryId;
    }

    // Inicializar
    renderProjects();
  } catch (error) {
    console.error('Error al cargar los proyectos:', error);
    const projectsGrid = document.getElementById('projectsGrid');
    if (projectsGrid) {
      projectsGrid.innerHTML = '<p class="projects-empty" role="alert">No se han podido cargar los proyectos. Recarga la página para intentarlo de nuevo.</p>';
    }
  }
})();

// Año actual en el pie (el HTML trae 2025 por si no hay JS)
const currentYear = document.getElementById("currentYear");
if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

// Menú móvil
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

function setMenuOpen(open) {
  navLinks.classList.toggle("active", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(!navLinks.classList.contains("active"));
});

// Cerrar el menú al elegir una sección (el desplazamiento suave lo hace el CSS)
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navLinks.classList.contains("active")) {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

// Formulario (simulado)
const form = document.getElementById("contactForm");
if (form) {
  const formStatus = document.getElementById("formStatus");
  let isDirty = false;

  form.addEventListener("input", () => {
    isDirty = true;
    formStatus.textContent = "";
  });

  // Avisar antes de salir si hay un mensaje a medio escribir
  window.addEventListener("beforeunload", (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formStatus.textContent =
      "¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.";
    form.reset();
    isDirty = false;
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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const toggleBtn = document.getElementById("carouselToggle");
  // Pausado por el usuario (o por preferir menos movimiento)
  let userPaused = reducedMotion.matches;

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
    if (userPaused) return;
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

  function updateToggle() {
    if (!toggleBtn) return;
    toggleBtn.setAttribute("aria-label", userPaused ? "Reanudar carrusel" : "Pausar carrusel");
    toggleBtn.innerHTML = `<i class="fas ${userPaused ? "fa-play" : "fa-pause"}" aria-hidden="true"></i>`;
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      userPaused = !userPaused;
      updateToggle();
      if (userPaused) stopAutoplay();
      else startAutoplay();
    });
  }
  updateToggle();

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
      const onDone = () => {
        loaded++;
        if (loaded === images.length) init();
      };
      img.addEventListener("load", onDone, { once: true });
      img.addEventListener("error", onDone, { once: true });
    }
  });
  
  if (loaded === images.length) init();
})();
