(function() {
  'use strict';

  window.__app = window.__app || {};

  function debounce(func, wait) {
    var timeout;
    return function executedFunction() {
      var context = this;
      var args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (__app.burgerInitialized) return;
    __app.burgerInitialized = true;

    var toggle = document.querySelector('.navbar-toggler, .c-nav__toggle');
    var collapse = document.querySelector('.navbar-collapse');
    
    if (!toggle || !collapse) return;

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      var isOpen = collapse.classList.contains('show');
      
      if (isOpen) {
        collapse.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('u-no-scroll');
      } else {
        collapse.classList.add('show');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('u-no-scroll');
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && collapse.classList.contains('show')) {
        collapse.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('u-no-scroll');
      }
    });

    var navLinks = document.querySelectorAll('.nav-link, .c-nav__link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (window.innerWidth < 1024 && collapse.classList.contains('show')) {
          collapse.classList.remove('show');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('u-no-scroll');
        }
      });
    }

    window.addEventListener('resize', function() {
      if (window.innerWidth >= 1024 && collapse.classList.contains('show')) {
        collapse.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('u-no-scroll');
      }
    });
  }

  function initSmoothScroll() {
    if (__app.smoothScrollInitialized) return;
    __app.smoothScrollInitialized = true;

    var isHomepage = location.pathname === '/' || location.pathname.endsWith('/index.html');

    if (!isHomepage) {
      var sectionLinks = document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href="#!"])');
      for (var i = 0; i < sectionLinks.length; i++) {
        var link = sectionLinks[i];
        var hash = link.getAttribute('href');
        if (hash.startsWith('#') && hash.length > 1) {
          link.setAttribute('href', '/' + hash);
        }
      }
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      
      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#' || href === '#!') return;

      var targetElement = document.querySelector(href);
      if (!targetElement) return;

      e.preventDefault();

      var header = document.querySelector('.l-header');
      var headerHeight = header ? header.offsetHeight : 80;
      var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  }

  function initScrollSpy() {
    if (__app.scrollSpyInitialized) return;
    __app.scrollSpyInitialized = true;

    var sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return;

    var navLinks = document.querySelectorAll('.nav-link[href^="#"], .c-nav__link[href^="#"]');
    
    function updateActiveLink() {
      var scrollPosition = window.pageYOffset + 100;

      sections.forEach(function(section) {
        var sectionTop = section.offsetTop;
        var sectionHeight = section.offsetHeight;
        var sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach(function(link) {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', throttle(updateActiveLink, 100));
    updateActiveLink();
  }

  function initActiveMenu() {
    if (__app.activeMenuInitialized) return;
    __app.activeMenuInitialized = true;

    var navLinks = document.querySelectorAll('.nav-link, .c-nav__link');
    var currentPath = location.pathname;

    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].removeAttribute('aria-current');
      navLinks[i].classList.remove('active');
    }

    for (var j = 0; j < navLinks.length; j++) {
      var link = navLinks[j];
      var href = link.getAttribute('href');
      
      if (href === currentPath || 
          (currentPath === '/' && href === '/index.html') ||
          (currentPath.endsWith('/index.html') && href === '/')) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
        break;
      }
    }
  }

  function initImages() {
    if (__app.imagesInitialized) return;
    __app.imagesInitialized = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.hasAttribute('loading') && 
          !img.classList.contains('c-logo__img') && 
          !img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      img.style.opacity = '0';
      img.style.transform = 'translateY(20px)';
      img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

      (function(image) {
        if (image.complete) {
          setTimeout(function() {
            image.style.opacity = '1';
            image.style.transform = 'translateY(0)';
          }, 100);
        } else {
          image.addEventListener('load', function() {
            image.style.opacity = '1';
            image.style.transform = 'translateY(0)';
          });
        }

        image.addEventListener('error', function() {
          var svgPlaceholder = 'data:image/svg+xml;base64,' + btoa(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="#e9ecef">' +
            '<rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>' +
            '<text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#6c757d">Bild nicht verfügbar</text>' +
            '</svg>'
          );
          image.src = svgPlaceholder;
          image.style.objectFit = 'contain';
          image.style.opacity = '1';
          image.style.transform = 'translateY(0)';
        });
      })(img);
    }
  }

  function initFormValidation() {
    if (__app.formValidationInitialized) return;
    __app.formValidationInitialized = true;

    var forms = document.querySelectorAll('.c-form, form');
    
    var notificationContainer = document.createElement('div');
    notificationContainer.className = 'position-fixed top-0 end-0 p-3';
    notificationContainer.style.zIndex = '1056';
    document.body.appendChild(notificationContainer);

    function notify(message, type) {
      var alertClass = 'alert-' + (type || 'info');
      var alert = document.createElement('div');
      alert.className = 'alert ' + alertClass + ' alert-dismissible fade show';
      alert.style.animation = 'slideInRight 0.4s ease-out';
      alert.innerHTML = message + '<button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>';
      
      notificationContainer.appendChild(alert);
      
      setTimeout(function() {
        if (alert.parentNode) {
          alert.style.animation = 'slideOutRight 0.4s ease-out';
          setTimeout(function() {
            if (alert.parentNode) {
              alert.parentNode.removeChild(alert);
            }
          }, 400);
        }
      }, 5000);
    }

    var style = document.createElement('style');
    style.textContent = '@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}';
    document.head.appendChild(style);

    __app.notify = notify;

    function validateField(field) {
      var value = field.value.trim();
      var fieldName = field.getAttribute('name');
      var fieldType = field.getAttribute('type');
      var errorDiv = field.parentElement.querySelector('.invalid-feedback');
      
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentElement.appendChild(errorDiv);
      }

      field.classList.remove('is-invalid');
      errorDiv.textContent = '';

      if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        errorDiv.textContent = 'Dieses Feld ist erforderlich.';
        errorDiv.style.display = 'block';
        return false;
      }

      if (fieldName === 'vorname' || fieldName === 'nachname') {
        var nameRegex = /^[a-zA-ZÀ-ÿs-']{2,50}$/;
        if (value && !nameRegex.test(value)) {
          field.classList.add('is-invalid');
          errorDiv.textContent = 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen, nur Buchstaben).';
          errorDiv.style.display = 'block';
          return false;
        }
      }

      if (fieldType === 'email' || fieldName === 'email') {
        var emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
        if (value && !emailRegex.test(value)) {
          field.classList.add('is-invalid');
          errorDiv.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
          errorDiv.style.display = 'block';
          return false;
        }
      }

      if (fieldType === 'tel' || fieldName === 'telefon') {
        var phoneRegex = /^[ds+-()]{10,20}$/;
        if (value && !phoneRegex.test(value)) {
          field.classList.add('is-invalid');
          errorDiv.textContent = 'Bitte geben Sie eine gültige Telefonnummer ein.';
          errorDiv.style.display = 'block';
          return false;
        }
      }

      if (field.tagName === 'TEXTAREA' && fieldName === 'nachricht') {
        if (value && value.length < 10) {
          field.classList.add('is-invalid');
          errorDiv.textContent = 'Die Nachricht muss mindestens 10 Zeichen lang sein.';
          errorDiv.style.display = 'block';
          return false;
        }
      }

      if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
        field.classList.add('is-invalid');
        errorDiv.textContent = 'Sie müssen dieses Feld akzeptieren.';
        errorDiv.style.display = 'block';
        return false;
      }

      errorDiv.style.display = 'none';
      return true;
    }

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      
      var fields = form.querySelectorAll('input, select, textarea');
      for (var j = 0; j < fields.length; j++) {
        (function(field) {
          field.addEventListener('blur', function() {
            validateField(field);
          });

          field.addEventListener('input', function() {
            if (field.classList.contains('is-invalid')) {
              validateField(field);
            }
          });
        })(fields[j]);
      }

      form.addEventListener('submit', function(e) {
        var currentForm = this;
        e.preventDefault();
        e.stopPropagation();

        var formFields = currentForm.querySelectorAll('input, select, textarea');
        var isValid = true;

        for (var k = 0; k < formFields.length; k++) {
          if (!validateField(formFields[k])) {
            isValid = false;
          }
        }

        if (!isValid) {
          notify('Bitte füllen Sie alle erforderlichen Felder korrekt aus.', 'danger');
          return;
        }

        var submitButton = currentForm.querySelector('button[type="submit"], input[type="submit"]');
        var originalText = submitButton ? submitButton.innerHTML : '';
        
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.style.position = 'relative';
          submitButton.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px"></span>Wird gesendet...';
        }

        var spinStyle = document.createElement('style');
        spinStyle.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
        document.head.appendChild(spinStyle);

        setTimeout(function() {
          notify('Ihre Nachricht wurde erfolgreich gesendet!', 'success');
          
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
          }

          currentForm.reset();
          var invalidFields = currentForm.querySelectorAll('.is-invalid');
          for (var m = 0; m < invalidFields.length; m++) {
            invalidFields[m].classList.remove('is-invalid');
          }
          var feedbacks = currentForm.querySelectorAll('.invalid-feedback');
          for (var n = 0; n < feedbacks.length; n++) {
            feedbacks[n].style.display = 'none';
          }

          setTimeout(function() {
            window.location.href = 'thank_you.html';
          }, 1500);
        }, 1500);
      });
    }
  }

  function initScrollAnimations() {
    if (__app.scrollAnimationsInitialized) return;
    __app.scrollAnimationsInitialized = true;

    var observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    var animatedElements = document.querySelectorAll('.card, .c-card, .c-stat, .c-team-card, .c-feature-grid > *, section > .container > *');
    
    for (var i = 0; i < animatedElements.length; i++) {
      var element = animatedElements[i];
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setTimeout(function() {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, 100);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    for (var j = 0; j < animatedElements.length; j++) {
      observer.observe(animatedElements[j]);
    }
  }

  function initCountUp() {
    if (__app.countUpInitialized) return;
    __app.countUpInitialized = true;

    var stats = document.querySelectorAll('.c-stat h3');
    
    function animateCount(element) {
      var text = element.textContent;
      var number = parseInt(text.match(/d+/));
      
      if (isNaN(number)) return;

      var suffix = text.replace(/d+/, '').trim();
      var duration = 2000;
      var start = 0;
      var increment = number / (duration / 16);
      var current = start;

      element.textContent = '0' + (suffix ? ' ' + suffix : '');

      var timer = setInterval(function() {
        current += increment;
        if (current >= number) {
          current = number;
          clearInterval(timer);
        }
        element.textContent = Math.floor(current) + (suffix ? ' ' + suffix : '');
      }, 16);
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    for (var i = 0; i < stats.length; i++) {
      observer.observe(stats[i]);
    }
  }

  function initButtonEffects() {
    if (__app.buttonEffectsInitialized) return;
    __app.buttonEffectsInitialized = true;

    var buttons = document.querySelectorAll('.btn, .c-button, a.card, a.c-card');
    
    for (var i = 0; i < buttons.length; i++) {
      (function(button) {
        button.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
        });

        button.addEventListener('click', function(e) {
          var ripple = document.createElement('span');
          var rect = this.getBoundingClientRect();
          var size = Math.max(rect.width, rect.height);
          var x = e.clientX - rect.left - size / 2;
          var y = e.clientY - rect.top - size / 2;

          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          ripple.style.position = 'absolute';
          ripple.style.borderRadius = '50%';
          ripple.style.background = 'rgba(255, 255, 255, 0.6)';
          ripple.style.transform = 'scale(0)';
          ripple.style.animation = 'ripple 0.6s ease-out';
          ripple.style.pointerEvents = 'none';

          if (this.style.position !== 'absolute' && this.style.position !== 'relative') {
            this.style.position = 'relative';
          }
          this.style.overflow = 'hidden';

          this.appendChild(ripple);

          setTimeout(function() {
            ripple.remove();
          }, 600);
        });
      })(buttons[i]);
    }

    var rippleStyle = document.createElement('style');
    rippleStyle.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0}}';
    document.head.appendChild(rippleStyle);
  }

  function initCardHover() {
    if (__app.cardHoverInitialized) return;
    __app.cardHoverInitialized = true;

    var cards = document.querySelectorAll('.card, .c-card');
    
    for (var i = 0; i < cards.length; i++) {
      (function(card) {
        card.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';

        card.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0) scale(1)';
        });
      })(cards[i]);
    }
  }

  function initScrollToTop() {
    if (__app.scrollToTopInitialized) return;
    __app.scrollToTopInitialized = true;

    var scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,var(--color-gold),var(--color-gold-light));color:var(--color-charcoal-dark);border:none;font-size:24px;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s ease-out;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,0.2)';
    scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    });

    scrollBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    scrollBtn.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1) translateY(-2px)';
    });

    scrollBtn.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) translateY(0)';
    });
  }

  function initAccordion() {
    if (__app.accordionInitialized) return;
    __app.accordionInitialized = true;

    var accordionButtons = document.querySelectorAll('.accordion-button');
    
    for (var i = 0; i < accordionButtons.length; i++) {
      (function(button) {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          
          var target = this.getAttribute('data-bs-target');
          var collapse = document.querySelector(target);
          
          if (!collapse) return;

          var isExpanded = this.getAttribute('aria-expanded') === 'true';
          
          if (isExpanded) {
            collapse.classList.remove('show');
            this.classList.add('collapsed');
            this.setAttribute('aria-expanded', 'false');
          } else {
            collapse.classList.add('show');
            this.classList.remove('collapsed');
            this.setAttribute('aria-expanded', 'true');
          }
        });
      })(accordionButtons[i]);
    }
  }

  function initParallax() {
    if (__app.parallaxInitialized) return;
    __app.parallaxInitialized = true;

    var hero = document.querySelector('.c-hero, .hero-section');
    
    if (!hero) return;

    window.addEventListener('scroll', throttle(function() {
      var scrolled = window.pageYOffset;
      var rate = scrolled * 0.5;
      hero.style.transform = 'translate3d(0, ' + rate + 'px, 0)';
    }, 16));
  }

  __app.init = function() {
    if (__app.initialized) return;
    __app.initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initImages();
    initFormValidation();
    initScrollAnimations();
    initCountUp();
    initButtonEffects();
    initCardHover();
    initScrollToTop();
    initAccordion();
    initParallax();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __app.init);
  } else {
    __app.init();
  }

})();
