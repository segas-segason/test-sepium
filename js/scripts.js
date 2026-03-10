document.querySelectorAll('.good-card').forEach((card) => {
    const materialButtons = card.querySelectorAll('.good-card__material-button');
    const likeButton = card.querySelector('.good-card__likes-button');
    const likeCounter = likeButton?.querySelector('.good-card__likes-count');

    const imageElement = card.querySelector('[data-slide-image]');
    const prevButton = card.querySelector('[data-nav-prev]');
    const nextButton = card.querySelector('[data-nav-next]');
    const zoomButton = card.querySelector('[data-zoom-button]');
    const paginationButtons = [...card.querySelectorAll('[data-pagination-index]')];

    materialButtons.forEach((button) => {
        button.addEventListener('click', () => {
            materialButtons.forEach((btn) => {
                btn.classList.remove('good-card__material-button--active');
            });

            button.classList.add('good-card__material-button--active');
        });
    });

    likeButton?.addEventListener('click', () => {
        likeButton.classList.toggle('good-card__likes-button--active');

        if (!likeCounter) return;

        const count = parseInt(likeCounter.textContent, 10);
        if (Number.isNaN(count)) return;

        likeCounter.textContent = likeButton.classList.contains('good-card__likes-button--active')
            ? count + 1
            : count - 1;
    });

    card.addEventListener('click', (e) => {
        const interactive = e.target.closest('button, a, .pagination__button');

        if (interactive) return;

        window.open('/card.html', '_blank');
    });

    const rawSlides = card.dataset.sliderImages;
    if (!imageElement || !rawSlides) return;

    let slides = [];

    try {
        slides = JSON.parse(rawSlides);
    } catch (error) {
        console.error('Ошибка парсинга data-slider-images:', error);
        return;
    }

    if (!Array.isArray(slides) || !slides.length) return;

    let currentIndex = 0;
    let autoplayId = null;
    const mobileMedia = window.matchMedia('(max-width: 767px)');

    function renderSlide(index) {
        const slide = slides[index];
        if (!slide) return;

        imageElement.src = slide.src;
        imageElement.alt = slide.alt || '';

        paginationButtons.forEach((button, buttonIndex) => {
            button.classList.toggle('pagination__button--active', buttonIndex === index);
        });

        currentIndex = index;
    }

    function showNextSlide() {
        renderSlide(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
    }

    function showPrevSlide() {
        renderSlide(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
    }

    function stopAutoplay() {
        if (!autoplayId) return;

        clearInterval(autoplayId);
        autoplayId = null;
    }

    function startAutoplay() {
        stopAutoplay();

        if (!mobileMedia.matches) return;

        autoplayId = setInterval(showNextSlide, 3000);
    }

    function restartAutoplay() {
        startAutoplay();
    }

    prevButton?.addEventListener('click', () => {
        showPrevSlide();
        restartAutoplay();
    });

    nextButton?.addEventListener('click', () => {
        showNextSlide();
        restartAutoplay();
    });

    paginationButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.paginationIndex);
            if (Number.isNaN(index)) return;

            renderSlide(index);
            restartAutoplay();
        });
    });

    zoomButton?.addEventListener('click', () => {
        Fancybox.show(
            slides.map((slide) => ({
                src: slide.src,
                type: 'image',
            })),
            {
                startIndex: currentIndex,
                Thumbs: false,
                Toolbar: {
                    display: {
                        left: [],
                        middle: [],
                        right: [
                            'zoomIn',
                            'zoomOut',
                            'toggle1to1',
                            'iterateZoom',
                            'fullscreen',
                            'close',
                        ],
                    },
                },
                Images: {
                    Panzoom: {
                        maxScale: 4,
                    },
                },
            }
        );
    });

    mobileMedia.addEventListener('change', startAutoplay);

    renderSlide(0);
    startAutoplay();
});