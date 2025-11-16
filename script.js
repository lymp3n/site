// Инициализация GSAP с плагинами
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Глобальные переменные
let scene, camera, renderer, controls, model;
let modelLoaded = false;
let isDarkTheme = false;
let cursorEnabled = true;
let mouseX = 0;
let mouseY = 0;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Предзагрузка анимаций
    gsap.ticker.lagSmoothing(0);
    
    initPreloader();
    initCustomCursor();
    initTheme();
    init3D();
    initParticles();
    initSkills();
    initContactForm();
    initProjectModals();
    
    // Инициализация анимаций после загрузки
    window.addEventListener('load', function() {
        setTimeout(() => {
            document.getElementById('preloader').style.display = 'none';
            showNotification('Творческий хаос загружен!', 'success');
            // Инициализация анимаций после полной загрузки
            initAnimations();
        }, 2000);
    });
});

// Прелоадер
function initPreloader() {
    const preloader = document.getElementById('preloader');
}

// Переработанная система кастомного курсора
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursor-follower');
    
    // Проверяем, не мобильное ли устройство
    if (window.innerWidth <= 768) {
        cursorEnabled = false;
        cursor.style.display = 'none';
        cursorFollower.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }
    
    // Инициализируем позицию курсора по центру экрана
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;
    
    // Инициализируем позицию курсора
    gsap.set(cursor, { 
        x: mouseX - 10, 
        y: mouseY - 10,
        opacity: 1
    });
    gsap.set(cursorFollower, { 
        x: mouseX - 20, 
        y: mouseY - 20,
        opacity: 1
    });
    
    // Основной обработчик движения мыши
    const onMouseMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Основной курсор (мгновенно)
        gsap.set(cursor, {
            x: mouseX - 10,
            y: mouseY - 10
        });
    };
    
    // Плавное следование для второго курсора
    let followerX = mouseX;
    let followerY = mouseY;
    
    const animateFollower = () => {
        const dx = mouseX - followerX;
        const dy = mouseY - followerY;
        
        followerX += dx * 0.1;
        followerY += dy * 0.1;
        
        gsap.set(cursorFollower, {
            x: followerX - 20,
            y: followerY - 20
        });
        
        requestAnimationFrame(animateFollower);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    animateFollower();
    
    // Эффекты при наведении на интерактивные элементы
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .project-details-btn, input, textarea');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (!cursorEnabled) return;
            
            cursor.style.transform = 'scale(1.5)';
            cursor.style.background = '#8A2BE2';
            cursorFollower.style.transform = 'scale(1.2)';
            cursorFollower.style.borderColor = '#FFB800';
        });
        
        el.addEventListener('mouseleave', () => {
            if (!cursorEnabled) return;
            
            cursor.style.transform = 'scale(1)';
            cursor.style.background = '#FF4D80';
            cursorFollower.style.transform = 'scale(1)';
            cursorFollower.style.borderColor = '#00A3FF';
        });
    });
    
    // Предотвращаем скрытие курсора при открытии модальных окон
    document.addEventListener('click', (e) => {
        if (!cursorEnabled) return;
        
        // Сохраняем позицию курсора при любом клике
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Мгновенное обновление позиции
        gsap.set(cursor, {
            x: mouseX - 10,
            y: mouseY - 10
        });
    });
    
    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            cursorEnabled = false;
            cursor.style.display = 'none';
            cursorFollower.style.display = 'none';
            document.body.style.cursor = 'auto';
        } else {
            cursorEnabled = true;
            cursor.style.display = 'block';
            cursorFollower.style.display = 'block';
            document.body.style.cursor = 'none';
        }
    });
}

// Система тем
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    
    // Восстанавливаем тему из localStorage
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        isDarkTheme = true;
    }
    
    themeToggle.addEventListener('click', function() {
        isDarkTheme = !isDarkTheme;
        
        if (isDarkTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            showNotification('Тёмная тема активирована', 'info');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            showNotification('Светлая тема активирована', 'info');
        }
    });
}

// Оптимизированные анимации при скролле
function initAnimations() {
    // Оптимизация производительности
    gsap.config({
        force3D: true
    });

    // Анимация появления секций с предзагрузкой
    gsap.utils.toArray('section').forEach(section => {
        gsap.fromTo(section, 
            { 
                opacity: 0, 
                y: 50 
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    end: "bottom 15%",
                    toggleActions: "play none none reverse",
                    markers: false
                }
            }
        );
    });

    // Анимация для карточек работ
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.fromTo(card,
            { 
                opacity: 0, 
                x: i % 2 === 0 ? -50 : 50,
                rotation: i % 2 === 0 ? -5 : 5
            },
            {
                opacity: 1,
                x: 0,
                rotation: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    end: "bottom 10%",
                    toggleActions: "play none none reverse",
                    markers: false
                }
            }
        );
    });

    // Анимация для статистики
    gsap.utils.toArray('#about .grid > div').forEach((stat, i) => {
        gsap.fromTo(stat,
            { 
                scale: 0, 
                rotation: -180 
            },
            {
                scale: 1,
                rotation: 0,
                duration: 0.8,
                delay: i * 0.1,
                scrollTrigger: {
                    trigger: stat,
                    start: "top 95%",
                    end: "bottom 5%",
                    toggleActions: "play none none reverse",
                    markers: false
                }
            }
        );
    });

    // Параллакс для изображений
    gsap.utils.toArray('.image-parallax').forEach(image => {
        gsap.to(image, {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: image.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                markers: false
            }
        });
    });

    // Анимация для навыков
    const skillProgresses = document.querySelectorAll('.skill-progress');
    
    skillProgresses.forEach(progress => {
        gsap.fromTo(progress,
            { width: "0%" },
            {
                width: `${progress.getAttribute('data-width')}%`,
                duration: 1.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: progress,
                    start: "top 90%",
                    end: "bottom 10%",
                    toggleActions: "play none none reverse",
                    markers: false
                }
            }
        );
    });

    // Обновление всех триггеров
    ScrollTrigger.refresh();
}

// Three.js 3D модель с улучшенными настройками
function init3D() {
    const container = document.getElementById('3d-container');
    if (!container) return;
    
    // Создание сцены с градиентным фоном
    scene = new THREE.Scene();
    
    // Градиентный фон сцены (светло-синий градиент)
    const gradientTexture = createLightBlueGradientTexture();
    scene.background = gradientTexture;
    
    // Создание камеры
    camera = new THREE.PerspectiveCamera(80, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 9, 15); // Камера ближе и немного выше
    
    // Создание рендерера
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Улучшенное освещение - свет сверху на модель
    setupLighting();
    
    // Добавление OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false; // Отключаем авто-вращение
    controls.minDistance = 6; // Минимальное расстояние для приближения
    controls.maxDistance = 25; // Максимальное расстояние для отдаления
    
    // Добавляем легкие границы сцены для лучшего восприятия пространства
    addSceneBoundaries();
    
    // Сразу создаем резервную модель
    createFallbackModel();
    
    // Пытаемся загрузить модель
    loadModel();
    
    // Анимация
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    
    // Обработка изменения размера окна
    window.addEventListener('resize', function() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    animate();
}

// Создание светло-синего градиента для фона
function createLightBlueGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    // Создаем красивый светло-синий градиент с более выраженными цветами
    const gradient = context.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, '#e8f4ff'); // Яркий светло-голубой в центре
    gradient.addColorStop(0.7, '#c2e0ff'); // Средний голубой
    gradient.addColorStop(1, '#a3d1ff'); // Более насыщенный голубой по краям

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    return texture;
}

// Добавление легких границ сцены
function addSceneBoundaries() {
    // Только очень легкая сетка для ориентации
    const gridHelper = new THREE.GridHelper(15, 10, 0x88aaff, 0x88aaff);
    gridHelper.position.y = -4;
    gridHelper.material.opacity = 0.08;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

// Настройка освещения - мощный свет сверху на модель
function setupLighting() {
    // ОСНОВНОЙ СВЕТ - мощный направленный свет сверху
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(0, 15, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 30;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    scene.add(mainLight);

    // ЗАПОЛНЯЮЩИЙ СВЕТ - мягкий свет спереди для деталей
    const fillLight = new THREE.DirectionalLight(0x4d94ff, 1.0);
    fillLight.position.set(0, 3, 10);
    scene.add(fillLight);

    // БОКОВОЙ СВЕТ - для объемности
    const sideLight = new THREE.DirectionalLight(0x66aaff, 0.6);
    sideLight.position.set(8, 3, 0);
    scene.add(sideLight);

    // ПРОТИВОПОЛОЖНЫЙ БОКОВОЙ СВЕТ - для баланса
    const oppositeSideLight = new THREE.DirectionalLight(0x66aaff, 0.6);
    oppositeSideLight.position.set(-8, 3, 0);
    scene.add(oppositeSideLight);

    // ОКРУЖАЮЩЕЕ ОСВЕЩЕНИЕ - увеличиваем для лучшего освещения всей модели
    const ambientLight = new THREE.AmbientLight(0x6699ff, 0.6);
    scene.add(ambientLight);

    // ТОЧЕЧНЫЙ СВЕТ СВЕРХУ - мощный акцентный свет прямо сверху
    const topPointLight = new THREE.PointLight(0xffffff, 1.2, 25);
    topPointLight.position.set(0, 10, 0);
    scene.add(topPointLight);
}

function loadModel() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const progressBar = document.getElementById('progress-bar-inner');
    const loadingDetails = document.getElementById('loading-details');
    
    // Показываем индикатор загрузки
    loadingOverlay.style.display = 'flex';
    loadingText.textContent = 'Загрузка 3D модели...';
    progressBar.style.width = '10%';
    loadingDetails.textContent = 'Подготовка...';
    
    // Создаем загрузчик
    const loader = new THREE.GLTFLoader();
    
    // Пытаемся загрузить модель
    const modelPath = './templates/3d_model.glb';
    
    loader.load(
        modelPath,
        function(gltf) {
            // Удаляем резервную модель
            scene.remove(model);
            
            // Добавляем загруженную модель
            model = gltf.scene;
            scene.add(model);
            
            // Центрируем модель
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Смещаем модель так, чтобы ее центр был в (0,0,0)
            model.position.x = -center.x;
            model.position.y = -center.y;
            model.position.z = -center.z;
            
            // Настройка масштаба модели - увеличиваем для лучшей видимости
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 12 / maxDim; // Увеличиваем масштаб для лучшей видимости
            model.scale.setScalar(scale);
            
            // Приподнимаем модель немного выше
            model.position.y += 1.5;
            
            // Включаем тени и настраиваем материалы для лучшего отображения
            model.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Улучшаем материалы для лучшего отображения при новом освещении
                    if (child.material) {
                        child.material.metalness = 0.3;
                        child.material.roughness = 0.4;
                        // Увеличиваем интенсивность цветов для лучшей видимости
                        if (child.material.color) {
                            child.material.color.multiplyScalar(1.2);
                        }
                        child.material.needsUpdate = true;
                    }
                }
            });
            
            loadingText.textContent = 'Модель загружена!';
            progressBar.style.width = '100%';
            loadingDetails.textContent = 'Анимация появления...';
            
            // Анимация появления модели с более выраженным эффектом
            gsap.fromTo(model.scale, 
                { x: 0, y: 0, z: 0 },
                { 
                    x: scale, y: scale, z: scale, 
                    duration: 1.8, 
                    ease: "elastic.out(1.2, 0.5)",
                    onComplete: function() {
                        modelLoaded = true;
                        setTimeout(() => {
                            loadingOverlay.style.display = 'none';
                        }, 1000);
                    }
                }
            );
            
            // Анимация поднятия модели
            gsap.fromTo(model.position,
                { y: -2 },
                {
                    y: 1.5,
                    duration: 1.8,
                    ease: "power2.out"
                }
            );
        },
        function(xhr) {
            // Прогресс загрузки
            if (xhr.lengthComputable) {
                const percentComplete = (xhr.loaded / xhr.total) * 100;
                progressBar.style.width = `${percentComplete}%`;
                loadingText.textContent = `Загрузка 3D модели... ${percentComplete.toFixed(0)}%`;
                loadingDetails.textContent = `Загружено: ${(xhr.loaded / 1024 / 1024).toFixed(2)} MB`;
            }
        },
        function(error) {
            loadingText.textContent = 'Ошибка загрузки модели';
            loadingDetails.textContent = `Используется резервная модель`;
            
            // Уже создали резервную модель, просто скрываем загрузку
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 2000);
        }
    );
}

function createFallbackModel() {
    // Создаем более сложную и яркую резервную модель
    const group = new THREE.Group();
    
    // Основная геометрия - икосаэдр с подразделениями
    const geometry = new THREE.IcosahedronGeometry(2.5, 2);
    
    // Создаем несколько материалов с разными свойствами
    const materials = [
        new THREE.MeshStandardMaterial({ 
            color: 0xff4d80, 
            roughness: 0.2, 
            metalness: 0.4
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0x00A3FF, 
            roughness: 0.3, 
            metalness: 0.5
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0x8a2be2, 
            roughness: 0.4, 
            metalness: 0.3
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0xFFB800, 
            roughness: 0.3, 
            metalness: 0.6
        })
    ];
    
    // Создаем меш с разными материалами для каждой грани
    for (let i = 0; i < geometry.groups.length; i++) {
        const materialIndex = i % materials.length;
        const faceGeometry = new THREE.BufferGeometry();
        
        // Копируем атрибуты
        faceGeometry.setAttribute('position', geometry.attributes.position);
        faceGeometry.setAttribute('normal', geometry.attributes.normal);
        
        // Устанавливаем индексы для этой группы
        const indices = [];
        const group = geometry.groups[i];
        for (let j = group.start; j < group.start + group.count; j++) {
            indices.push(geometry.index.array[j]);
        }
        faceGeometry.setIndex(indices);
        
        const faceMesh = new THREE.Mesh(faceGeometry, materials[materialIndex]);
        faceMesh.castShadow = true;
        faceMesh.receiveShadow = true;
        group.add(faceMesh);
    }
    
    // Центрируем модель и приподнимаем
    group.position.set(0, 1.5, 0);
    
    scene.add(group);
    model = group;
    modelLoaded = true;
}

// Система частиц для бэкграунда
function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    const particleCount = 30; // Уменьшено для производительности
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full optimized-animation';
        
        // Случайные параметры
        const size = Math.random() * 15 + 5;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.background = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
        particle.style.animation = `floating ${duration}s ease-in-out infinite`;
        particle.style.animationDelay = `${delay}s`;
        
        container.appendChild(particle);
    }
}

// Анимация навыков (теперь через GSAP)
function initSkills() {
    // Навыки теперь анимируются через GSAP в initAnimations()
}

// Форма обратной связи
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Простая валидация
        const inputs = contactForm.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#FF4D80';
                isValid = false;
            } else {
                input.style.borderColor = '#d1d5db';
            }
        });
        
        if (isValid) {
            // Имитация отправки
            showNotification('Сообщение отправлено! Свяжусь с вами скоро.', 'success');
            contactForm.reset();
            
            // Сброс цветов границ
            inputs.forEach(input => {
                input.style.borderColor = '#d1d5db';
            });
        } else {
            showNotification('Пожалуйста, заполните все поля', 'error');
        }
    });
}

// Модальные окна для проектов
function initProjectModals() {
    const projectButtons = document.querySelectorAll('.project-details-btn');
    const modal = document.getElementById('project-modal');
    const closeModal = document.getElementById('close-modal');
    const modalContent = document.getElementById('modal-content');
    
    // Данные для модальных окон
    const projectData = {
        0: {
            title: 'Интерактивный цифровой опыт',
            description: 'Исследование границ веб-анимации и пользовательского взаимодействия через призму необрутализма. Этот проект представляет собой иммерсивный цифровой опыт, где каждый элемент интерфейса является частью единого художественного замысла.',
            details: [
                'Интеграция сложных GSAP анимаций',
                'Создание интерактивных 3D элементов с Three.js',
                'Разработка нестандартных пользовательских взаимодействий',
                'Оптимизация производительности для плавного UX'
            ],
            technologies: ['GSAP', 'Three.js', 'Tailwind CSS', 'WebGL'],
            image: 'project1'
        },
        1: {
            title: 'Экспериментальный брендинг',
            description: 'Система визуальной идентификации, бросающая вызов традиционным представлениям о красоте в дизайне. Brutal Bold - это манифест против условностей в дизайне.',
            details: [
                'Разработка айдентики в стиле необрутализм',
                'Создание анимированного логотипа',
                'Проектирование дизайн-системы',
                'Реализация адаптивного брендбука'
            ],
            technologies: ['Figma', 'After Effects', 'Illustrator', 'Blender'],
            image: 'project2'
        }
    };
    
    projectButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const project = projectData[index];
            
            modalContent.innerHTML = `
                <h3 class="text-3xl font-black mb-4 text-gray-900 dark:text-white">${project.title}</h3>
                <p class="mb-6 text-gray-700 dark:text-gray-300">${project.description}</p>
                
                <div class="mb-6">
                    <h4 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Особенности:</h4>
                    <ul class="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                        ${project.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="mb-6">
                    <h4 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Технологии:</h4>
                    <div class="flex flex-wrap gap-2">
                        ${project.technologies.map(tech => `<span class="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1 text-sm font-bold">${tech}</span>`).join('')}
                    </div>
                </div>
                
                <div class="bg-gray-100 dark:bg-gray-800 p-4 border-2 border-gray-300 dark:border-gray-600">
                    <p class="text-sm italic text-gray-700 dark:text-gray-300">"Этот проект стал вызовом традиционным представлениям о веб-дизайне и открыл новые горизонты в создании цифровых интерфейсов."</p>
                </div>
            `;
            
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // Анимация появления модального окна
            gsap.fromTo(modal.querySelector('.bg-white'), 
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
            );
        });
    });
    
    closeModal.addEventListener('click', () => {
        gsap.to(modal.querySelector('.bg-white'), {
            scale: 0.8, 
            opacity: 0, 
            duration: 0.3, 
            onComplete: function() {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            gsap.to(modal.querySelector('.bg-white'), {
                scale: 0.8, 
                opacity: 0, 
                duration: 0.3, 
                onComplete: function() {
                    modal.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }
            });
        }
    });
}

// Система уведомлений
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    
    // Цвет в зависимости от типа
    if (type === 'success') {
        notification.style.background = '#00A3FF';
    } else if (type === 'error') {
        notification.style.background = '#FF4D80';
    } else {
        notification.style.background = '#8A2BE2';
    }
    
    // Показываем уведомление
    notification.style.transform = 'translateX(0)';
    
    // Скрываем через 3 секунды
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
    }, 3000);
}

// Остальной код для навигации, аккордеона и т.д.
// Прогресс бар при скролле
window.addEventListener('scroll', function() {
    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset;
    const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
    document.querySelector('.progress-bar').style.width = scrollPercent + '%';
});

// Мобильное меню
document.getElementById('mobile-menu-button').addEventListener('click', function() {
    document.getElementById('mobile-menu').classList.remove('hidden');
    gsap.fromTo('#mobile-menu', 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
    );
});

document.getElementById('close-menu').addEventListener('click', function() {
    gsap.to('#mobile-menu', {
        opacity: 0, scale: 0.8, duration: 0.3, onComplete: function() {
            document.getElementById('mobile-menu').classList.add('hidden');
        }
    });
});

// Плавная прокрутка для ссылок (исправленная)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            gsap.to(window, {
                duration: 1.2,
                scrollTo: { y: targetElement, offsetY: 80 },
                ease: "power2.inOut"
            });
            
            // Закрыть мобильное меню если открыто
            if (!document.getElementById('mobile-menu').classList.contains('hidden')) {
                document.getElementById('mobile-menu').classList.add('hidden');
            }
        }
    });
});

// Оптимизация производительности при скролле
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(function() {
            scrollTimeout = null;
            // Обновление анимаций после остановки скролла
            ScrollTrigger.refresh();
        }, 100);
    }
});

// Предзагрузка ресурсов
window.addEventListener('load', function() {
    // Предзагрузка изображений
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        }
    });
});
