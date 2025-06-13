// Estado do aplicativo
let paymentStatus = 'pending'; // pending, processing, paid, failed
let paymentCheckInterval = null;
let allContacts = []; // Variável para armazenar os contatos extraídos
let selectedContacts = []; // Contatos selecionados para envio em massa
let currentPage = 1;
let itemsPerPage = 10;

// Formata data para exibição
function formatDate(dateString) {
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Gera um ID único
function generateId() {
    return 'list-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Salva o histórico no localStorage
function saveHistory() {
    localStorage.setItem('extractionHistory', JSON.stringify(history));
}

// Atualiza a exibição do histórico
function updateHistoryView() {
    const $historyList = $('#historyList');
    
    if (history.length === 0) {
        $historyList.html(`
            <tr>
                <td colspan="7" class="text-center p-4 text-muted">
                    <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                    Nenhuma extração no histórico
                </td>
            </tr>
        `);
        return;
    }
    
    let html = '';
    history.forEach(list => {
        const isSelected = selectedLists.has(list.id) ? 'table-active' : '';
        html += `
            <tr class="${isSelected}" data-list-id="${list.id}">
                <td>
                    <div class="form-check">
                        <input class="form-check-input list-checkbox" type="checkbox" 
                               value="${list.id}" ${isSelected ? 'checked' : ''}>
                    </div>
                </td>
                <td>${list.name || 'Sem nome'}</td>
                <td>${list.term || '-'}</td>
                <td>${list.city || '-'}</td>
                <td>${formatDate(list.date)}</td>
                <td>${list.contacts ? list.contacts.length : 0} contatos</td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary view-list" title="Visualizar">
                            <i class="far fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary edit-list" title="Editar">
                            <i class="far fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-list" title="Excluir">
                            <i class="far fa-trash-alt"></i>
                        </button>
                        <button class="btn btn-success send-list" title="Enviar mensagem">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    $historyList.html(html);
    updateBulkActionsButton();
}

// Atualiza o estado do botão de ações em lote
function updateBulkActionsButton() {
    const $bulkActionsBtn = $('#bulkActionsBtn');
    const selectedCount = selectedLists.size;
    
    if (selectedCount > 0) {
        $bulkActionsBtn.removeClass('btn-outline-primary').addClass('btn-primary')
            .html(`<i class="fas fa-tasks me-1"></i> Ações (${selectedCount})`)
            .prop('disabled', false);
    } else {
        $bulkActionsBtn.removeClass('btn-primary').addClass('btn-outline-primary')
            .html('<i class="fas fa-tasks me-1"></i> Ações em Lote')
            .prop('disabled', false);
    }
}

// Adiciona uma nova lista ao histórico
function addToHistory(listData) {
    const newList = {
        id: generateId(),
        name: listData.name || `Lista ${history.length + 1}`,
        term: listData.term,
        city: listData.city,
        date: new Date().toISOString(),
        contacts: listData.contacts || []
    };
    
    history.unshift(newList);
    saveHistory();
    updateHistoryView();
    return newList.id;
}

// Remove uma lista do histórico
function removeFromHistory(listId) {
    history = history.filter(list => list.id !== listId);
    selectedLists.delete(listId);
    saveHistory();
    updateHistoryView();
}

// Atualiza os dados de uma lista
function updateList(listId, newData) {
    const listIndex = history.findIndex(list => list.id === listId);
    if (listIndex !== -1) {
        history[listIndex] = { ...history[listIndex], ...newData };
        saveHistory();
        updateHistoryView();
        return true;
    }
    return false;
}

// Exporta lista para CSV
function exportToCSV(list) {
    if (!list.contacts || list.contacts.length === 0) {
        showToast('A lista selecionada está vazia.', 'warning');
        return;
    }
    
    const headers = ['Nome', 'Telefone', 'Endereço'];
    const rows = list.contacts.map(contact => [
        `"${contact.name || ''}"`,
        `"${contact.phone || ''}"`,
        `"${contact.address || ''}"`
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lista_${list.name || 'contatos'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Inicialização do aplicativo
$(document).ready(function() {
    // Initialize variables
    let currentPage = 1;
    const itemsPerPage = 10;
    let allContacts = [];
    let selectedContacts = [];

    // Gerenciar clique no botão de pagamento PIX
    $('#generatePixBtn').click(function() {
        // Gera um ID de transação único
        const transactionId = 'PIX' + Date.now();
        
        // Atualiza o QR Code e código PIX com o ID da transação
        const pixData = `00020126330014BR.GOV.BCB.PIX0111pix@empresa.com5204000053039865802BR5913Empresa LTDA6008BRASILIA62070503***6304${transactionId}`;
        $('#pixQrCode').attr('src', `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData)}`);
        $('#pixCode').val(pixData);
        
        // Mostra a seção de pagamento
        $('#paymentSection').addClass('d-none');
        $('#pixPaymentSection').removeClass('d-none');
        
        // Inicia a verificação do pagamento
        startPaymentCheck(transactionId);
    });
    
    // Copiar código PIX
    $('#copyPixCode').click(function() {
        const pixCode = document.getElementById('pixCode');
        pixCode.select();
        document.execCommand('copy');
        
        // Feedback visual
        const originalText = $(this).html();
        $(this).html('<i class="fas fa-check"></i> Copiado!');
        setTimeout(() => {
            $(this).html(originalText);
        }, 2000);
    });
    
    // Verificar pagamento manualmente
    $('#checkPaymentBtn').click(function() {
        checkPaymentStatus();
    });
    
    // Função para iniciar a verificação do pagamento
    function startPaymentCheck(transactionId) {
        // Limpa qualquer intervalo existente
        if (paymentCheckInterval) {
            clearInterval(paymentCheckInterval);
        }
        
        // Define o status como processando
        paymentStatus = 'processing';
        updatePaymentUI();
        
        // Verifica o status a cada 10 segundos
        paymentCheckInterval = setInterval(checkPaymentStatus, 10000);
    }
    
    // Função para verificar o status do pagamento
    function checkPaymentStatus() {
        // Em uma aplicação real, isso seria uma chamada AJAX para seu backend
        // que verificaria o status do PIX no seu provedor de pagamento
        
        // Simulação: 80% de chance de sucesso após 3 tentativas
        const attempts = $('#checkPaymentBtn').data('attempts') || 0;
        $('#checkPaymentBtn').data('attempts', attempts + 1);
        
        // Atualiza o botão de verificação
        const $btn = $('#checkPaymentBtn');
        const originalText = $btn.html();
        $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verificando...');
        
        // Simula atraso de rede
        setTimeout(() => {
            // Simula uma resposta do servidor
            const isPaid = attempts >= 2 && Math.random() < 0.8;
            
            if (isPaid) {
                paymentStatus = 'paid';
                clearInterval(paymentCheckInterval);
                showAlert('Pagamento confirmado com sucesso!', 'success');
                
                // Mostra o formulário de busca
                $('#pixPaymentSection').addClass('d-none');
                $('#searchSection').removeClass('d-none');
                
                // Executa a busca
                performSearch(() => {
                    // Adiciona a lista ao histórico após o pagamento confirmado
                    if (window.historyManager && allContacts.length > 0) {
                        window.historyManager.addExtraction(
                            $('#term').val().trim(),
                            $('#city').val().trim(),
                            allContacts
                        );
                    }
                });
                
                // Mostra o formulário de busca
                showSearchForm();
                
                // Rola até os resultados
                $('html, body').animate({
                    scrollTop: $('#resultsContainer').offset().top - 20
                }, 500);
            } else {
                $btn.prop('disabled', false).html(originalText);
                showAlert('Pagamento ainda não identificado. Tente novamente em alguns instantes.', 'warning');
            }
            
            updatePaymentUI();
        }, 1500);
    }
    
    // Atualiza a UI com base no status do pagamento
    function updatePaymentUI() {
        const $statusText = $('#paymentStatus');
        const $checkBtn = $('#checkPaymentBtn');
        
        switch(paymentStatus) {
            case 'processing':
                $statusText.html('<i class="fas fa-sync-alt fa-spin me-2"></i> Aguardando confirmação do pagamento...');
                $checkBtn.prop('disabled', false).html('<i class="fas fa-sync-alt me-2"></i> Verificar Pagamento');
                break;
            case 'paid':
                $statusText.html('<i class="fas fa-check-circle text-success me-2"></i> Pagamento confirmado!');
                $checkBtn.prop('disabled', true).html('<i class="fas fa-check me-2"></i> Pago');
                break;
            case 'failed':
                $statusText.html('<i class="fas fa-times-circle text-danger me-2"></i> Falha no pagamento');
                $checkBtn.prop('disabled', false).html('<i class="fas fa-sync-alt me-2"></i> Tentar novamente');
                break;
        }
    }
    
        // Mostra o formulário de busca e esconde a seção de pagamento
    function showSearchForm() {
        $('#paymentSection').addClass('d-none');
        $('#pixPaymentSection').addClass('d-none');
        $('#searchSection').removeClass('d-none');
    }
    
    // Mostra a seção de pagamento e esconde o formulário de busca
    function showPaymentForm() {
        $('#searchSection').addClass('d-none');
        $('#paymentSection').removeClass('d-none');
    }
    
    // Mostra notificação toast
    function showToast(message, type = 'info') {
        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
                </div>
            </div>
        
        updateBulkActionsButton();
    });
        // Mostra o toast
        toast.show();
        
        // Remove o toast do DOM após ser escondido
        toastElement.addEventListener('hidden.bs.toast', function() {
            $(this).remove();
        });
    }
    
    // Função para realizar a busca após o pagamento
    function performSearch(callback) {
        const city = $('#city').val().trim();
        const term = $('#term').val().trim();
        
        // Mostra o spinner de carregamento
        $('#loadingSpinner').show();
        $('#resultsContainer').hide();
        $('#pagination').hide();
        
        // Em uma aplicação real, isso seria uma chamada AJAX para o backend
        setTimeout(function() {
            // Simula resposta da API com dados mockados
            const mockResults = [];
            const resultCount = 10 + Math.floor(Math.random() * 15); // 10-25 resultados
            
            for (let i = 0; i < resultCount; i++) {
                mockResults.push({
                    name: term.charAt(0).toUpperCase() + term.slice(1) + ' ' + Math.floor(Math.random() * 1000),
                    phone: '11' + Math.floor(900000000 + Math.random() * 100000000),
                    address: city + ', ' + ['SP', 'RJ', 'MG', 'RS', 'PR'][Math.floor(Math.random() * 5)]
                });
            }
            
            allContacts = mockResults;
            currentPage = 1;
            
            // Chama o callback se fornecido
            if (typeof callback === 'function') {
                callback();
            }
            
            // Atualiza a exibição dos contatos
            displayContacts();
            
            // Esconde o spinner e mostra os resultados
            $('#loadingSpinner').hide();
            $('#resultsContainer').show();
            $('#pagination').show();
            
            // Rola até os resultados
            $('html, body').animate({
                scrollTop: $('#resultsContainer').offset().top - 20
            }, 500);
        }, 1500);
            currentPage = 1;
            displayContacts();
            
            // Hide loading spinner and show results
            $('#loadingSpinner').hide();
            $('#resultsContainer').show();
            $('#pagination').show();
            
            // Scroll to results
            $('html, body').animate({
                scrollTop: $('#resultsContainer').offset().top - 20
            }, 500);
            
        }, 1500);
    }
    
    // Manipulador de envio do formulário
    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        
        const city = $('#city').val().trim();
        const term = $('#term').val().trim();
        
        if (!city || !term) {
            showToast('Por favor, preencha todos os campos.', 'warning');
            return;
        }
        
        // Sempre mostra o formulário de pagamento antes de cada busca
        showPaymentForm();
        $('html, body').animate({
            scrollTop: $('#paymentSection').offset().top - 20
        }, 500);
    });
    
    // Função para exibir os contatos na página atual
    function displayContacts() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedContacts = allContacts.slice(startIndex, endIndex);
        
        const contactsHtml = paginatedContacts.map(function(contact) {
            const isSelected = selectedContacts.some(function(c) { return c.phone === contact.phone; });
            const initials = contact.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().substring(0, 2);
            
            return '
                <div class="contact-card" data-phone="' + contact.phone + '">
                    <div class="d-flex align-items-center">
                        <div class="contact-avatar me-3">' + initials + '</div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">' + contact.name + '</h6>
                                <div class="form-check">
                                    <input class="form-check-input contact-checkbox" type="checkbox" 
                                           data-phone="' + contact.phone + '" ' + (isSelected ? 'checked' : '') + '>
                                </div>
                            </div>
                            <p class="mb-1 text-muted">
                                <i class="fas fa-phone-alt me-1"></i> ' + formatPhone(contact.phone) + '
                            </p>
                            <p class="mb-0 text-muted small">
                                <i class="fas fa-map-marker-alt me-1"></i> ' + (contact.address || 'Endereço não disponível') + '
                            </p>
                        </div>
                    </div>
                </div>
            ';
        }).join('');
        
        $('#contactsList').html(contactsHtml || '<p class="text-muted text-center py-4">Nenhum contato encontrado</p>');
        
        // Atualiza a paginação
        renderPagination();
        
        // Mostra o botão de usar selecionados se houver contatos
        if (allContacts.length > 0) {
            $('#useSelectedBtn').show();
        } else {
            $('#useSelectedBtn').hide();
        }
    }
    
    // Função para renderizar a paginação
    function renderPagination() {
        const totalPages = Math.ceil(allContacts.length / itemsPerPage);
        
        if (totalPages <= 1) {
            $('#pagination').hide();
            return;
        }
        
        $('#pagination').show();
        
        let paginationHtml = '
            <li class="page-item ' + (currentPage === 1 ? 'disabled' : '') + '">
                <a class="page-link" href="#" data-page="' + (currentPage - 1) + '" aria-label="Anterior">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        ';
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += '
                <li class="page-item ' + (i === currentPage ? 'active' : '') + '">
                    <a class="page-link" href="#" data-page="' + i + '">' + i + '</a>
                </li>
            ';
        }
        
        paginationHtml += '
            <li class="page-item ' + (currentPage === totalPages ? 'disabled' : '') + '">
                <a class="page-link" href="#" data-page="' + (currentPage + 1) + '" aria-label="Próximo">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        ';
        
        $('#pagination').html(paginationHtml);
        
        // Adiciona evento de clique aos links de paginação
        $('.page-link').on('click', function(e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page >= 1 && page <= totalPages && page !== currentPage) {
                currentPage = page;
                displayContacts();
                $('html, body').animate({ scrollTop: $('#resultsContainer').offset().top - 20 }, 'fast');
            }
        });
    }
    
    // Formata número de telefone
    function formatPhone(phone) {
        // Formatação simples para demonstração
        // Em uma aplicação real, você pode querer usar uma biblioteca como libphonenumber-js
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phone;
    }
    
    // Manipulador de seleção de contatos
    function handleContactSelection() {
        const phone = $(this).data('phone');
        const contact = allContacts.find(function(c) { return c.phone === phone; });
        
        if (this.checked) {
            if (!selectedContacts.some(function(c) { return c.phone === phone; })) {
                selectedContacts.push(contact);
            }
        } else {
            selectedContacts = selectedContacts.filter(function(c) { return c.phone !== phone; });
        }
        
        updateSelectAllCheckbox();
    }
    
    // Atualiza o estado do checkbox "Selecionar Tudo"
    function updateSelectAllCheckbox() {
        const allChecked = $('.contact-checkbox:not(:checked)').length === 0;
        $('#selectAll').prop('checked', allChecked);
    }
    
    // Seleciona todos os contatos
    $('#selectAll').on('change', function() {
        const isChecked = this.checked;
        $('.contact-checkbox').prop('checked', isChecked).trigger('change');
    });
    
    // Delegação de eventos para checkboxes de contatos
    $(document).on('change', '.contact-checkbox', handleContactSelection);
    
    // Botão "Usar Selecionados"
    $('#useSelectedBtn').on('click', function() {
        if (selectedContacts.length === 0) {
            showToast('Selecione pelo menos um contato para continuar', 'warning');
            return;
        }
        
        // Armazena os contatos selecionados no sessionStorage para uso na página de mensagens em massa
        sessionStorage.setItem('selectedContacts', JSON.stringify(selectedContacts));
        
        // Redireciona para a página de mensagens em massa
        window.location.href = 'bulk-messages.html';
    });
    
    // Inicialização
    $(document).ready(function() {
        // Inicializa o gerenciador de histórico
        if (window.historyManager) {
            window.historyManager.renderHistory();
        }
    });
        }, 500);
    });
    
    // Function to render contacts in the current page
    function renderContacts() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedContacts = allContacts.slice(startIndex, endIndex);
        
        const contactsHtml = paginatedContacts.map(contact => {
            const isSelected = selectedContacts.some(c => c.phone === contact.phone);
            const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            
            return `
                <div class="contact-card" data-phone="${contact.phone}">
                    <div class="d-flex align-items-center">
                        <div class="contact-avatar me-3">${initials}</div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">${contact.name}</h6>
                                <div class="form-check">
                                    <input class="form-check-input contact-checkbox" type="checkbox" 
                                           data-phone="${contact.phone}" ${isSelected ? 'checked' : ''}>
                                </div>
                            </div>
                            <p class="mb-1 text-muted">
                                <i class="fas fa-phone-alt me-1"></i> ${formatPhone(contact.phone)}
                            </p>
                            <p class="mb-0 text-muted small">
                                <i class="fas fa-map-marker-alt me-1"></i> ${contact.address || 'Endereço não disponível'}
                            </p>
                            ${contact.email ? `
                                <p class="mb-0 text-muted small">
                                    <i class="fas fa-envelope me-1"></i> ${contact.email}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        $('#contactsList').html(contactsHtml || '<p class="text-muted text-center py-4">Nenhum contato encontrado</p>');
        
        // Attach event listeners to checkboxes
        $('.contact-checkbox').on('change', handleContactSelection);
    }
    
    // Handle contact selection
    function handleContactSelection() {
        const phone = $(this).data('phone');
        const contact = allContacts.find(c => c.phone === phone);
        
        if (this.checked) {
            if (!selectedContacts.some(c => c.phone === phone)) {
                selectedContacts.push(contact);
            }
        } else {
            selectedContacts = selectedContacts.filter(c => c.phone !== phone);
        }
        
        updateSelectAllCheckbox();
    }
    
    // Update "Select All" checkbox state
    function updateSelectAllCheckbox() {
        const allChecked = $('.contact-checkbox:not(:checked)').length === 0;
        $('#selectAll').prop('checked', allChecked);
    }
    
    // Select all contacts
    $('#selectAll').on('change', function() {
        const isChecked = this.checked;
        $('.contact-checkbox').prop('checked', isChecked).trigger('change');
    });
    
    // Render pagination
    function renderPagination() {
        const totalPages = Math.ceil(allContacts.length / itemsPerPage);
        
        if (totalPages <= 1) {
            $('#pagination').hide();
            return;
        }
        
        $('#pagination').show();
        
        let paginationHtml = `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Anterior">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        paginationHtml += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Próximo">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
        
        $('#pagination').html(paginationHtml);
        
        // Attach click event to pagination links
        $('.page-link').on('click', function(e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page >= 1 && page <= totalPages && page !== currentPage) {
                currentPage = page;
                renderContacts();
                renderPagination();
                $('html, body').animate({ scrollTop: $('#resultsContainer').offset().top - 20 }, 'fast');
            }
        });
    }
    
    // Format phone number
    function formatPhone(phone) {
        // Simple formatting for demonstration
        // In a real app, you might want to use a library like libphonenumber-js
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    }
    
    // Use selected contacts
    $('#useSelectedBtn').on('click', function() {
        if (selectedContacts.length === 0) {
            showToast('Selecione pelo menos um contato para continuar', 'warning');
            return;
        }
        
        // Store selected contacts in sessionStorage to use in the bulk messages page
        sessionStorage.setItem('selectedContacts', JSON.stringify(selectedContacts));
        
        // Redirect to bulk messages page
        window.location.href = 'bulk-messages.html';
    });
    
    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = `
            <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
                <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <strong class="me-auto">Notificação</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Fechar"></button>
                    </div>
                    <div class="toast-body bg-${type} text-white">
                        ${message}
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(toast);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
            $('.toast').remove();
        }, 5000);
    }
    
    // Simulate API call with mock data
    function simulateApiCall(city, term) {
        return new Promise((resolve) => {
            // Generate mock data
            const mockContacts = [];
            const businessTypes = [
                'Restaurante', 'Mecânica', 'Escola', 'Consultório', 'Loja',
                'Mercado', 'Padaria', 'Salão de Beleza', 'Oficina', 'Farmácia'
            ];
            
            const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Mariana', 'Lucas', 'Juliana'];
            const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues'];
            
            // Generate 50 random contacts
            for (let i = 1; i <= 50; i++) {
                const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
                
                mockContacts.push({
                    id: i,
                    name: `${businessType} ${firstName} ${lastName}`,
                    phone: `1199${Math.floor(1000000 + Math.random() * 9000000)}`,
                    email: Math.random() > 0.3 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com` : '',
                    address: `${city}, Rua ${businessType.split(' ')[0]} ${Math.floor(1 + Math.random() * 1000)}`,
                    businessType: businessType,
                    source: 'Google'
                });
            }
            
            // Simulate network delay
            setTimeout(() => {
                resolve(mockContacts);
            }, 1000);
        });
    }
});
