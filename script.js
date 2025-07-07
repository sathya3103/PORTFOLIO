document.addEventListener("DOMContentLoaded", () => {
  // Custom smooth scroll (faster than default)
  function smoothScrollTo(targetY, duration = 300) {
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

  // Smooth scrolling for nav links
  const handleNavClick = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const navbarHeight = document.querySelector("nav").offsetHeight;
      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.pageYOffset -
        navbarHeight;

      smoothScrollTo(targetPosition, 300); // faster scroll (300ms)

      // Update URL without reload
      history.pushState(null, null, targetId);
    }
  };

  document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", handleNavClick);
  });

  // Sticky nav on scroll
  const nav = document.querySelector("nav");
  if (nav) {
    const navScrollHandler = () => {
      const shouldSticky = window.scrollY > 100;
      nav.classList.toggle("sticky", shouldSticky);
      nav.classList.toggle("scrolled", shouldSticky);
    };

    window.addEventListener("scroll", navScrollHandler, { passive: true });

    // Initialize sticky state
    navScrollHandler();
  }

  // Card hover effects
  document
    .querySelectorAll(".project-card, .achievement-card")
    .forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-5px)";
        card.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        card.style.boxShadow = "";
      });
    });

  // Form submission handler
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
          }, 3000);
        });
    });
  } else {
    if (!form) console.error("Form element with id 'contact-form' not found.");
    if (!result) console.error("Result element with id 'result' not found.");
  }

  // Auto-scroll functionality
  function setupAutoScroll(containerSelector, scrollSpeed = 50) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    let scrollPosition = 0;
    let isPaused = false;
    let scrollInterval;

    function startScrolling() {
      scrollInterval = setInterval(() => {
        if (!isPaused) {
          scrollPosition += 1;
          if (
            scrollPosition >=
            container.scrollWidth - container.clientWidth
          ) {
            scrollPosition = 0;
          }
          container.scrollTo({
            left: scrollPosition,
            behavior: "smooth",
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

    startScrolling();

    window.addEventListener("beforeunload", () => {
      clearInterval(scrollInterval);
    });
  }

  // Initialize auto-scroll containers
  setupAutoScroll(".achievements-container");
  setupAutoScroll(".projects-container");
});
