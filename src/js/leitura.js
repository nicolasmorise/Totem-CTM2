// List of allowed countries to click
const allowedCountries = [
    "br", "ar", "bo", "cl", "co", "cr", "do", "ec", "sv", "gt", 
    "jp", "hn", "mx", "ni", "pa", "py", "pe", "pr", "uy", "ve", 
    "pt", "mz", "gh", "ao", "gw", "cv", "za", "cg", "gb", "es"
];

// Get DOM elements with null checks
function getElementOrThrow(id) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element with ID '${id}' not found`);
    return el;
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    try {

        const savedLanguage = localStorage.getItem('preferredLanguage');
        let currentLanguage = savedLanguage || 'en';
        // Inactivity timer variables
        let inactivityTimer;
        let currentMission = null;
        let missionsByCountry = {};

        // Inactivity timer function
        function resetInactivityTimer() {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                window.location.href = '../../index';
            }, 120000); // 2 minutes = 120,000ms
        }

        // Set up event listeners for user activity
        function setupInactivityTimer() {
            resetInactivityTimer();
            
            // Reset timer on any of these events
            ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
                document.addEventListener(event, resetInactivityTimer);
            });
        }

        // Initialize inactivity timer
        setupInactivityTimer();

        // Get all required elements
        const modalOverlay = getElementOrThrow('modalOverlay');
        const missoesContainer = getElementOrThrow('missoesContainer');
        const closeBtn = getElementOrThrow('closeBtn');
        const countryTitle = getElementOrThrow('countryTitle');
        const areaName = getElementOrThrow('areaName');
        const missionDetails = getElementOrThrow('missionDetails');
        const missionsList = getElementOrThrow('missionsList');
        const moreInfoBtn = getElementOrThrow('moreInfoBtn');
        const countryModal = getElementOrThrow('countryModal');
        const closeModalBtn = getElementOrThrow('closeModalBtn');
        const modalTitle = getElementOrThrow('modalTitle');
        const modalDescription = getElementOrThrow('modalDescription');
        const modalContent = getElementOrThrow('modal-content');

        // Load mission data from JSON file
        async function loadMissionData() {
            try {
                const filename = currentLanguage === 'en' ? 'data.json' : `data-${currentLanguage}.json`;
                const response = await fetch(`../js/${filename}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                
                // Transform data into a more usable structure
                const missionsByCountry = {};
                data.forEach(mission => {
                    if (!missionsByCountry[mission.ID]) {
                        missionsByCountry[mission.ID] = [];
                    }
                    missionsByCountry[mission.ID].push(mission);
                });
                
                return missionsByCountry;
            } catch (error) {
                console.error('Error loading mission data:', error);
                return {};
            }
        }

        // Modal functions
        function openModal() {
            modalOverlay.style.display = 'block';
            missoesContainer.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            missoesContainer.classList.remove('show');
            setTimeout(() => {
                modalOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }

        // Function to display mission details
        function showMissionDetails(mission) {
            currentMission = mission;

            countryTitle.textContent = `${mission.Missões || 'Não especificada'}`;
            areaName.textContent = mission["Áreas"] || 'Área não especificada';
            
            missionDetails.innerHTML = `
                <div class="mission-info">
                     ${mission["Description"] || 'Não especificados'}
                </div>
                <div class="mission-photo">
                    <img id="missionphoto" src="${mission['Image']}" alt="Mission Photo">
                    <br>
                    <strong><h2>${mission["Presidentes e Sisters"] || 'Não especificados'}</h2></strong>
                </div>
            `;
        }

        function setupLanguageButtons() {
    const langEn = getElementOrThrow('lang-en');
    const langPt = getElementOrThrow('lang-pt');
    const langEs = getElementOrThrow('lang-es');
    const loadingScreen = getElementOrThrow('loading-screen');

    function changeLanguage(lang) {
        // Close any open modals
        closeModal();
        if (countryModal) countryModal.style.display = "none";
        
        // Show loading screen
        loadingScreen.style.display = 'flex';
        
        // Store the selected language in localStorage
        localStorage.setItem('preferredLanguage', lang);
        
        // Refresh the page after a brief delay to show loading screen
        setTimeout(() => {
            window.location.href = window.location.pathname;
        }, 500);
    }

    langEn.addEventListener('click', () => changeLanguage('en'));
    langPt.addEventListener('click', () => changeLanguage('pt'));
    langEs.addEventListener('click', () => changeLanguage('es'));
    
    // Check for preferred language on load
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && savedLanguage !== currentLanguage) {
        changeLanguage(savedLanguage);
    }
}

        // Initialize the application
        async function init() {
            missionsByCountry = await loadMissionData();
            setupLanguageButtons();
            
            // Add click event to all country paths in the SVG
            document.querySelectorAll('svg path, svg g[id]').forEach(path => {
                path.addEventListener('click', function () {
                    const countryId = this.id || this.closest('g')?.id;


                   
                    
                    // Check if country is allowed
                    if (!allowedCountries.includes(countryId)) {
                        return;
                    }
                    
                    const countryMissions = missionsByCountry[countryId] || [];

                    // Update the modal content
                    if (countryMissions.length > 0) {
                        // Show country name in header
                        areaName.textContent = countryMissions[0]["Áreas"] || 'Área não especificada';
                        
                        // Clear and add missions list
                        missionsList.innerHTML = '';
                        
                        countryMissions.forEach(mission => {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.href = '#';
                            a.textContent = mission.Missões || 'Missão sem nome';
                            
                            a.addEventListener('click', (e) => {
                                e.preventDefault();
                                showMissionDetails(mission);
                            });
                            
                            li.appendChild(a);
                            missionsList.appendChild(li);
                        });
                        
                        // Show first mission by default
                        if (countryMissions.length > 0) {
                            showMissionDetails(countryMissions[0]);
                        }
                    } else {
                        // If no missions for this country
                        areaName.textContent = 'País não encontrado';
                        countryTitle.textContent = 'Nenhuma missão encontrada';
                        missionDetails.innerHTML = '<div class="mission-info">Nenhuma informação disponível para este país</div>';
                        missionsList.innerHTML = '';
                    }
                    
                    // Show the modal
                    openModal();
                });
            });

            // Event listeners
            closeBtn.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', closeModal);
            missoesContainer.addEventListener('click', function(e) {
                e.stopPropagation();
            });

            // More info button event listener
            moreInfoBtn.addEventListener('click', () => {
                if (!currentMission) return;

                modalTitle.textContent = currentMission["Áreas"] || "Informações do país";
                modalContent.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <img id="countryFlag" src="${currentMission['Flag URL']}" alt="Flag of Country" style="width: 120px; height: auto; margin-bottom: 1rem; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
                    <div id="countryDescriptionText">${currentMission["Country Description"] || "No description available."}</div>
                </div>
                `;

                countryModal.style.display = "block";
            });

            // Close country modal events
            closeModalBtn.addEventListener('click', () => {
                countryModal.style.display = "none";
            });

            window.addEventListener('click', (e) => {
                if (e.target === countryModal) {
                    countryModal.style.display = "none";
                }
            });
        }

        // Start the application
        await init();

    } catch (error) {
        console.error('Initialization error:', error);
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.padding = '20px';
        errorDiv.style.textAlign = 'center';
        errorDiv.textContent = 'Ocorreu um erro ao carregar o mapa. Por favor, recarregue a página.';
        document.body.prepend(errorDiv);
    }
});

// Prevent zooming with more than one finger
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault(); // Prevent zoom
    }
}, { passive: false });

// Prevent pinch zooming with gestures
document.addEventListener('gesturestart', function(e) {
    e.preventDefault(); // Prevent zoom gesture
}, { passive: false });
