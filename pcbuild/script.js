// PC Builder Simulator - Main Application Logic
class PCBuilderApp {
    constructor() {
        this.selectedComponents = {};
        this.currentCategory = 'cpu';
        this.filteredComponents = {};
        this.darkMode = localStorage.getItem('theme') === 'dark';
        this.savedConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
        this.currentTab = 'builder';
        this.show2DBuilderNotifications = localStorage.getItem('show2DBuilderNotifications') !== 'false'; // Default to true
        this.isProcessingDrop = false; // Prevent multiple simultaneous drops
        
        this.init();
    }

    init() {
        try {
            console.log('🚀 PC Builder Simulator inicializálása...');
            this.initializeTheme();
            this.initialize2DNotificationsToggle();
            this.setupEventListeners();
            this.loadComponents();
            this.showLoadingScreen();
            
            // Simulate loading time
            setTimeout(() => {
                try {
                    this.hideLoadingScreen();
                    this.renderComponents();
                    this.updateBuildStats();
                    this.renderPrebuilds();
                    console.log('✅ PC Builder Simulator sikeresen betöltve!');
                } catch (error) {
                    console.error('❌ Hiba a betöltés során:', error);
                    this.showToast('Hiba történt a betöltés során. Frissítsd az oldalt!', 'error');
                }
            }, 2000);
        } catch (error) {
            console.error('❌ Kritikus hiba az inicializálás során:', error);
        }
    }

    initializeTheme() {
        if (this.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.querySelector('.theme-toggle i').className = 'fas fa-sun';
        }
    }
    
    initialize2DNotificationsToggle() {
        const toggleBtn = document.getElementById('toggle2DNotifications');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (this.show2DBuilderNotifications) {
                icon.className = 'fas fa-bell';
                toggleBtn.title = '2D Builder értesítések kikapcsolása';
            } else {
                icon.className = 'fas fa-bell-slash';
                toggleBtn.title = '2D Builder értesítések bekapcsolása';
            }
        }
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // 2D Builder notifications toggle
        const toggle2DNotifications = document.getElementById('toggle2DNotifications');
        if (toggle2DNotifications) {
            toggle2DNotifications.addEventListener('click', () => this.toggle2DBuilderNotifications());
        }

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.closest('.nav-btn')?.dataset.tab;
                if (tab) this.switchTab(tab);
            });
        });

        // Component categories
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchCategory(e.currentTarget.dataset.category));
        });

        // Search
        const componentSearch = document.getElementById('componentSearch');
        if (componentSearch) {
            componentSearch.addEventListener('input', (e) => this.searchComponents(e.target.value));
        }

        // Build actions
        const clearBuild = document.getElementById('clearBuild');
        if (clearBuild) {
            clearBuild.addEventListener('click', () => this.clearBuild());
        }
        
        const saveConfig = document.getElementById('saveConfig');
        if (saveConfig) {
            saveConfig.addEventListener('click', () => this.showSaveModal());
        }

        // Modal handlers
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal);
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal);
            });
        });

        // Save configuration
        const saveConfigBtn = document.getElementById('saveConfigBtn');
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => this.saveConfiguration());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Auto-save build state
        setInterval(() => this.autoSaveBuild(), 30000); // Every 30 seconds
        
        // Debounce function for search
        this.debounceTimer = null;
    }

    showLoadingScreen() {
        document.getElementById('loadingScreen').classList.remove('hidden');
    }

    hideLoadingScreen() {
        document.getElementById('loadingScreen').classList.add('hidden');
    }

    toggleTheme() {
        this.darkMode = !this.darkMode;
        const themeIcon = document.querySelector('.theme-toggle i');
        
        if (this.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        }
        
        this.showToast('Téma váltva!', 'success');
    }
    
    toggle2DBuilderNotifications() {
        this.show2DBuilderNotifications = !this.show2DBuilderNotifications;
        localStorage.setItem('show2DBuilderNotifications', this.show2DBuilderNotifications.toString());
        
        const status = this.show2DBuilderNotifications ? 'bekapcsolva' : 'kikapcsolva';
        this.showToast(`2D Builder értesítések ${status}!`, 'info');
        
        // Update the toggle button state if it exists
        const toggleBtn = document.getElementById('toggle2DNotifications');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (this.show2DBuilderNotifications) {
                icon.className = 'fas fa-bell';
                toggleBtn.title = '2D Builder értesítések kikapcsolása';
            } else {
                icon.className = 'fas fa-bell-slash';
                toggleBtn.title = '2D Builder értesítések bekapcsolása';
            }
        }
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific content
        if (tabName === 'prebuilds') this.renderPrebuilds();
        if (tabName === 'build2d') {
            console.log('🔄 Switching to 2D Builder tab');
            // Reset drop processing flag when entering 2D Builder
            this.isProcessingDrop = false;
            console.log('🔄 Drop processing flag reset on tab switch');
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                this.render2DBuilder();
            }, 100);
        }
        if (tabName === 'benchmark') this.renderBenchmarkView();
    }

    switchCategory(category) {
        // Update category selection
        document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.currentCategory = category;
        this.renderComponents();
    }

    loadComponents() {
        // Process and organize components data
        this.filteredComponents = { ...COMPONENTS_DATA };
        
        // Add computed properties
        Object.keys(this.filteredComponents).forEach(category => {
            this.filteredComponents[category].forEach(component => {
                component.categoryName = this.getCategoryDisplayName(category);
                component.formattedPrice = this.formatPrice(component.price);
                component.formattedOriginalPrice = component.originalPrice ? this.formatPrice(component.originalPrice) : null;
                component.discount = component.originalPrice ? Math.round((1 - component.price / component.originalPrice) * 100) : 0;
            });
        });
    }

    renderComponents() {
        const container = document.getElementById('componentList');
        const components = this.filteredComponents[this.currentCategory] || [];
        
        if (components.length === 0) {
            container.innerHTML = '<div class="no-components">Nincsenek elérhető komponensek ebben a kategóriában.</div>';
            return;
        }

        container.innerHTML = components.map(component => `
            <div class="component-item ${this.selectedComponents[this.currentCategory]?.id === component.id ? 'selected' : ''}" 
                 data-component-id="${component.id}" 
                 onclick="app.selectComponent('${this.currentCategory}', '${component.id}')">
                <div class="component-image">
                    ${component.image}
                </div>
                <div class="component-details">
                    <div class="component-name">${component.name}</div>
                    <div class="component-specs">${component.specs}</div>
                    <div class="component-features">
                        ${component.features.slice(0, 3).map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="component-price">
                    ${component.formattedOriginalPrice ? 
                        `<div class="price-original">${component.formattedOriginalPrice}</div>` : ''
                    }
                    <div class="price-current">${component.formattedPrice}</div>
                    ${component.discount > 0 ? 
                        `<div class="discount-badge">-${component.discount}%</div>` : ''
                    }
                </div>
            </div>
        `).join('');
    }

    selectComponent(category, componentId) {
        const component = this.filteredComponents[category].find(c => c.id === componentId);
        if (!component) return;

        // Special handling for RAM - allow multiple modules
        if (category === 'ram') {
            if (!this.selectedComponents[category]) {
                this.selectedComponents[category] = [];
            }
            
            // If it's an array, handle multiple RAM modules
            if (Array.isArray(this.selectedComponents[category])) {
                const existingIndex = this.selectedComponents[category].findIndex(c => c.id === componentId);
                if (existingIndex >= 0) {
                    // Remove if already selected
                    this.selectedComponents[category].splice(existingIndex, 1);
                    if (this.selectedComponents[category].length === 0) {
                        delete this.selectedComponents[category];
                    }
                } else {
                    // Add new RAM module (max 4)
                    if (this.selectedComponents[category].length < 4) {
                        this.selectedComponents[category].push(component);
                    } else {
                        this.showToast('Maximum 4 RAM modul választható!', 'warning');
                        return;
                    }
                }
            } else {
                // Convert single RAM to array
                const previousComponent = this.selectedComponents[category];
                this.selectedComponents[category] = [previousComponent, component];
            }
        } else {
            // Normal single component selection for other categories
            const previousComponent = this.selectedComponents[category];
            this.selectedComponents[category] = component;
        }

        // Update UI
        this.renderComponents();
        this.renderSelectedComponents();
        this.updateBuildStats();
        this.checkCompatibility();
        this.updateCategoryStatus(category);

        // Show feedback for RAM
        if (category === 'ram') {
            const ramCount = Array.isArray(this.selectedComponents[category]) ? this.selectedComponents[category].length : 0;
            this.showToast(`${component.name} hozzáadva! (${ramCount} RAM modul kiválasztva)`, 'success');
        } else {
            // Show feedback for other components
            const previousComponent = this.selectedComponents[category];
            if (previousComponent && previousComponent.id !== componentId) {
                this.showToast(`${component.name} hozzáadva! (${previousComponent.name} lecserélve)`, 'success');
            } else if (!previousComponent) {
                this.showToast(`${component.name} hozzáadva!`, 'success');
            }
        }

        // Animate performance preview update
        setTimeout(() => this.updatePerformancePreview(), 100);
        
        // Update 2D builder if on that tab
        if (this.currentTab === 'build2d') {
            this.render2DBuilder();
        }
    }

    removeComponent(category) {
        if (!this.selectedComponents[category]) return;

        const componentName = this.selectedComponents[category].name;
        delete this.selectedComponents[category];

        this.renderComponents();
        this.renderSelectedComponents();
        this.updateBuildStats();
        this.checkCompatibility();
        this.updateCategoryStatus(category);
        this.updatePerformancePreview();

        this.showToast(`${componentName} eltávolítva!`, 'warning');
    }

    renderSelectedComponents() {
        const container = document.getElementById('selectedComponents');
        // Handle RAM arrays - flatten them into the component list
        const components = [];
        Object.entries(this.selectedComponents).forEach(([category, component]) => {
            if (category === 'ram' && Array.isArray(component)) {
                components.push(...component);
            } else if (component) {
                components.push(component);
            }
        });

        if (components.length === 0) {
            container.innerHTML = `
                <div class="empty-build">
                    <i class="fas fa-desktop"></i>
                    <h3>Üres konfiguráció</h3>
                    <p>Kezdj el komponenseket válogatni a bal oldalon!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = components.map(component => `
            <div class="selected-component">
                <div class="selected-component-image">
                    ${component.image}
                </div>
                <div class="selected-component-info">
                    <div class="selected-component-name">${component.name}</div>
                    <div class="selected-component-category">${component.categoryName}</div>
                </div>
                <div class="selected-component-price">${component.formattedPrice}</div>
                <button class="remove-component" onclick="app.removeComponent('${this.getComponentCategory(component.id)}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    updateBuildStats() {
        // Handle RAM arrays - flatten them into the component list
        const components = [];
        Object.entries(this.selectedComponents).forEach(([category, component]) => {
            if (category === 'ram' && Array.isArray(component)) {
                components.push(...component);
            } else if (component) {
                components.push(component);
            }
        });
        
        // Calculate total price
        const totalPrice = components.reduce((sum, comp) => sum + comp.price, 0);
        document.getElementById('totalPrice').textContent = this.formatPrice(totalPrice);

        // Calculate total power draw
        const totalPower = components.reduce((sum, comp) => sum + (comp.powerDraw || comp.tdp || 0), 0);
        document.getElementById('totalPower').textContent = `${totalPower}W`;

        // Calculate performance scores
        const gamingScore = this.calculateGamingScore();
        const workScore = this.calculateWorkScore();
        
        document.getElementById('gamingScore').textContent = gamingScore;
        document.getElementById('workScore').textContent = workScore;

        // Update stat colors based on values
        this.updateStatColors(totalPrice, totalPower, gamingScore, workScore);
    }

    calculateGamingScore() {
        const cpu = this.selectedComponents.cpu;
        const gpu = this.selectedComponents.gpu;
        const ram = Array.isArray(this.selectedComponents.ram) ? this.selectedComponents.ram[0] : this.selectedComponents.ram;

        if (!cpu || !gpu) return 0;

        let score = 0;
        
        // GPU contribution (60%)
        score += (gpu.performanceScore || 0) * 0.6;
        
        // CPU contribution (30%)
        score += (cpu.performanceScore || 0) * 0.3;
        
        // RAM contribution (10%)
        if (ram) {
            let ramScore = 0;
            if (ram.capacity >= 32) ramScore = 100;
            else if (ram.capacity >= 16) ramScore = 80;
            else if (ram.capacity >= 8) ramScore = 60;
            else ramScore = 40;
            
            if (ram.speed >= 6000) ramScore += 10;
            else if (ram.speed >= 5000) ramScore += 5;
            
            score += Math.min(ramScore, 100) * 0.1;
        }

        return Math.round(Math.min(score, 100));
    }

    calculateWorkScore() {
        const cpu = this.selectedComponents.cpu;
        const ram = Array.isArray(this.selectedComponents.ram) ? this.selectedComponents.ram[0] : this.selectedComponents.ram;
        const storage = this.selectedComponents.storage;

        if (!cpu) return 0;

        let score = 0;

        // CPU contribution (50%)
        score += (cpu.performanceScore || 0) * 0.5;

        // RAM contribution (30%)
        if (ram) {
            let ramScore = 0;
            if (ram.capacity >= 64) ramScore = 100;
            else if (ram.capacity >= 32) ramScore = 90;
            else if (ram.capacity >= 16) ramScore = 70;
            else ramScore = 50;
            
            score += ramScore * 0.3;
        }

        // Storage contribution (20%)
        if (storage) {
            let storageScore = storage.type === 'NVMe SSD' ? 100 : 60;
            if (storage.readSpeed > 7000) storageScore = 100;
            else if (storage.readSpeed > 3500) storageScore = 90;
            else if (storage.readSpeed > 550) storageScore = 70;
            
            score += storageScore * 0.2;
        }

        return Math.round(Math.min(score, 100));
    }

    checkCompatibility() {
        const warnings = [];
        const cpu = this.selectedComponents.cpu;
        const motherboard = this.selectedComponents.motherboard;
        const ram = Array.isArray(this.selectedComponents.ram) ? this.selectedComponents.ram[0] : this.selectedComponents.ram;
        const gpu = this.selectedComponents.gpu;
        const psu = this.selectedComponents.psu;
        const pcCase = this.selectedComponents.case;
        const cooling = this.selectedComponents.cooling;

        // CPU-Motherboard compatibility
        if (cpu && motherboard) {
            if (cpu.socket !== motherboard.socket) {
                warnings.push({
                    type: 'error',
                    icon: 'fas fa-exclamation-circle',
                    message: `A ${cpu.name} (${cpu.socket}) nem kompatibilis a ${motherboard.name} (${motherboard.socket}) alaplappal!`
                });
            } else {
                warnings.push({
                    type: 'success',
                    icon: 'fas fa-check-circle',
                    message: 'CPU és alaplap kompatibilis!'
                });
            }
        }

        // RAM-Motherboard compatibility
        if (ram && motherboard) {
            const supportedTypes = COMPATIBILITY_RULES.ram_motherboard[motherboard.chipset];
            if (supportedTypes && !supportedTypes.includes(ram.type)) {
                warnings.push({
                    type: 'error',
                    icon: 'fas fa-exclamation-circle',
                    message: `A ${ram.name} (${ram.type}) nem támogatott a ${motherboard.chipset} chipsettel!`
                });
            }

            if (ram.capacity > motherboard.maxMemory) {
                warnings.push({
                    type: 'warning',
                    icon: 'fas fa-exclamation-triangle',
                    message: `A RAM kapacitás (${ram.capacity}GB) meghaladja az alaplap maximumát (${motherboard.maxMemory}GB)!`
                });
            }
        }

        // PSU-GPU compatibility
        if (gpu && psu) {
            const requiredWattage = COMPATIBILITY_RULES.gpu_psu_requirements[gpu.name.split(' ').slice(0, 3).join(' ')];
            if (requiredWattage && psu.wattage < requiredWattage) {
                warnings.push({
                    type: 'error',
                    icon: 'fas fa-exclamation-circle',
                    message: `A tápegység (${psu.wattage}W) nem elegendő a ${gpu.name} számára (minimum ${requiredWattage}W szükséges)!`
                });
            }
        }

        // GPU-Case compatibility
        if (gpu && pcCase) {
            if (gpu.length > pcCase.maxGpuLength) {
                warnings.push({
                    type: 'error',
                    icon: 'fas fa-exclamation-circle',
                    message: `A videokártya (${gpu.length}mm) nem fér bele a számítógépházba (max: ${pcCase.maxGpuLength}mm)!`
                });
            }
        }

        // Cooling-Case compatibility
        if (cooling && pcCase && cooling.radiatorSize) {
            const supportedRadiators = pcCase.radiatorSupport || [];
            if (!supportedRadiators.includes(`${cooling.radiatorSize}mm`)) {
                warnings.push({
                    type: 'warning',
                    icon: 'fas fa-exclamation-triangle',
                    message: `A ${cooling.radiatorSize}mm-es radiátor esetleg nem fér el a számítógépházban!`
                });
            }
        }

        // Power consumption check
        const totalPower = Object.values(this.selectedComponents).reduce((sum, comp) => sum + (comp.powerDraw || comp.tdp || 0), 0);
        if (psu && totalPower > psu.wattage * 0.8) {
            warnings.push({
                type: 'warning',
                icon: 'fas fa-exclamation-triangle',
                message: `A teljes rendszer fogyasztása (${totalPower}W) közel van a tápegység kapacitásához (${psu.wattage}W)!`
            });
        }

        // Display warnings
        this.renderWarnings(warnings);
    }

    renderWarnings(warnings) {
        const container = document.getElementById('warningsList');
        
        if (warnings.length === 0) {
            container.innerHTML = `
                <div class="warning-item success">
                    <i class="warning-icon fas fa-check-circle"></i>
                    <div class="warning-text">Minden komponens kompatibilis egymással!</div>
                </div>
            `;
            return;
        }

        container.innerHTML = warnings.map(warning => `
            <div class="warning-item ${warning.type}">
                <i class="warning-icon ${warning.icon}"></i>
                <div class="warning-text">${warning.message}</div>
            </div>
        `).join('');
    }

    updatePerformancePreview() {
        const container = document.querySelector('.performance-bars');
        const cpu = this.selectedComponents.cpu;
        const gpu = this.selectedComponents.gpu;
        const ram = this.selectedComponents.ram;

        const benchmarks = [
            { name: '4K Gaming', value: this.calculate4KGaming() },
            { name: '1440p Gaming', value: this.calculate1440pGaming() },
            { name: 'Video Edit', value: this.calculateVideoEditing() },
            { name: '3D Render', value: this.calculate3DRendering() },
            { name: 'Streaming', value: this.calculateStreaming() }
        ];

        container.innerHTML = benchmarks.map(benchmark => `
            <div class="performance-bar">
                <div class="performance-label">${benchmark.name}</div>
                <div class="performance-track">
                    <div class="performance-fill" style="width: ${benchmark.value}%"></div>
                </div>
                <div class="performance-score">${benchmark.value}</div>
            </div>
        `).join('');
    }

    calculate4KGaming() {
        const gpu = this.selectedComponents.gpu;
        if (!gpu) return 0;
        
        const scores = PERFORMANCE_BENCHMARKS.gaming['4K Ultra'];
        const gpuName = gpu.name.split(' ').slice(0, 3).join(' ');
        return scores[gpuName] || Math.round(gpu.performanceScore * 0.6);
    }

    calculate1440pGaming() {
        const gpu = this.selectedComponents.gpu;
        if (!gpu) return 0;
        
        const scores = PERFORMANCE_BENCHMARKS.gaming['1440p Ultra'];
        const gpuName = gpu.name.split(' ').slice(0, 3).join(' ');
        return scores[gpuName] || Math.round(gpu.performanceScore * 0.8);
    }

    calculateVideoEditing() {
        const cpu = this.selectedComponents.cpu;
        if (!cpu) return 0;
        
        const scores = PERFORMANCE_BENCHMARKS.workstation['Video Editing'];
        const cpuName = cpu.name.replace('Intel Core ', '').replace('AMD Ryzen ', 'Ryzen ');
        return scores[cpuName] || Math.round(cpu.performanceScore * 0.7);
    }

    calculate3DRendering() {
        const cpu = this.selectedComponents.cpu;
        if (!cpu) return 0;
        
        const scores = PERFORMANCE_BENCHMARKS.workstation['3D Rendering'];
        const cpuName = cpu.name.replace('Intel Core ', '').replace('AMD Ryzen ', 'Ryzen ');
        return scores[cpuName] || Math.round(cpu.performanceScore * 0.8);
    }

    calculateStreaming() {
        const cpu = this.selectedComponents.cpu;
        const gpu = this.selectedComponents.gpu;
        
        if (!cpu) return 0;
        
        let score = cpu.performanceScore * 0.6;
        if (gpu) {
            score += gpu.performanceScore * 0.4;
        }
        
        return Math.round(Math.min(score, 100));
    }

    searchComponents(query) {
        // Clear existing timer
        clearTimeout(this.debounceTimer);
        
        // Set new timer to debounce the search (300ms delay)
        this.debounceTimer = setTimeout(() => {
            if (!query.trim()) {
                this.renderComponents();
                return;
            }

        const filtered = this.filteredComponents[this.currentCategory].filter(component =>
            component.name.toLowerCase().includes(query.toLowerCase()) ||
            component.brand.toLowerCase().includes(query.toLowerCase()) ||
            component.specs.toLowerCase().includes(query.toLowerCase()) ||
            component.features.some(feature => feature.toLowerCase().includes(query.toLowerCase()))
        );

        const container = document.getElementById('componentList');
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="no-components">
                    <i class="fas fa-search"></i>
                    <h3>Nincs találat</h3>
                    <p>"${query}" keresésre nem található komponens ebben a kategóriában.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(component => `
            <div class="component-item ${this.selectedComponents[this.currentCategory]?.id === component.id ? 'selected' : ''}" 
                 data-component-id="${component.id}" 
                 onclick="app.selectComponent('${this.currentCategory}', '${component.id}')">
                <div class="component-image">
                    ${component.image}
                </div>
                <div class="component-details">
                    <div class="component-name">${component.name}</div>
                    <div class="component-specs">${component.specs}</div>
                    <div class="component-features">
                        ${component.features.slice(0, 3).map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="component-price">
                    ${component.formattedOriginalPrice ? 
                        `<div class="price-original">${component.formattedOriginalPrice}</div>` : ''
                    }
                    <div class="price-current">${component.formattedPrice}</div>
                </div>
            </div>
        `).join('');
        }, 300); // 300ms debounce delay
    }

    clearBuild() {
        if (Object.keys(this.selectedComponents).length === 0) {
            this.showToast('A konfiguráció már üres!', 'info');
            return;
        }

        if (confirm('Biztosan törölni szeretnéd a teljes konfigurációt?')) {
            this.selectedComponents = {};
            this.renderComponents();
            this.renderSelectedComponents();
            this.updateBuildStats();
            this.checkCompatibility();
            this.updateAllCategoryStatus();
            this.updatePerformancePreview();
            this.showToast('Konfiguráció törölve!', 'success');
        }
    }

    renderPrebuilds() {
        const container = document.getElementById('prebuildsGrid');
        
        container.innerHTML = PREBUILT_CONFIGS.map(config => `
            <div class="prebuild-card" onclick="app.loadPrebuild('${config.id}')">
                <div class="prebuild-badge">${config.badge}</div>
                <div class="prebuild-title">${config.name}</div>
                <div class="prebuild-description">${config.description}</div>
                <div class="prebuild-specs">
                    ${config.specs.map(spec => `
                        <div class="prebuild-spec">
                            <i class="fas fa-check"></i>
                            <span>${spec}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="prebuild-footer">
                    <div class="prebuild-price">${this.formatPrice(config.price)}</div>
                    <button class="prebuild-btn">Betöltés</button>
                </div>
            </div>
        `).join('');
    }

    loadPrebuild(configId) {
        const config = PREBUILT_CONFIGS.find(c => c.id === configId);
        if (!config) return;

        // Load components
        Object.keys(config.components).forEach(category => {
            const componentId = config.components[category];
            const component = this.findComponentById(componentId);
            if (component) {
                this.selectedComponents[category] = component;
            }
        });

        // Switch to builder tab and update UI
        this.switchTab('builder');
        this.renderComponents();
        this.renderSelectedComponents();
        this.updateBuildStats();
        this.checkCompatibility();
        this.updateAllCategoryStatus();
        this.updatePerformancePreview();

        this.showToast(`${config.name} konfiguráció betöltve!`, 'success');
    }

    // Utility functions
    formatPrice(price) {
        return new Intl.NumberFormat('hu-HU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price) + ' Ft';
    }

    getCategoryDisplayName(category) {
        const names = {
            'cpu': 'Processzor',
            'gpu': 'Videokártya',
            'motherboard': 'Alaplap',
            'ram': 'Memória',
            'storage': 'Tárhely',
            'psu': 'Tápegység',
            'case': 'Számítógépház',
            'cooling': 'Hűtés'
        };
        return names[category] || category;
    }

    getComponentCategory(componentId) {
        for (const [category, components] of Object.entries(COMPONENTS_DATA)) {
            if (components.find(c => c.id === componentId)) {
                return category;
            }
        }
        return null;
    }

    findComponentById(componentId) {
        for (const [category, components] of Object.entries(this.filteredComponents)) {
            const component = components.find(c => c.id === componentId);
            if (component) return component;
        }
        return null;
    }

    updateCategoryStatus(category) {
        const categoryElement = document.querySelector(`[data-category="${category}"]`);
        const statusIndicator = categoryElement.querySelector('.status-indicator');
        
        if (this.selectedComponents[category]) {
            categoryElement.classList.add('selected');
            statusIndicator.style.backgroundColor = 'var(--success-color)';
        } else {
            categoryElement.classList.remove('selected');
            statusIndicator.style.backgroundColor = 'var(--text-tertiary)';
        }
    }

    updateAllCategoryStatus() {
        Object.keys(COMPONENTS_DATA).forEach(category => {
            this.updateCategoryStatus(category);
        });
    }

    updateStatColors(totalPrice, totalPower, gamingScore, workScore) {
        // Color coding based on values
        const priceElement = document.getElementById('totalPrice');
        const powerElement = document.getElementById('totalPower');
        const gamingElement = document.getElementById('gamingScore');
        const workElement = document.getElementById('workScore');

        // Reset classes
        [priceElement, powerElement, gamingElement, workElement].forEach(el => {
            el.classList.remove('text-success', 'text-warning', 'text-error');
        });

        // Price coloring
        if (totalPrice > 2000000) priceElement.classList.add('text-error');
        else if (totalPrice > 1000000) priceElement.classList.add('text-warning');
        else if (totalPrice > 0) priceElement.classList.add('text-success');

        // Performance coloring
        if (gamingScore >= 90) gamingElement.classList.add('text-success');
        else if (gamingScore >= 70) gamingElement.classList.add('text-warning');
        else if (gamingScore > 0) gamingElement.classList.add('text-error');

        if (workScore >= 90) workElement.classList.add('text-success');
        else if (workScore >= 70) workElement.classList.add('text-warning');
        else if (workScore > 0) workElement.classList.add('text-error');
    }

    showToast(message, type = 'info', is2DBuilder = false) {
        // Check if 2D Builder notifications are disabled
        if (is2DBuilder && !this.show2DBuilderNotifications) {
            return; // Don't show notification if 2D Builder notifications are disabled
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="toast-icon ${icons[type]}"></i>
            <span class="toast-message">${message}</span>
        `;

        document.getElementById('toastContainer').appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);

        // Click to dismiss
        toast.addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }

    showSaveModal() {
        const modal = document.getElementById('saveModal');
        this.loadSavedConfigs();
        modal.classList.add('active');
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }

    saveConfiguration() {
        const configName = document.getElementById('configName').value.trim();
        
        if (!configName) {
            this.showToast('Add meg a konfiguráció nevét!', 'error');
            return;
        }

        if (Object.keys(this.selectedComponents).length === 0) {
            this.showToast('Nincs mit menteni! Válassz ki komponenseket!', 'error');
            return;
        }

        const config = {
            id: Date.now().toString(),
            name: configName,
            components: { ...this.selectedComponents },
            totalPrice: Object.values(this.selectedComponents).reduce((sum, comp) => sum + comp.price, 0),
            createdAt: new Date().toISOString(),
            gamingScore: this.calculateGamingScore(),
            workScore: this.calculateWorkScore()
        };

        this.savedConfigs.push(config);
        localStorage.setItem('savedConfigs', JSON.stringify(this.savedConfigs));
        
        this.loadSavedConfigs();
        document.getElementById('configName').value = '';
        
        this.showToast(`"${configName}" konfiguráció mentve!`, 'success');
    }

    loadSavedConfigs() {
        const container = document.getElementById('savedConfigs');
        
        if (this.savedConfigs.length === 0) {
            container.innerHTML = `
                <div class="no-saved-configs">
                    <i class="fas fa-save"></i>
                    <h4>Nincsenek mentett konfigurációk</h4>
                    <p>Ments el egy konfigurációt, hogy később betölthasd!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.savedConfigs.map(config => `
            <div class="saved-config-item">
                <div class="config-info">
                    <div class="config-name">${config.name}</div>
                    <div class="config-details">
                        ${this.formatPrice(config.totalPrice)} | 
                        Gaming: ${config.gamingScore} | 
                        Work: ${config.workScore}
                    </div>
                    <div class="config-date">${new Date(config.createdAt).toLocaleDateString('hu-HU')}</div>
                </div>
                <div class="config-actions">
                    <button onclick="app.loadSavedConfig('${config.id}')" class="btn btn-primary">
                        <i class="fas fa-download"></i> Betöltés
                    </button>
                    <button onclick="app.deleteSavedConfig('${config.id}')" class="btn btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadSavedConfig(configId) {
        const config = this.savedConfigs.find(c => c.id === configId);
        if (!config) return;

        this.selectedComponents = { ...config.components };
        
        this.closeModal(document.getElementById('saveModal'));
        this.switchTab('builder');
        this.renderComponents();
        this.renderSelectedComponents();
        this.updateBuildStats();
        this.checkCompatibility();
        this.updateAllCategoryStatus();
        this.updatePerformancePreview();

        this.showToast(`"${config.name}" konfiguráció betöltve!`, 'success');
    }

    deleteSavedConfig(configId) {
        const config = this.savedConfigs.find(c => c.id === configId);
        if (!config) return;

        if (confirm(`Biztosan törölni szeretnéd a "${config.name}" konfigurációt?`)) {
            this.savedConfigs = this.savedConfigs.filter(c => c.id !== configId);
            localStorage.setItem('savedConfigs', JSON.stringify(this.savedConfigs));
            this.loadSavedConfigs();
            this.showToast(`"${config.name}" konfiguráció törölve!`, 'warning');
        }
    }

    autoSaveBuild() {
        if (Object.keys(this.selectedComponents).length > 0) {
            localStorage.setItem('autosave_build', JSON.stringify(this.selectedComponents));
        }
    }

    loadAutosaveBuild() {
        try {
            const autosave = localStorage.getItem('autosave_build');
            if (autosave) {
                const components = JSON.parse(autosave);
                if (Object.keys(components).length > 0) {
                    this.selectedComponents = components;
                    return true;
                }
            }
        } catch (e) {
            console.error('Failed to load autosave:', e);
        }
        return false;
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S = Save configuration
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.showSaveModal();
        }
        
        // Escape = Close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                this.closeModal(modal);
            });
        }
        
        // Ctrl/Cmd + K = Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('componentSearch').focus();
        }
    }

    render2DBuilder() {
        console.log('🏗️ Rendering 2D Builder');
        this.render2DInventory();
        console.log('📦 Inventory rendered');
        this.setup2DVisualEventListeners();
        console.log('🎮 Event listeners set up');
        this.update2DVisualSlots();
        console.log('🎯 Visual slots updated');
        
        // Update RAM inventory status based on current slot occupancy
        setTimeout(() => {
            this.updateRamInventoryStatus();
        }, 100);
    }
    
    render2DInventory() {
        console.log('📦 Rendering 2D Inventory');
        const container = document.getElementById('inventory2d');
        console.log('📋 Container found:', container);
        
        // Handle RAM arrays and exclude motherboard from inventory
        const allComponents = [];
        Object.entries(this.selectedComponents).forEach(([category, component]) => {
            if (category === 'ram' && Array.isArray(component)) {
                allComponents.push(...component);
            } else if (component) {
                allComponents.push(component);
            }
        });
        console.log('📦 All selected components:', allComponents.length);
        
        const components = allComponents.filter(component => {
            const category = this.getComponentCategory(component.id);
            return category !== 'motherboard';
        });
        console.log('🎮 Draggable components (excluding motherboard):', components.length);
        
        if (components.length === 0) {
            container.innerHTML = `
                <div class="empty-inventory">
                    <i class="fas fa-inbox"></i>
                    <p>Nincs húzható komponens</p>
                    <p>Az alaplap fix, a többi komponenst húzd a helyükre!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = components.map(component => {
            const category = this.getComponentCategory(component.id);
            const imageUrl = this.getComponentVisualImage(category);
            return `
                <div class="inventory-item" 
                     draggable="true" 
                     data-component-id="${component.id}"
                     data-component-category="${category}">
                    <div class="inventory-item-image">
                        <img src="${imageUrl}" alt="${component.name}" draggable="false">
                    </div>
                    <div class="inventory-item-info">
                        <h4>${component.name.split(' ').slice(0, 3).join(' ')}</h4>
                        <p>${component.specs || this.getCategoryDisplayName(category)}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    setup2DVisualEventListeners() {
        console.log('🔧 Setting up 2D Visual Event Listeners');
        
        // Remove old listeners by cloning and replacing nodes
        const inventoryContainer = document.getElementById('inventory2d');
        if (inventoryContainer) {
            const newInventory = inventoryContainer.cloneNode(true);
            inventoryContainer.parentNode.replaceChild(newInventory, inventoryContainer);
        }
        
        // Get fresh references after potential DOM update
        setTimeout(() => {
            const components = document.querySelectorAll('.inventory-item');
            const visualSlots = document.querySelectorAll('.visual-drop-zone');
            
            console.log('📦 Found components:', components.length);
            console.log('🎯 Found visual slots:', visualSlots.length);
            
            // Setup drag events for inventory components
            components.forEach(component => {
                // Make sure the element is draggable
                component.setAttribute('draggable', 'true');
                
                component.addEventListener('dragstart', (e) => {
                    console.log('🚀 Drag started!');
                    const componentId = component.dataset.componentId;
                    const componentCategory = component.dataset.componentCategory;
                    
                    console.log('🆔 Component ID:', componentId);
                    console.log('🏷️ Component Category:', componentCategory);
                    
                    if (componentId && componentCategory) {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', componentId); // Fallback for compatibility
                        e.dataTransfer.setData('componentId', componentId);
                        e.dataTransfer.setData('componentCategory', componentCategory);
                        component.classList.add('dragging');
                        console.log('✅ Drag data set successfully');
                    } else {
                        console.error('❌ Missing component data!');
                    }
                });
                
                component.addEventListener('dragend', (e) => {
                    component.classList.remove('dragging');
                    console.log('🏁 Drag ended');
                });
            });
            
            // Setup drop zones
            visualSlots.forEach(slot => {
                slot.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    // Special handling for CPU over cooler area
                    const componentCategory = e.dataTransfer.getData('componentCategory');
                    const slotType = slot.dataset.slotType;
                    
                    if (slotType === 'cooling' && componentCategory === 'cpu') {
                        // Check if CPU slot is available
                        const cpuSlot = document.getElementById('visual-cpu-slot');
                        if (cpuSlot && !cpuSlot.classList.contains('occupied')) {
                            slot.classList.add('drag-over', 'cpu-redirect');
                            cpuSlot.classList.add('highlight-target');
                        } else {
                            slot.classList.add('invalid-drop');
                        }
                    } else {
                        slot.classList.add('drag-over');
                    }
                });
                
                slot.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    slot.classList.add('drag-over');
                });
                
                slot.addEventListener('dragleave', (e) => {
                    // Only remove if we're actually leaving the slot
                    if (!slot.contains(e.relatedTarget)) {
                        slot.classList.remove('drag-over', 'cpu-redirect', 'invalid-drop');
                        // Clean up CPU slot highlighting
                        const cpuSlot = document.getElementById('visual-cpu-slot');
                        if (cpuSlot) {
                            cpuSlot.classList.remove('highlight-target');
                        }
                    }
                });
                
                slot.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎯 Drop event triggered!');
                    
                    // Debug: Check drop processing state
                    console.log('📊 Drop processing flag before check:', this.isProcessingDrop);
                    
                    // Prevent multiple simultaneous drops
                    if (this.isProcessingDrop) {
                        console.log('⚠️ Drop already being processed, ignoring...');
                        return;
                    }
                    this.isProcessingDrop = true;
                    console.log('🔄 Drop processing flag set to true');
                    
                    slot.classList.remove('drag-over', 'cpu-redirect', 'invalid-drop');
                    // Clean up CPU slot highlighting
                    const cpuSlot = document.getElementById('visual-cpu-slot');
                    if (cpuSlot) {
                        cpuSlot.classList.remove('highlight-target');
                    }
                    
                    // Try to get data in multiple ways for compatibility
                    let componentId = e.dataTransfer.getData('componentId');
                    let componentCategory = e.dataTransfer.getData('componentCategory');
                    
                    // Fallback to text/plain
                    if (!componentId) {
                        componentId = e.dataTransfer.getData('text/plain');
                        // Try to find component category from selected components
                        const component = this.findComponentById(componentId);
                        if (component) {
                            componentCategory = this.getComponentCategory(componentId);
                        }
                    }
                    
                    const slotType = slot.dataset.slotType;
                    
                    console.log('🆔 Dropped component ID:', componentId);
                    console.log('🏷️ Dropped component category:', componentCategory);
                    console.log('🎯 Slot type:', slotType);
                    
                    if (!componentId || !componentCategory) {
                        console.error('❌ No component data received!');
                        this.showToast('Hiba történt! Próbáld újra.', 'error', true);
                        this.isProcessingDrop = false; // Reset flag on error
                        return;
                    }
                    
                    // Special handling for CPU when cooler area is clicked
                    if (slotType === 'cooling' && componentCategory === 'cpu') {
                        // Find the CPU slot and place the CPU there instead
                        const cpuSlot = document.getElementById('visual-cpu-slot');
                        if (cpuSlot && !cpuSlot.classList.contains('occupied')) {
                            console.log('💻 CPU dropped on cooler area, placing in CPU slot');
                            this.place2DVisualComponent(componentId, cpuSlot);
                            
                            // Make sure to disable the CPU inventory item using universal function
                            this.disableInventoryItem(componentId, componentCategory);
                            
                            this.showToast('Processzor elhelyezve a CPU foglalatban!', 'success', true);
                            
                            // Reset drop processing flag for CPU special case
                            this.isProcessingDrop = false;
                            return;
                        }
                    }
                    
                    if (this.isValidVisualDrop(componentCategory, slotType, slot)) {
                        console.log('✅ Valid drop - placing component');
                        this.place2DVisualComponent(componentId, slot);
                        this.showToast('Komponens sikeresen elhelyezve!', 'success', true);
                    } else {
                        console.log('❌ Invalid drop');
                        slot.classList.add('invalid-drop');
                        setTimeout(() => slot.classList.remove('invalid-drop'), 1000);
                        this.showToast('A komponens nem helyezhető ide!', 'error', true);
                    }
                    
                    // Reset drop processing flag immediately
                    this.isProcessingDrop = false;
                });
                
                // Double click to remove placed components
                slot.addEventListener('dblclick', (e) => {
                    if (slot.classList.contains('occupied')) {
                        this.remove2DVisualComponent(slot);
                    }
                });
            });
            
            // Control buttons
            const clearBtn = document.getElementById('clearBuild2d');
            const autoBtn = document.getElementById('autoBuild2d');
            
            if (clearBtn) {
                clearBtn.replaceWith(clearBtn.cloneNode(true));
                document.getElementById('clearBuild2d').addEventListener('click', () => this.clear2DBuilder());
            }
            
            if (autoBtn) {
                autoBtn.replaceWith(autoBtn.cloneNode(true));
                document.getElementById('autoBuild2d').addEventListener('click', () => this.autoBuild2D());
            }
            
            console.log('✅ Event listeners setup complete');
        }, 100);
    }
    
    isValidDrop(componentCategory, slotType, slot) {
        // Basic category matching
        if (componentCategory === slotType) return true;
        
        // Special cases
        if (slotType === 'storage' && (componentCategory === 'storage')) return true;
        if (slotType === 'psu' && componentCategory === 'psu') {
            // PSU can go in PSU bay or power connectors
            return slot.classList.contains('psu-bay') || slot.classList.contains('power-slot');
        }
        
        // RAM can go in any RAM slot that's not occupied
        if (componentCategory === 'ram' && slotType === 'ram') {
            return !slot.classList.contains('occupied');
        }
        
        return false;
    }
    
    isValidVisualDrop(componentCategory, slotType, slot) {
        console.log(`🤔 Checking validity: component='${componentCategory}', slot='${slotType}', occupied=${slot.classList.contains('occupied')}`);
        
        // Check if slot is already occupied
        if (slot.classList.contains('occupied')) {
            console.log('❌ Slot already occupied');
            return false;
        }
        
        // Basic category matching
        if (componentCategory === slotType) {
            console.log('✅ Basic category match');
            return true;
        }
        
        // Special cases for visual slots
        if (slotType === 'storage' && componentCategory === 'storage') {
            console.log('✅ Storage special case match');
            return true;
        }
        
        // PSU can go in PSU slot
        if (slotType === 'psu' && componentCategory === 'psu') {
            console.log('✅ PSU special case match');
            return true;
        }
        
        // RAM can go in any RAM slot that's not occupied
        if (componentCategory === 'ram' && slotType === 'ram') {
            console.log('✅ RAM special case match');
            return true;
        }
        
        // CPU cooler can be installed when CPU is present (special case)
        if (componentCategory === 'cooling' && slotType === 'cooling') {
            console.log('✅ Cooling special case match');
            return true;
        }
        
        console.log('❌ No valid match found');
        return false;
    }
    
    place2DComponent(componentId, slot) {
        const component = this.findComponentById(componentId);
        if (!component) return;
        
        // Clear slot first
        slot.classList.remove('occupied', 'invalid');
        slot.classList.add('occupied');
        
        // Add component to slot
        const slotContent = slot.querySelector('.slot-content');
        slotContent.innerHTML = `
            <div class="placed-component" data-component-id="${componentId}">
                <div class="placed-component-icon">${component.image}</div>
                <div class="placed-component-name">${component.name.split(' ').slice(0, 2).join(' ')}</div>
            </div>
        `;
        
        // Remove from inventory (visual only)
        const inventoryItem = document.querySelector(`[data-component-id="${componentId}"]`);
        if (inventoryItem && inventoryItem.classList.contains('inventory-component')) {
            inventoryItem.style.opacity = '0.3';
            inventoryItem.style.pointerEvents = 'none';
            inventoryItem.draggable = false;
        }
        
        // Update slot appearance based on correctness
        this.validate2DPlacement(slot, component);
    }
    
    place2DVisualComponent(componentId, slot) {
        const component = this.findComponentById(componentId);
        if (!component) return;
        
        const componentCategory = this.getComponentCategory(componentId);
        
        // Clear slot first and ensure clean state
        slot.classList.remove('occupied', 'invalid-drop', 'invalid', 'drag-over');
        slot.classList.add('occupied');
        
        // Add visual component to drop zone
        const dropZoneContent = slot.querySelector('.drop-zone-content');
        const componentImage = this.getComponentVisualImage(componentCategory);
        
        dropZoneContent.innerHTML = `
            <div class="placed-visual-component" data-component-id="${componentId}">
                <img src="${componentImage}" 
                     alt="${component.name}" 
                     title="${component.name}" 
                     class="component-visual-img" 
                     draggable="false"
                     onerror="console.error('Failed to load image: ${componentImage}'); this.src='images/default-component.svg';">
                <div class="component-remove-overlay" 
                     onclick="app.remove2DVisualComponent(this.closest('.visual-drop-zone'))">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        `;
        
        console.log(`🖼️ Placed ${componentCategory} component with image: ${componentImage}`);
        
        // Special handling for GPU to ensure proper display
        if (componentCategory === 'gpu') {
            console.log('🎮 GPU placed, applying special GPU styling...');
            slot.classList.add('gpu-placed');
        }
        
        // Use universal disable function for all non-RAM components
        if (componentCategory !== 'ram') {
            this.disableInventoryItem(componentId, componentCategory);
            // Debug: show all inventory items after disabling
            setTimeout(() => this.debugInventoryItems(), 100);
        }
        
        // Handle inventory visual feedback for all components
        const inventoryItem = document.querySelector(`[data-component-id="${componentId}"]`);
        if (inventoryItem && inventoryItem.classList.contains('inventory-item')) {
            
            if (componentCategory === 'ram') {
                // For RAM, check how many slots are already filled
                const ramSlots = document.querySelectorAll('.ram-drop-zone.occupied');
                const maxRamSlots = document.querySelectorAll('.ram-drop-zone').length;
                
                if (ramSlots.length >= maxRamSlots) {
                    // All RAM slots filled, disable the inventory item
                    inventoryItem.style.opacity = '0.3';
                    inventoryItem.style.pointerEvents = 'none';
                    inventoryItem.draggable = false;
                } else {
                    // Still has available slots, keep it draggable but show visual feedback
                    inventoryItem.style.borderColor = '#27ae60';
                    inventoryItem.style.backgroundColor = 'rgba(46, 204, 113, 0.2)';
                    setTimeout(() => {
                        inventoryItem.style.borderColor = '';
                        inventoryItem.style.backgroundColor = '';
                    }, 1000);
                }
            } else {
                // For all other components including CPU, disable after placement
                console.log(`🚫 Disabling inventory item for ${componentCategory}: ${componentId}`);
                inventoryItem.style.opacity = '0.3';
                inventoryItem.style.pointerEvents = 'none';
                inventoryItem.draggable = false;
            }
        }
        
        // For RAM, track which slot is being used
        if (componentCategory === 'ram') {
            const slotIndex = slot.dataset.slotIndex;
            console.log(`🎯 RAM placed in slot ${slotIndex}`);
        }
        
        // Update slot appearance based on correctness
        this.validate2DVisualPlacement(slot, component);
    }
    
    validate2DPlacement(slot, component) {
        const slotType = slot.dataset.slotType;
        const componentCategory = this.getComponentCategory(component.id);
        
        // Check if component is in the right slot type
        if (componentCategory === slotType || 
            (slotType === 'storage' && component.type && component.type.includes('SSD')) ||
            (slotType === 'psu' && componentCategory === 'psu')) {
            slot.classList.add('occupied');
            slot.classList.remove('invalid');
        } else {
            slot.classList.add('invalid');
        }
        
        // Additional validation for specific components
        if (componentCategory === 'cpu' && this.selectedComponents.motherboard) {
            const cpu = component;
            const mb = this.selectedComponents.motherboard;
            if (cpu.socket !== mb.socket) {
                slot.classList.add('invalid');
                slot.classList.remove('occupied');
            }
        }
    }
    
    validate2DVisualPlacement(slot, component) {
        const slotType = slot.dataset.slotType;
        const componentCategory = this.getComponentCategory(component.id);
        
        console.log(`🔍 Validating placement: component=${componentCategory}, slot=${slotType}`);
        
        // Always assume valid placement for now (fix piros border issue)
        // The drag validation already happened, so if we got here, it should be valid
        console.log('✅ Valid placement - setting occupied status');
        slot.classList.add('occupied');
        slot.classList.remove('invalid-drop', 'invalid');
        
        // Optional: Add compatibility warnings without visual red border
        if (componentCategory === 'cpu' && this.selectedComponents.motherboard) {
            const cpu = component;
            const mb = this.selectedComponents.motherboard;
            if (cpu.socket && mb.socket && cpu.socket !== mb.socket) {
                console.log('⚠️ CPU socket mismatch detected, but allowing placement');
                // Don't add visual invalid styling, just log the warning
            }
        }
    }
    
    getComponentVisualImage(category) {
        const imageMap = {
            'cpu': 'images/processzor.jpg',
            'gpu': 'images/vidi.png',
            'ram': 'images/ram.png',
            'storage': 'images/ssd.png',
            'motherboard': 'images/alaplap.jpg',
            'psu': 'images/tap.png',
            'cooling': 'images/huto.jpg',
            'case': 'images/gephaz.jpg'
        };
        
        return imageMap[category] || 'images/default-component.svg';
    }
    
    remove2DComponent(slot) {
        const placedComponent = slot.querySelector('.placed-component');
        if (!placedComponent) return;
        
        const componentId = placedComponent.dataset.componentId;
        
        // Clear slot
        slot.classList.remove('occupied', 'invalid');
        slot.querySelector('.slot-content').innerHTML = '';
        
        // Restore in inventory
        const inventoryItem = document.querySelector(`[data-component-id="${componentId}"].inventory-component`);
        if (inventoryItem) {
            inventoryItem.style.opacity = '1';
            inventoryItem.style.pointerEvents = 'auto';
            inventoryItem.draggable = true;
        }
        
        this.showToast('Komponens eltávolítva!', 'warning', true);
    }
    
    remove2DVisualComponent(slot) {
        const placedComponent = slot.querySelector('.placed-visual-component');
        if (!placedComponent) return;
        
        const componentId = placedComponent.dataset.componentId;
        
        // Clear slot
        slot.classList.remove('occupied', 'invalid-drop');
        slot.querySelector('.drop-zone-content').innerHTML = '';
        
        // Restore in inventory for all components
        const component = this.findComponentById(componentId);
        const componentCategory = this.getComponentCategory(componentId);
        
        const inventoryItem = document.querySelector(`[data-component-id="${componentId}"].inventory-item`);
        if (inventoryItem) {
            inventoryItem.style.opacity = '1';
            inventoryItem.style.pointerEvents = 'auto';
            inventoryItem.draggable = true;
            
            // Clear any temporary styling
            inventoryItem.style.borderColor = '';
            inventoryItem.style.backgroundColor = '';
        }
        
        // Update RAM inventory status if a RAM component was removed
        if (componentCategory === 'ram') {
            this.updateRamInventoryStatus();
        }
        
        this.showToast('Komponens eltávolítva!', 'warning', true);
    }
    
    updateRamInventoryStatus() {
        // Check how many RAM slots are currently occupied
        const occupiedRamSlots = document.querySelectorAll('.ram-drop-zone.occupied');
        const totalRamSlots = document.querySelectorAll('.ram-drop-zone');
        
        // Find RAM inventory items
        const ramInventoryItems = document.querySelectorAll('.inventory-item[data-component-category="ram"]');
        
        ramInventoryItems.forEach(item => {
            if (occupiedRamSlots.length >= totalRamSlots.length) {
                // All slots filled, disable RAM
                item.style.opacity = '0.3';
                item.style.pointerEvents = 'none';
                item.draggable = false;
            } else {
                // Slots available, enable RAM
                item.style.opacity = '1';
                item.style.pointerEvents = 'auto';
                item.draggable = true;
            }
        });
        
        console.log(`📊 RAM status updated: ${occupiedRamSlots.length}/${totalRamSlots.length} slots occupied`);
    }
    
    disableInventoryItem(componentId, componentCategory) {
        console.log(`🚫 Attempting to disable inventory item: ${componentCategory} - ${componentId}`);
        
        // Try multiple selectors to find the inventory item
        const selectors = [
            `[data-component-id="${componentId}"].inventory-item`,
            `.inventory-item[data-component-id="${componentId}"]`,
            `[data-component-id="${componentId}"]`,
            `.inventory-item[data-component-category="${componentCategory}"]`
        ];
        
        let inventoryItem = null;
        for (const selector of selectors) {
            inventoryItem = document.querySelector(selector);
            if (inventoryItem) {
                console.log(`✅ Found inventory item with selector: ${selector}`);
                break;
            }
        }
        
        if (inventoryItem) {
            inventoryItem.style.opacity = '0.3';
            inventoryItem.style.pointerEvents = 'none';
            inventoryItem.draggable = false;
            console.log(`✅ Successfully disabled inventory item for ${componentCategory}`);
            return true;
        } else {
            console.log(`❌ Could not find inventory item for ${componentCategory} - ${componentId}`);
            return false;
        }
    }
    
    debugInventoryItems() {
        console.log('📊 Debugging inventory items:');
        const allInventoryItems = document.querySelectorAll('.inventory-item');
        allInventoryItems.forEach((item, index) => {
            const componentId = item.dataset.componentId;
            const componentCategory = item.dataset.componentCategory;
            const isDisabled = item.style.opacity === '0.3';
            console.log(`${index + 1}. ID: ${componentId}, Category: ${componentCategory}, Disabled: ${isDisabled}`);
        });
    }
    
    update2DVisualSlots() {
        // Reset all visual drop zones
        const visualSlots = document.querySelectorAll('.visual-drop-zone');
        visualSlots.forEach(slot => {
            slot.classList.remove('occupied', 'invalid-drop');
            const dropZoneContent = slot.querySelector('.drop-zone-content');
            if (dropZoneContent) {
                dropZoneContent.innerHTML = '';
            }
        });
    }
    
    clear2DBuilder() {
        const slots = document.querySelectorAll('.component-slot, .visual-drop-zone');
        slots.forEach(slot => {
            if (slot.classList.contains('occupied')) {
                if (slot.classList.contains('visual-drop-zone')) {
                    this.remove2DVisualComponent(slot);
                } else {
                    this.remove2DComponent(slot);
                }
            }
        });
        
        // Restore all inventory items to active state
        const allInventoryItems = document.querySelectorAll('.inventory-item');
        allInventoryItems.forEach(item => {
            item.style.opacity = '1';
            item.style.pointerEvents = 'auto';
            item.draggable = true;
            item.style.borderColor = '';
            item.style.backgroundColor = '';
        });
        
        // Reset drop processing flag to ensure drag & drop works
        this.isProcessingDrop = false;
        console.log('🔄 Drop processing flag reset in clear function');
        
        this.showToast('2D builder kitörölve!', 'success', true);
    }
    
    autoBuild2D() {
        if (Object.keys(this.selectedComponents).length === 0) {
            this.showToast('Először válassz komponenseket!', 'warning', true);
            return;
        }
        
        // Clear first
        this.clear2DBuilder();
        
        // Auto place components with delay for animation
        const placements = [];
        
        // Add CPU first (must be placed before cooler)
        if (this.selectedComponents.cpu) {
            placements.push({ category: 'cpu', componentId: this.selectedComponents.cpu.id, slot: 'visual-cpu-slot', priority: 1 });
        }
        
        // Add RAM modules - distribute across 2 slots only
        if (this.selectedComponents.ram) {
            const ramModules = Array.isArray(this.selectedComponents.ram) ? this.selectedComponents.ram : [this.selectedComponents.ram];
            // Use only the first RAM module, place it in both slots
            if (ramModules.length > 0) {
                placements.push({ category: 'ram', componentId: ramModules[0].id, slot: 'visual-ram-slot-0' });
                placements.push({ category: 'ram', componentId: ramModules[0].id, slot: 'visual-ram-slot-1' });
            }
        }
        
        // Add other components
        if (this.selectedComponents.gpu) {
            placements.push({ category: 'gpu', componentId: this.selectedComponents.gpu.id, slot: 'visual-gpu-slot' });
        }
        if (this.selectedComponents.storage) {
            placements.push({ category: 'storage', componentId: this.selectedComponents.storage.id, slot: 'visual-m2-slot-1' });
        }
        if (this.selectedComponents.psu) {
            placements.push({ category: 'psu', componentId: this.selectedComponents.psu.id, slot: 'visual-psu-slot' });
        }
        if (this.selectedComponents.cooling) {
            placements.push({ category: 'cooling', componentId: this.selectedComponents.cooling.id, slot: 'visual-cooling-slot', priority: 5 });
        }
        if (this.selectedComponents.case) {
            placements.push({ category: 'case', componentId: this.selectedComponents.case.id, slot: 'visual-case-slot' });
        }
        
        // Sort placements by priority to ensure CPU is placed before cooler
        placements.sort((a, b) => (a.priority || 10) - (b.priority || 10));
        
        placements.forEach((placement, index) => {
            setTimeout(() => {
                const slot = document.getElementById(placement.slot);
                
                if (placement.componentId && slot) {
                    this.place2DVisualComponent(placement.componentId, slot);
                }
                
                // Update RAM status after the last placement
                if (index === placements.length - 1) {
                    setTimeout(() => {
                        this.updateRamInventoryStatus();
                    }, 200);
                }
            }, index * 500);
        });
        
        this.showToast('Automatikus összerakás elindítva!', 'info', true);
    }
    
    update2DSlots() {
        // Update slot states based on selected motherboard
        const motherboard = this.selectedComponents.motherboard;
        if (!motherboard) return;
        
        // Update RAM slots based on motherboard
        const ramSlots = document.querySelectorAll('.ram-slot');
        ramSlots.forEach((slot, index) => {
            if (index >= motherboard.memorySlots) {
                slot.style.display = 'none';
            } else {
                slot.style.display = 'flex';
            }
        });
        
        // Update M.2 slots
        const m2Slots = document.querySelectorAll('.m2-slot');
        m2Slots.forEach((slot, index) => {
            if (index >= motherboard.m2Slots) {
                slot.style.display = 'none';
            } else {
                slot.style.display = 'flex';
            }
        });
    }

    renderBenchmarkView() {
        // Placeholder for benchmark functionality
        const container = document.getElementById('benchmarkContent');
        const cpu = this.selectedComponents.cpu;
        const gpu = this.selectedComponents.gpu;

        if (!cpu && !gpu) {
            container.innerHTML = `
                <div class="benchmark-placeholder">
                    <i class="fas fa-tachometer-alt"></i>
                    <h3>Benchmark Eredmények</h3>
                    <p>Válassz ki legalább egy CPU-t vagy GPU-t a benchmark eredmények megtekintéséhez!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="benchmark-results">
                <div class="benchmark-section">
                    <h3><i class="fas fa-gamepad"></i> Gaming Benchmarks</h3>
                    <div class="benchmark-grid">
                        <div class="benchmark-card">
                            <h4>Cyberpunk 2077</h4>
                            <div class="benchmark-bars">
                                <div class="benchmark-bar">
                                    <span>4K Ultra:</span>
                                    <div class="bar"><div class="fill" style="width: ${this.calculate4KGaming()}%"></div></div>
                                    <span>${this.calculate4KGaming()} FPS</span>
                                </div>
                                <div class="benchmark-bar">
                                    <span>1440p Ultra:</span>
                                    <div class="bar"><div class="fill" style="width: ${Math.min(this.calculate1440pGaming(), 100)}%"></div></div>
                                    <span>${this.calculate1440pGaming()} FPS</span>
                                </div>
                            </div>
                        </div>
                        <div class="benchmark-card">
                            <h4>Red Dead Redemption 2</h4>
                            <div class="benchmark-bars">
                                <div class="benchmark-bar">
                                    <span>4K Ultra:</span>
                                    <div class="bar"><div class="fill" style="width: ${Math.max(this.calculate4KGaming() - 5, 0)}%"></div></div>
                                    <span>${Math.max(this.calculate4KGaming() - 5, 0)} FPS</span>
                                </div>
                                <div class="benchmark-bar">
                                    <span>1440p Ultra:</span>
                                    <div class="bar"><div class="fill" style="width: ${Math.min(this.calculate1440pGaming() - 3, 100)}%"></div></div>
                                    <span>${Math.max(this.calculate1440pGaming() - 3, 0)} FPS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="benchmark-section">
                    <h3><i class="fas fa-cogs"></i> Productivity Benchmarks</h3>
                    <div class="benchmark-grid">
                        <div class="benchmark-card">
                            <h4>Cinebench R23</h4>
                            <div class="benchmark-score">
                                <span class="score-value">${cpu ? Math.round(cpu.cores * cpu.boostClock * 1000) : 0}</span>
                                <span class="score-label">Multi-Core Score</span>
                            </div>
                        </div>
                        <div class="benchmark-card">
                            <h4>Blender BMW Render</h4>
                            <div class="benchmark-score">
                                <span class="score-value">${cpu ? Math.max(300 - cpu.cores * 10, 30) : 0}s</span>
                                <span class="score-label">Render Time</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PCBuilderApp();
    
    // Check for autosaved build
    if (window.app.loadAutosaveBuild()) {
        window.app.showToast('Automatikusan mentett konfiguráció betöltve!', 'info');
        window.app.renderSelectedComponents();
        window.app.updateBuildStats();
        window.app.checkCompatibility();
        window.app.updateAllCategoryStatus();
        window.app.updatePerformancePreview();
    }
});

// Service Worker for offline functionality (placeholder)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js');
    });
}