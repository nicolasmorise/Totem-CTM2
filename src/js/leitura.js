// Get DOM elements with null checks
function getElementOrThrow(id) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element with ID '${id}' not found`);
    return el;
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get all required elements
        const modalOverlay = getElementOrThrow('modalOverlay');
        const missoesContainer = getElementOrThrow('missoesContainer');
        const closeBtn = getElementOrThrow('closeBtn');
        const countryTitle = getElementOrThrow('countryTitle');
        const areaName = getElementOrThrow('areaName');
        const missionDetails = getElementOrThrow('missionDetails');
        const missionsList = getElementOrThrow('missionsList');

        // Load mission data from JSON file
        async function loadMissionData() {
            try {
                const response = await fetch('src/js/data.json');
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
            countryTitle.textContent = `Missão: ${mission.Missões || 'Não especificada'}`;
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

        // Initialize the application
        async function init() {
            const missionsByCountry = await loadMissionData();
            
            // Add click event to all country paths in the SVG
            document.querySelectorAll('svg path, svg g[id]').forEach(path => {
                path.addEventListener('click', function () {
                    const countryId = this.id || this.closest('g')?.id;
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