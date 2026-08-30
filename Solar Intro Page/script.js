(function () {
    const header = document.getElementById("siteHeader");
    const menuButton = document.querySelector(".menu-toggle");
    const navPanel = document.getElementById("navMenu");
    const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
    const backToTop = document.querySelector(".back-to-top");
    const counters = document.querySelectorAll(".counter");
    const revealItems = document.querySelectorAll(".reveal");
    const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
    const form = document.getElementById("enquiryForm");
    const formStatus = document.getElementById("formStatus");

    const setHeaderState = () => {
        const isScrolled = window.scrollY > 18;
        header.classList.toggle("scrolled", isScrolled);
        backToTop.classList.toggle("visible", window.scrollY > 500);
    };

    const closeMenu = () => {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
        navPanel.classList.remove("open");
        document.body.classList.remove("menu-open");
    };

    const toggleMenu = () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
        navPanel.classList.toggle("open", !isOpen);
        document.body.classList.toggle("menu-open", !isOpen);
    };

    const animateCounter = (counter) => {
        const target = Number(counter.dataset.target || 0);
        const suffix = counter.dataset.suffix || "";
        const duration = 1300;
        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * eased);
            counter.textContent = `${value}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    };

    const setActiveNav = () => {
        const sections = navLinks
            .map((link) => document.querySelector(link.getAttribute("href")))
            .filter(Boolean);
        const current = sections.reduce((active, section) => {
            const offset = section.getBoundingClientRect().top;
            return offset <= 130 ? section.id : active;
        }, "home");

        navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
        });
    };

    const validators = {
        name: (value) => value.trim().length >= 2,
        phone: (value) => /^[+()0-9\s-]{7,18}$/.test(value.trim()),
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
        service: (value) => value.trim().length > 0,
        message: (value) => value.trim().length >= 10
    };

    const validateField = (field) => {
        const row = field.closest(".form-row");
        const validator = validators[field.name];
        const valid = validator ? validator(field.value) : field.checkValidity();
        row.classList.toggle("invalid", !valid);
        field.setAttribute("aria-invalid", String(!valid));
        return valid;
    };

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.16 });

        revealItems.forEach((item) => revealObserver.observe(item));

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    entry.target.dataset.counted = "true";
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.55 });

        counters.forEach((counter) => counterObserver.observe(counter));
    } else {
        revealItems.forEach((item) => item.classList.add("visible"));
        counters.forEach(animateCounter);
    }

    if (heroSlides.length) {
        let activeSlide = 0;

        const showSlide = (index) => {
            heroSlides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === index);
            });
        };

        showSlide(activeSlide);
        setInterval(() => {
            activeSlide = (activeSlide + 1) % heroSlides.length;
            showSlide(activeSlide);
        }, 4000);
    }

    menuButton.addEventListener("click", toggleMenu);
    navLinks.forEach((link) => link.addEventListener("click", closeMenu));
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 920) {
            closeMenu();
        }
    });

    window.addEventListener("scroll", () => {
        setHeaderState();
        setActiveNav();
    }, { passive: true });

    if (form) {
        const fields = Array.from(form.querySelectorAll("input, select, textarea"));
        const whatsappNumber = "919458204216";

        fields.forEach((field) => {
            field.addEventListener("blur", () => validateField(field));
            field.addEventListener("input", () => {
                if (field.getAttribute("aria-invalid") === "true") {
                    validateField(field);
                }
            });
        });

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const isValid = fields.every(validateField);

            if (!isValid) {
                formStatus.textContent = "Please fix the highlighted fields and try again.";
                formStatus.style.color = "#b42318";
                return;
            }

            const formData = Object.fromEntries(new FormData(form).entries());
            const message = [
                "*New Solar Enquiry*",
                "",
                `Name: ${formData.name}`,
                `Phone: ${formData.phone}`,
                `Email: ${formData.email}`,
                `Service Required: ${formData.service}`,
                "",
                `Message: ${formData.message}`
            ].join("\n");

            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");

            form.reset();
            fields.forEach((field) => {
                field.removeAttribute("aria-invalid");
                field.closest(".form-row").classList.remove("invalid");
            });
            formStatus.textContent = "Enquiry sent successfully. WhatsApp is opening with your message.";
            formStatus.style.color = "#2E7D32";
        });
    }

    setHeaderState();
    setActiveNav();
})();
