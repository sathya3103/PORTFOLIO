document.addEventListener("DOMContentLoaded", () => {
  // Combined responsive functionality
  const isMobile = () => window.innerWidth <= 768 || "ontouchstart" in window;

  // ======================
  // Particles Background
  // ======================
  const initParticles = () => {
    const config = {
      particles: {
        number: {
          value: isMobile() ? 80 : 150,
          density: {
            enable: true,
            value_area: isMobile() ? 600 : 800,
          },
        },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
          value: isMobile() ? 0.7 : 0.5,
          random: true,
        },
        size: {
          value: isMobile() ? 4 : 3,
          random: true,
        },
        line_linked: {
          enable: true,
          distance: isMobile() ? 100 : 150,
          color: "#ffffff",
          opacity: isMobile() ? 0.6 : 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: isMobile() ? 1.5 : 2,
          direction: "none",
          random: true,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: !isMobile(),
            mode: "grab",
          },
          onclick: {
            enable: true,
            mode: isMobile() ? "bubble" : "push",
          },
          resize: true,
        },
        modes: {
          grab: { distance: 140, line_linked: { opacity: 1 } },
          bubble: {
            distance: isMobile() ? 150 : 250,
            size: isMobile() ? 6 : 10,
            duration: 2,
            opacity: 0.8,
            speed: 3,
          },
          push: { particles_nb: 4 },
        },
      },
      retina_detect: true,
    };

    particlesJS("particles-js", config);
  };

  // ======================
  // Smooth Navigation (Fixed)
  // ======================
  const setupSmoothNavigation = () => {
    const smoothScrollTo = (targetY, duration = 300) => {
      if (isMobile()) {
        window.scrollTo(0, targetY);
        return;
      }

      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      const scroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, startY + distance * ease);
        if (progress < 1) requestAnimationFrame(scroll);
      };

      requestAnimationFrame(scroll);
    };

    const handleNavClick = (e) => {
      // Only prevent default for non-mailto links and click events
      const targetId = e.currentTarget.getAttribute("href");

      if (targetId.startsWith("mailto:")) {
        return; // Let default mailto behavior happen
      }

      if (e.type === "click") {
        e.preventDefault();
      }

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navbarHeight = document.querySelector("nav")?.offsetHeight || 0;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          navbarHeight;
        smoothScrollTo(targetPosition, isMobile() ? 200 : 300);

        if (targetId.startsWith("#")) {
          history.pushState(null, null, targetId);
        }
      }
    };

    // Set up all navigation links
    document.querySelectorAll("nav a").forEach((anchor) => {
      // Click needs to be active for anchor links
      if (anchor.getAttribute("href").startsWith("#")) {
        anchor.addEventListener("click", handleNavClick);
      }

      // Touch can be passive
      anchor.addEventListener("touchend", handleNavClick, { passive: true });
    });
  };

  // ======================
  // Responsive Sticky Nav
  // ======================
  const setupStickyNav = () => {
    const nav = document.querySelector("nav");
    if (!nav) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNav = () => {
      const shouldSticky = window.scrollY > 100;
      nav.classList.toggle("sticky", shouldSticky);
      nav.classList.toggle("scrolled", shouldSticky);

      if (isMobile()) {
        nav.classList.toggle(
          "nav-hide",
          window.scrollY > lastScrollY && window.scrollY > 150
        );
        lastScrollY = window.scrollY;
      }
    };

    const throttledScrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateNav();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScrollHandler, {
      passive: true,
    });
    window.addEventListener("resize", throttledScrollHandler, {
      passive: true,
    });
    updateNav();
  };

  // ======================
  // Card Hover Effects
  // ======================
  const setupCardEffects = () => {
    document
      .querySelectorAll(".project-card, .achievement-card")
      .forEach((card) => {
        if (!isMobile()) {
          card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-5px)";
            card.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
          });
          card.addEventListener("mouseleave", () => {
            card.style.transform = "";
            card.style.boxShadow = "";
          });
        } else {
          card.addEventListener(
            "touchstart",
            () => {
              card.style.transform = "translateY(-2px)";
              card.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
            },
            { passive: true }
          );

          card.addEventListener(
            "touchend",
            () => {
              setTimeout(() => {
                card.style.transform = "";
                card.style.boxShadow = "";
              }, 150);
            },
            { passive: true }
          );
        }
      });
  };

  // ======================
  // Form Handling
  // ======================
  const setupForm = () => {
    const form = document.getElementById("contact-form");
    const result = document.getElementById("result");
    if (!form || !result) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(form);

      result.style.display = "block";
      result.innerHTML = "Please wait...";

      if (isMobile()) {
        result.style.position = "fixed";
        result.style.bottom = "50px";
        result.style.left = "50%";
        result.style.transform = "translateX(-50%)";
      }

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })
        .then(async (response) => {
          const json = await response.json();
          result.innerHTML =
            response.status === 200
              ? "Form submitted"
              : json.message || "Submission failed";
        })
        .catch((error) => {
          console.error(error);
          result.innerHTML = "Something went wrong!";
        })
        .finally(() => {
          form.reset();
          setTimeout(() => {
            result.style.display = "none";
            if (isMobile()) {
              result.style.position = "";
              result.style.bottom = "";
              result.style.left = "";
              result.style.transform = "";
            }
          }, 3000);
        });
    });
  };

  // ======================
  // Fixed Particles.js Resize Handler
  // ======================
  const handleParticlesResize = () => {
    if (window.pJSDom?.[0]?.pJS?.fn?.vendors?.destroypJS) {
      window.pJSDom[0].pJS.fn.particlesEmpty();
      window.pJSDom[0].pJS.fn.canvasClear();
      window.pJSDom[0].pJS.fn.vendors.destroypJS();
      window.pJSDom = [];
    }
    initParticles();
  };

  // ======================
  // Initialize Everything
  // ======================
  initParticles();
  setupSmoothNavigation();
  setupStickyNav();
  setupCardEffects();
  setupForm();

  // Debounced resize handler for particles
  let resizeTimeout;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleParticlesResize, 200);
    },
    { passive: true }
  );
});

window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");
  const content = document.getElementById("content");

  // Force preloader to stay visible for 3 seconds
  setTimeout(() => {
    preloader.classList.add("hidden");
    setTimeout(() => {
      content.classList.add("show");
      preloader.style.display = "none";
    }, 500); // match CSS fade
  }, 2000); // ⬅️ 2 seconds
});
