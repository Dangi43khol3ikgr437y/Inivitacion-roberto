document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica para el efecto 3D de la tarjeta (solo para dispositivos sin pantalla táctil) ---
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const card = document.querySelector('.invitation-card');

    if (card && !isTouchDevice) {
        const maxRotation = 12;

        card.addEventListener('mousemove', (e) => {
            const cardRect = card.getBoundingClientRect();
            const xPos = e.clientX - cardRect.left;
            const yPos = e.clientY - cardRect.top;
            const middleX = cardRect.width / 2;
            const middleY = cardRect.height / 2;
            const offsetX = (xPos - middleX) / middleX;
            const offsetY = (yPos - middleY) / middleY;
            const rotateY = offsetX * maxRotation;
            const rotateX = -1 * offsetY * maxRotation;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    }

    const textElements = document.querySelectorAll('.invitation-content h1, .invitation-content h2, .invitation-content .name, .invitation-content .closing-message');

    textElements.forEach(element => {
        const text = element.textContent;
        element.innerHTML = ''; // Limpia el texto original
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            // Los espacios necesitan un tratamiento especial para que no colapsen
            span.innerHTML = (char === ' ') ? '&nbsp;' : char;
            element.appendChild(span);
        }
    });

    // --- Lógica para la animación de escritura ---
    const detailsSection = document.querySelector('.details-animated');

    const typeWriter = async () => {
        const lines = detailsSection.querySelectorAll('p');
        const typingSpeed = 50; // Milisegundos por caracter
        const lineDelay = 200;  // Pausa entre líneas

        const typeLine = (lineElement) => {
            return new Promise(resolve => {
                // Hace visible el párrafo antes de empezar a escribir
                lineElement.style.visibility = 'visible';

                // Separa los nodos de texto de otras etiquetas como <strong> o <br>
                const nodes = Array.from(lineElement.childNodes);
                const textToType = [];
                
                // Guarda el texto original de cada nodo de texto y luego lo vacía
                nodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
                        textToType.push({ node: node, text: node.textContent });
                        node.textContent = '';
                    }
                });

                if (textToType.length === 0) { resolve(); return; }

                const cursor = document.createElement('span');
                cursor.className = 'typewriter-cursor';
                lineElement.appendChild(cursor);

                let currentTextIndex = 0, currentCharIndex = 0;

                const typeChar = () => {
                    if (currentTextIndex < textToType.length) {
                        const target = textToType[currentTextIndex];
                        if (currentCharIndex < target.text.length) {
                            target.node.textContent += target.text[currentCharIndex++];
                            setTimeout(typeChar, typingSpeed);
                        } else {
                            currentTextIndex++;
                            currentCharIndex = 0;
                            setTimeout(typeChar, typingSpeed);
                        }
                    } else {
                        lineElement.removeChild(cursor);
                        resolve();
                    }
                };
                typeChar();
            });
        };

        for (const line of lines) {
            await typeLine(line);
            await new Promise(resolve => setTimeout(resolve, lineDelay));
        }
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeWriter();
                observer.unobserve(entry.target); // Animar solo una vez
            }
        });
    }, { threshold: 0.5 });

    if (detailsSection) {
        observer.observe(detailsSection);
    }

    // --- Lógica para el efecto de confeti ---
    const whatsAppBtn = document.querySelector('.whatsapp-btn');
    if (whatsAppBtn) {
        whatsAppBtn.addEventListener('click', () => {
            // Lanza el confeti cuando se hace clic en el botón de confirmar
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                // Colores temáticos de Spider-Man
                colors: ['#c1171d', '#0056a3', '#ffffff']
            });
        });
    }

    // --- Lógica para la Galería de Fotos Modal ---
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-image');
    const thumbnails = document.querySelectorAll('.gallery-thumb');
    const closeModalBtn = document.querySelector('.close-modal');

    if (modal && modalImg && thumbnails.length > 0 && closeModalBtn) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                modal.style.display = "block";
                modalImg.src = thumb.src;
            });
        });

        const closeTheModal = () => {
            modal.style.display = "none";
        }

        closeModalBtn.addEventListener('click', closeTheModal);

        // Cerrar al hacer clic fuera de la imagen
        window.addEventListener('click', (event) => {
            if (event.target == modal) closeTheModal();
        });
    }

    // --- Lógica para la Cuenta Regresiva ---
    const countdownContainer = document.getElementById('countdown-container');
    if (countdownContainer) {
        // ¡IMPORTANTE! Cambia esta fecha a la fecha de la fiesta
        const partyDate = new Date('July 19, 2025 8:00:00').getTime();

        const updateCountdown = setInterval(() => {
            const now = new Date().getTime();
            const distance = partyDate - now;

            if (distance < 0) {
                clearInterval(updateCountdown);
                countdownContainer.innerHTML = '<h3 style="font-size: 2em;">¡La fiesta ha comenzado!</h3>';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').innerText = String(days).padStart(2, '0');
            document.getElementById('hours').innerText = String(hours).padStart(2, '0');
            document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
            document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');

        }, 1000);
    }

    // --- Lógica para el control de música ---
    const audio = document.getElementById('bg-music');
    const playPauseBtn = document.getElementById('play-pause-btn');

    if (audio && playPauseBtn) {
          const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Autoplay funcionó. Actualizamos el botón.
                playPauseBtn.classList.add('playing');
            }).catch(error => {
                // Autoplay fue bloqueado. El usuario debe hacer clic.
                console.log("El autoplay fue bloqueado por el navegador:", error);
                playPauseBtn.classList.remove('playing');
            });
        }
        playPauseBtn.addEventListener('click', () => {
            audio.paused ? audio.play() : audio.pause();
            playPauseBtn.classList.toggle('playing');
        });
    }
});
