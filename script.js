/**
 * E. Sathyanesar Portfolio
 * Optimized JavaScript with performance, accessibility, and mobile support
 */

document.addEventListener("DOMContentLoaded", () => {
  // Performance optimization flags
  const isMobile = () => window.innerWidth <= 768 || "ontouchstart" in window;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ======================
  // Performance Optimizations
  // ======================
  const initPerformance = () => {
    // Set up Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            lazyObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        lazyObserver.observe(img);
      });
    }
  };

  // ======================
  // Particles Background
  // ======================
  const initParticles = () => {
    if (typeof particlesJS === 'undefined') {
      console.warn('Particles.js not loaded');
      return;
    }

    const config = {
      particles: {
        number: {
          value: isMobile() ? 60 : 120,
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
          enable: !prefersReducedMotion,
          speed: isMobile() ? 1.5 : 2,
          direction: "none",
          random: true,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: !isMobile() && !prefersReducedMotion,
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

    try {
      particlesJS("particles-js", config);
    } catch (error) {
      console.error('Particles.js initialization failed:', error);
    }
  };

  // ======================
  // IMPROVED: Smooth Navigation
  // ======================
  const setupSmoothNavigation = () => {
    const smoothScrollTo = (targetY, duration = 800) => {
      // Respect reduced motion preference
      if (prefersReducedMotion || isMobile()) {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        return;
      }

      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      // Easing function for smooth acceleration and deceleration
      const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const scroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeInOutCubic(progress);
        
        window.scrollTo(0, startY + distance * ease);
        
        if (progress < 1) {
          requestAnimationFrame(scroll);
        }
      };

      requestAnimationFrame(scroll);
    };

    const handleNavClick = (e) => {
      const targetId = e.currentTarget.getAttribute("href");

      // Skip smooth scroll for external links and mailto
      if (targetId.startsWith("http") || targetId.startsWith("mailto:")) {
        return;
      }

      // Prevent default only for anchor links
      if (targetId.startsWith("#")) {
        e.preventDefault();

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const navbarHeight = document.querySelector("nav")?.offsetHeight || 0;
          const extraOffset = 20; // Additional offset for better visibility
          const targetPosition = targetElement.getBoundingClientRect().top + 
                               window.pageYOffset - 
                               navbarHeight - 
                               extraOffset;
          
          // Add active state to clicked nav item
          document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
          });
          e.currentTarget.classList.add('active');
          
          smoothScrollTo(targetPosition, isMobile() ? 600 : 800);
        }
      }
    };

    // Set up navigation links
    document.querySelectorAll("nav a").forEach((anchor) => {
      if (anchor.getAttribute("href").startsWith("#")) {
        anchor.addEventListener("click", handleNavClick);
      }
    });

    // Add scroll spy to highlight active section
    const setupScrollSpy = () => {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('nav a[href^="#"]');
      
      const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              }
            });
          }
        });
      }, observerOptions);

      sections.forEach(section => {
        observer.observe(section);
      });
    };

    setupScrollSpy();
  };

  // ======================
  // Sticky Navigation
  // ======================
  const setupStickyNav = () => {
    const nav = document.querySelector("nav");
    if (!nav) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNav = () => {
      const scrollY = window.scrollY;
      const shouldSticky = scrollY > 100;
      
      nav.classList.toggle("sticky", shouldSticky);
      nav.classList.toggle("scrolled", shouldSticky);

      // Hide nav on scroll down for mobile
      if (isMobile()) {
        nav.classList.toggle(
          "nav-hide",
          scrollY > lastScrollY && scrollY > 150
        );
      }
      
      lastScrollY = scrollY;
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

    window.addEventListener("scroll", throttledScrollHandler, { passive: true });
    window.addEventListener("resize", throttledScrollHandler, { passive: true });
    
    // Initial call
    updateNav();
  };

  // ======================
  // Card Hover Effects
  // ======================
  const setupCardEffects = () => {
    const cards = document.querySelectorAll(".project-card, .certificates-card, .experience-card");
    
    if (prefersReducedMotion) {
      cards.forEach(card => {
        card.style.transition = 'none';
      });
      return;
    }

    cards.forEach((card) => {
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
        // Touch feedback for mobile
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
  // Contact Form Handling
  // ======================
  const setupForm = () => {
    const form = document.getElementById("contact-form");
    const result = document.getElementById("result");
    
    if (!form || !result) return;

    const showResult = (message, isSuccess = true) => {
      result.textContent = message;
      result.style.display = "block";
      result.style.background = isSuccess ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)";
      result.style.color = isSuccess ? "#4CAF50" : "#F44336";
      
      if (isMobile()) {
        result.style.position = "fixed";
        result.style.bottom = "50px";
        result.style.left = "50%";
        result.style.transform = "translateX(-50%)";
        result.style.zIndex = "1000";
      }

      setTimeout(() => {
        result.style.display = "none";
        if (isMobile()) {
          result.style.position = "";
          result.style.bottom = "";
          result.style.left = "";
          result.style.transform = "";
        }
      }, 4000);
    };

    form.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      
      // Disable button and show loading state
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      
      const formData = new FormData(form);

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(Object.fromEntries(formData)),
        });

        const json = await response.json();
        
        if (response.status === 200) {
          showResult("Message sent successfully! Thank you.", true);
          form.reset();
        } else {
          showResult(json.message || "Failed to send message. Please try again.", false);
        }
      } catch (error) {
        console.error("Form submission error:", error);
        showResult("Network error. Please check your connection and try again.", false);
      } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  };

  // ======================
  // Scroll Animations
  // ======================
  const setupScrollAnimations = () => {
    if (prefersReducedMotion) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe elements for fade-in animation
    document.querySelectorAll('.timeline-content, .skill, .experience-card, .certificates-card, .project-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  };

  // ======================
  // Preloader
  // ======================
  const initPreloader = () => {
    const preloader = document.getElementById("preloader");
    const content = document.getElementById("content");

    if (!preloader || !content) return;

    // Minimum display time for preloader (perceived performance)
    const minDisplayTime = 1500;
    const startTime = Date.now();

    const hidePreloader = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        preloader.classList.add("hidden");
        
        setTimeout(() => {
          content.classList.add("show");
          preloader.style.display = "none";
          
          // Initialize animations after preloader is hidden
          setupScrollAnimations();
        }, 400);
      }, remaining);
    };

    // Hide preloader when everything is loaded
    if (document.readyState === 'complete') {
      hidePreloader();
    } else {
      window.addEventListener('load', hidePreloader);
    }

    // Fallback: hide preloader after 3 seconds max
    setTimeout(hidePreloader, 3000);
  };

  // ======================
  // Particles Resize Handler
  // ======================
  const handleParticlesResize = () => {
    if (window.pJSDom?.[0]?.pJS?.fn?.vendors?.destroypJS) {
      try {
        window.pJSDom[0].pJS.fn.particlesEmpty();
        window.pJSDom[0].pJS.fn.canvasClear();
        window.pJSDom[0].pJS.fn.vendors.destroypJS();
        window.pJSDom = [];
      } catch (error) {
        console.warn('Error destroying particles:', error);
      }
    }
    
    // Reinitialize after a short delay
    setTimeout(initParticles, 100);
  };

  // ======================
  // Initialize Everything
  // ======================
  const init = () => {
    initPerformance();
    initParticles();
    setupSmoothNavigation();
    setupStickyNav();
    setupCardEffects();
    setupForm();
    initPreloader();

    // Debounced resize handler for particles
    let resizeTimeout;
    const debouncedResizeHandler = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleParticlesResize, 250);
    };

    window.addEventListener("resize", debouncedResizeHandler, { passive: true });
  };

  // Start initialization
  init();
});

// Error handling for better user experience
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});