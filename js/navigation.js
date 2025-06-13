// Função para destacar o item de menu ativo
document.addEventListener('DOMContentLoaded', function() {
    // Obtém o caminho atual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Remove a classe 'active' de todos os itens do menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Adiciona a classe 'active' ao item de menu correspondente à página atual
    const menuItem = document.getElementById(`menu-${currentPage.replace('.html', '').toLowerCase()}`);
    if (menuItem) {
        menuItem.classList.add('active');
        
        // Se for um submenu, marca o item pai como ativo também
        const parentMenu = menuItem.closest('.submenu');
        if (parentMenu) {
            const parentLink = parentMenu.previousElementSibling;
            if (parentLink && parentLink.classList.contains('dropdown-toggle')) {
                parentLink.classList.add('active');
                // Garante que o submenu esteja visível
                parentMenu.classList.add('show');
                parentLink.setAttribute('aria-expanded', 'true');
            }
        }
    }
    
    // Inicialização do menu responsivo
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', document.body.classList.contains('sidebar-collapsed'));
        });
    }
    
    // Verificar estado do menu ao carregar a página
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        document.body.classList.add('sidebar-collapsed');
    }
    
    // Fechar submenus ao clicar em um item do menu
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const submenu = this.nextElementSibling;
            submenu.classList.toggle('show');
            this.setAttribute('aria-expanded', 
                this.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
        });
    });
});
