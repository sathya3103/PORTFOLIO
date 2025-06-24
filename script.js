document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for nav links
  const handleNavClick = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const navbarHeight = document.querySelector('nav').offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Update URL without reload
      history.pushState(null, null, targetId);
    }
  };

  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', handleNavClick);
  });

  // Animate progress bars on intersection
  const animateProgressBars = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const progressBars = entry.target.querySelectorAll('.progress');

        progressBars.forEach(bar => {
          const targetWidth = bar.getAttribute('data-width') || bar.style.width;
          bar.style.transition = 'width 1.5s ease-in-out';
          bar.style.width = targetWidth;
        });

        observer.unobserve(entry.target);
      }
    });
  };

  const skillsObserver = new IntersectionObserver(animateProgressBars, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });

  const skillsSection = document.getElementById('skills');
  if (skillsSection) skillsObserver.observe(skillsSection);

  // Sticky nav on scroll
  const nav = document.querySelector('nav');
  if (nav) {
    const navScrollHandler = () => {
      const shouldSticky = window.scrollY > 100;
      nav.classList.toggle('sticky', shouldSticky);
      nav.classList.toggle('scrolled', shouldSticky);
    };

    window.addEventListener('scroll', navScrollHandler, { passive: true });

    // Initialize sticky state
    navScrollHandler();
  }

  // Card hover effects
  document.querySelectorAll('.project-card, .achievement-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

  // Form submission handler
  const form = document.getElementById('contact-form');
  const result = document.getElementById('result');

  if (form && result) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      result.style.display = 'block';
      result.innerHTML = "Please wait...";

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      })
      .then(async (response) => {
        let json = await response.json();
        if (response.status === 200) {
          result.innerHTML = "Form submitted successfully";
        } else {
          result.innerHTML = json.message || "Submission failed";
        }
      })
      .catch(error => {
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
});
