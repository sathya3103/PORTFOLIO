document.addEventListener("DOMContentLoaded", () => {
  // Check if device is mobile
  const isMobile = () => window.innerWidth <= 768 || 'ontouchstart' in window;

  // Custom smooth scroll with mobile support
  function smoothScrollTo(targetY, duration = 300) {
    // Skip smooth scroll on mobile for better performance
    if (isMobile()) {
      window.scrollTo(0, targetY);
      return;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function scroll(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out

      window.scrollTo(0, startY + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    }

    requestAnimationFrame(scroll);
  }

  // Enhanced smooth scrolling for nav links with mobile support
  const handleNavClick = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const navbarHeight = document.querySelector("nav").offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

      smoothScrollTo(targetPosition, isMobile() ? 200 : 300); // faster scroll on mobile

      // Update URL without reload
      history.pushState(null, null, targetId);
    }
  };

  // Add click and touch events for navigation
  document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", handleNavClick);
    anchor.addEventListener("touchend", handleNavClick); // For mobile touch support
  });

  // Responsive sticky nav with throttled scroll handler
  const nav = document.querySelector("nav");
  if (nav) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const navScrollHandler = () => {
      const shouldSticky = window.scrollY > 100;
      nav.classList.toggle("sticky", shouldSticky);
      nav.classList.toggle("scrolled", shouldSticky);
      
      // Hide/show on scroll direction (mobile only)
      if (isMobile()) {
        const scrollDirection = window.scrollY > lastScrollY ? 'down' : 'up';
        nav.classList.toggle('nav-hide', scrollDirection === 'down' && window.scrollY > 150);
        lastScrollY = window.scrollY;
      }
    };

    // Throttled scroll event for performance
    const throttledScrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          navScrollHandler();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScrollHandler, { passive: true });

    // Initialize sticky state
    navScrollHandler();

    // Handle resize events
    window.addEventListener('resize', throttledScrollHandler);
  }

  // Responsive card hover/touch effects
  document.querySelectorAll(".project-card, .achievement-card").forEach((card) => {
    if (!isMobile()) {
      // Desktop hover effects
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-5px)";
        card.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
        card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        card.style.boxShadow = "";
      });
    } else {
      // Mobile touch effects
      card.addEventListener("touchstart", () => {
        card.style.transform = "translateY(-2px)";
        card.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
        card.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
      });

      card.addEventListener("touchend", () => {
        setTimeout(() => {
          card.style.transform = "";
          card.style.boxShadow = "";
        }, 150);
      });
    }
  });

  // Form submission handler with mobile adjustments
  const form = document.getElementById("contact-form");
  const result = document.getElementById("result");

  if (form && result) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      result.style.display = "block";
      result.innerHTML = "Please wait...";

      // Adjust result position for mobile
      if (isMobile()) {
        result.style.position = "fixed";
        result.style.bottom = "20px";
        result.style.left = "50%";
        result.style.transform = "translateX(-50%)";
      }

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      })
        .then(async (response) => {
          let json = await response.json();
          if (response.status === 200) {
            result.innerHTML = "Form submitted successfully";
          } else {
            result.innerHTML = json.message || "Submission failed";
          }
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
  }

  // Responsive auto-scroll functionality
  function setupAutoScroll(containerSelector, scrollSpeed = 50) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Disable auto-scroll on mobile for better UX
    if (isMobile()) {
      container.style.overflowX = "auto";
      container.style.scrollSnapType = "x mandatory";
      return;
    }

    let scrollPosition = 0;
    let isPaused = false;
    let scrollInterval;
    let requestId;

    function startScrolling() {
      scrollInterval = setInterval(() => {
        if (!isPaused) {
          scrollPosition += 1;
          if (scrollPosition >= container.scrollWidth - container.clientWidth) {
            scrollPosition = 0;
          }
          
          // Use requestAnimationFrame for smoother animation
          requestId = requestAnimationFrame(() => {
            container.scrollTo({
              left: scrollPosition,
              behavior: "smooth",
            });
          });
        }
      }, scrollSpeed);
    }

    container.addEventListener("mouseenter", () => {
      isPaused = true;
    });

    container.addEventListener("mouseleave", () => {
      isPaused = false;
    });

    // Touch events for mobile (even though auto-scroll is disabled)
    container.addEventListener("touchstart", () => {
      isPaused = true;
    });

    container.addEventListener("touchend", () => {
      isPaused = false;
    });

    startScrolling();

    // Cleanup
    window.addEventListener("beforeunload", () => {
      clearInterval(scrollInterval);
      cancelAnimationFrame(requestId);
    });
  }

  // Initialize auto-scroll containers
  setupAutoScroll(".achievements-container");
  setupAutoScroll(".projects-container");

  // Handle orientation changes
  window.addEventListener("orientationchange", () => {
    // Reinitialize sticky nav and other elements
    if (nav) {
      const navScrollHandler = () => {
        const shouldSticky = window.scrollY > 100;
        nav.classList.toggle("sticky", shouldSticky);
        nav.classList.toggle("scrolled", shouldSticky);
      };
      navScrollHandler();
    }
  });
});