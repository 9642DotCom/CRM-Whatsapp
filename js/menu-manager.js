// Menu Manager - Gerencia as funcionalidades do menu
class MenuManager {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.toggleButton = document.getElementById('sidebarToggle');
        this.isMobile = window.innerWidth < 992;
        this.activeSubmenus = new Set();
        
        this.init();
    }

    init() {
        // Inicializa os event listeners
        this.setupEventListeners();
        
        // Verifica o estado inicial
        this.checkInitialState();
        
        // Adiciona efeito ripple nos botões
        this.setupRippleEffect();
        
        // Inicializa tooltips
        this.initTooltips();
    }

    setupEventListeners() {
        // Toggle do menu lateral
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleSidebar());
        }

        // Toggle dos submenus
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSubmenu(toggle);
            });
        });

        // Fechar menu ao clicar fora (mobile)
        document.addEventListener('click', (e) => {
            if (this.isMobile && !this.sidebar.contains(e.target) && !e.target.closest('.menu-toggle')) {
                this.hideSidebar();
            }
        });

        // Atualizar estado ao redimensionar a janela
        window.addEventListener('resize', () => this.handleResize());
    }

    checkInitialState() {
        // Verifica se está em mobile e esconde o menu
        if (this.isMobile) {
            this.hideSidebar();
        } else {
            this.showSidebar();
        }
    }

    toggleSidebar() {
        if (this.sidebar.classList.contains('show')) {
            this.hideSidebar();
        } else {
            this.showSidebar();
        }
    }

    showSidebar() {
        this.sidebar.classList.add('show');
        this.mainContent.classList.add('expand');
        
        // Adiciona overlay em telas móveis
        if (this.isMobile) {
            this.addOverlay();
        }
        
        // Atualiza o estado no localStorage
        localStorage.setItem('sidebarState', 'expanded');
    }

    hideSidebar() {
        this.sidebar.classList.remove('show');
        this.mainContent.classList.remove('expand');
        
        // Remove o overlay em telas móveis
        this.removeOverlay();
        
        // Atualiza o estado no localStorage
        localStorage.setItem('sidebarState', 'collapsed');
    }

    addOverlay() {
        // Remove overlay existente
        this.removeOverlay();
        
        // Cria o overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            display: block;
        `;
        
        // Fecha o menu ao clicar no overlay
        overlay.addEventListener('click', () => this.hideSidebar());
        
        // Adiciona o overlay ao body
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }

    removeOverlay() {
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    }

    toggleSubmenu(toggle) {
        const submenu = toggle.nextElementSibling;
        const isActive = toggle.parentElement.classList.contains('active');
        
        // Fecha todos os outros submenus do mesmo nível
        if (!isActive) {
            const parentMenu = toggle.closest('ul');
            if (parentMenu) {
                parentMenu.querySelectorAll('.active').forEach(item => {
                    if (item !== toggle.parentElement) {
                        item.classList.remove('active');
                        const otherSubmenu = item.querySelector('.submenu');
                        if (otherSubmenu) {
                            otherSubmenu.style.maxHeight = '0';
                        }
                    }
                });
            }
        }
        
        // Alterna o submenu atual
        toggle.parentElement.classList.toggle('active');
        
        if (submenu) {
            if (isActive) {
                submenu.style.maxHeight = '0';
            } else {
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
            }
        }
    }


    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 992;
        
        // Se a classe de dispositivo mudou
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                this.hideSidebar();
            } else {
                this.showSidebar();
            }
        }
    }
    
    setupRippleEffect() {
        // Adiciona o efeito de ripple nos botões
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn, .nav-link, .card, .ripple');
            
            if (button) {
                // Remove efeitos anteriores
                const existingRipple = button.querySelector('.ripple-effect');
                if (existingRipple) {
                    existingRipple.remove();
                }
                
                // Cria o efeito
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                
                // Define o tamanho do efeito
                const diameter = Math.max(button.clientWidth, button.clientHeight);
                const radius = diameter / 2;
                
                // Define as posições
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - radius;
                const y = e.clientY - rect.top - radius;
                
                // Aplica os estilos
                ripple.style.width = ripple.style.height = `${diameter}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                
                // Adiciona o efeito ao botão
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);
                
                // Remove o efeito após a animação
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });
    }
    
    initTooltips() {
        // Inicializa tooltips do Bootstrap
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Atualiza o item ativo no menu com base na URL
    updateActiveMenuItem() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        
        // Remove a classe ativa de todos os itens
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Adiciona a classe ativa ao item correspondente
        document.querySelectorAll(`.nav-link[href="${currentPath}"]`).forEach(link => {
            link.classList.add('active');
            
            // Se estiver em um submenu, expande o menu pai
            const parentMenu = link.closest('.submenu');
            if (parentMenu) {
                parentMenu.style.maxHeight = parentMenu.scrollHeight + 'px';
                const toggle = parentMenu.previousElementSibling;
                if (toggle) {
                    toggle.classList.add('active');
                }
            }
        });
    }
}

// Inicializa o gerenciador de menu quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const menuManager = new MenuManager();
    menuManager.updateActiveMenuItem();
    
    // Adiciona a classe de transição após o carregamento para evitar animações iniciais
    document.body.classList.add('page-transition');
});
