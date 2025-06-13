// Gerenciador de Histórico de Extrações
class HistoryManager {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('extractionHistory') || '[]');
        this.selectedLists = new Set();
        this.currentListId = null;
        this.initializeEvents();
    }

    // Inicializa os eventos
    initializeEvents() {
        // Toggle do histórico
        $('#toggleHistoryBtn').click(() => this.toggleHistory());
        
        // Seleção de listas
        $(document).on('change', '.list-checkbox, #selectAllLists', (e) => this.handleListSelection(e));
        
        // Ações em lote
        $('#bulkActionsBtn').click((e) => this.showBulkActionsMenu(e));
        
        // Fecha o menu de ações ao clicar fora
        $(document).click((e) => this.closeBulkActionsMenu(e));
        
        // Visualizar lista
        $(document).on('click', '.view-list', (e) => this.viewList(e));
        
        // Editar lista
        $(document).on('click', '.edit-list', (e) => this.editList(e));
        
        // Excluir lista
        $(document).on('click', '.delete-list', (e) => this.confirmDeleteList(e));
        
        // Enviar mensagem para lista
        $(document).on('click', '.send-list', (e) => this.sendListToBulk(e));
        
        // Salvar alterações
        $('#saveListChanges').click(() => this.saveListChanges());
        
        // Confirmar exclusão
        $('#confirmDeleteBtn').click(() => this.confirmDeleteAction());
        
        // Ações em lote
        $('#viewSelectedLists').click((e) => this.viewSelectedLists(e));
        $('#exportSelectedLists').click((e) => this.exportSelectedLists(e));
        $('#deleteSelectedLists').click((e) => this.deleteSelectedLists(e));
        $('#sendBulkMessage').click((e) => this.sendSelectedToBulk(e));
    }
    
    // Alterna a visibilidade do histórico
    toggleHistory() {
        $('#historyListContainer').toggleClass('d-none');
        $('#toggleHistoryBtn i').toggleClass('fa-chevron-down fa-chevron-up');
    }
    
    // Manipula a seleção de listas
    handleListSelection(e) {
        const $checkbox = $(e.target);
        
        if (e.target.id === 'selectAllLists') {
            const isChecked = $checkbox.prop('checked');
            $('.list-checkbox').prop('checked', isChecked).trigger('change');
            return;
        }
        
        const listId = $checkbox.val();
        
        if ($checkbox.prop('checked')) {
            this.selectedLists.add(listId);
            $checkbox.closest('tr').addClass('table-active');
        } else {
            this.selectedLists.delete(listId);
            $checkbox.closest('tr').removeClass('table-active');
            $('#selectAllLists').prop('checked', false);
        }
        
        this.updateBulkActionsButton();
    }
    
    // Atualiza o botão de ações em lote
    updateBulkActionsButton() {
        const $bulkActionsBtn = $('#bulkActionsBtn');
        const selectedCount = this.selectedLists.size;
        
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
    
    // Mostra o menu de ações em lote
    showBulkActionsMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $menu = $('#bulkActionsMenu');
        const rect = e.target.getBoundingClientRect();
        
        $menu.css({
            position: 'fixed',
            top: rect.bottom + window.scrollY + 'px',
            left: rect.left + 'px',
            display: 'block'
        });
    }
    
    // Fecha o menu de ações em lote
    closeBulkActionsMenu(e) {
        if (!$(e.target).closest('#bulkActionsBtn, #bulkActionsMenu').length) {
            $('#bulkActionsMenu').hide();
        }
    }
    
    // Visualiza uma lista
    viewList(e) {
        const listId = $(e.currentTarget).closest('tr').data('list-id');
        const list = this.history.find(item => item.id === listId);
        
        if (!list) return;
        
        $('#viewListTitle').text(list.name || 'Sem nome');
        
        const $content = $('#viewListContent');
        $content.empty();
        
        if (list.contacts && list.contacts.length > 0) {
            list.contacts.forEach(contact => {
                $content.append(`
                    <tr>
                        <td>${contact.name || '-'}</td>
                        <td>${contact.phone || '-'}</td>
                        <td>${contact.address || '-'}</td>
                    </tr>
                `);
            });
        } else {
            $content.html('<tr><td colspan="3" class="text-center text-muted">Nenhum contato encontrado</td></tr>');
        }
        
        this.currentListId = listId;
        
        // Configura o botão de exportar
        $('#exportListBtn').off('click').on('click', () => this.exportList(list));
        
        const modal = new bootstrap.Modal(document.getElementById('viewListModal'));
        modal.show();
    }
    
    // Edita uma lista
    editList(e) {
        const listId = $(e.currentTarget).closest('tr').data('list-id');
        const list = this.history.find(item => item.id === listId);
        
        if (!list) return;
        
        this.currentListId = listId;
        
        $('#listName').val(list.name || '');
        $('#listSearchTerm').val(list.term || '');
        $('#listCity').val(list.city || '');
        
        const modal = new bootstrap.Modal(document.getElementById('editListModal'));
        modal.show();
    }
    
    // Salva as alterações em uma lista
    saveListChanges() {
        const name = $('#listName').val().trim();
        const term = $('#listSearchTerm').val().trim();
        const city = $('#listCity').val().trim();
        
        if (!name || !term || !city) {
            showToast('Por favor, preencha todos os campos.', 'warning');
            return;
        }
        
        const listIndex = this.history.findIndex(item => item.id === this.currentListId);
        if (listIndex !== -1) {
            this.history[listIndex] = {
                ...this.history[listIndex],
                name,
                term,
                city,
                updatedAt: new Date().toISOString()
            };
            
            this.saveHistory();
            showToast('Lista atualizada com sucesso!', 'success');
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('editListModal'));
            modal.hide();
        } else {
            showToast('Erro ao atualizar a lista.', 'danger');
        }
    }
    
    // Confirma a exclusão de uma lista
    confirmDeleteList(e) {
        const listId = $(e.currentTarget).closest('tr').data('list-id');
        const list = this.history.find(item => item.id === listId);
        
        if (!list) return;
        
        this.currentListId = listId;
        $('#deleteListName').text(list.name || 'Lista sem nome');
        
        const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
        modal.show();
    }
    
    // Confirma a ação de exclusão
    confirmDeleteAction() {
        this.history = this.history.filter(item => item.id !== this.currentListId);
        this.selectedLists.delete(this.currentListId);
        this.saveHistory();
        
        showToast('Lista removida com sucesso!', 'success');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        modal.hide();
    }
    
    // Exporta uma lista para CSV
    exportList(list) {
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
    
    // Visualiza listas selecionadas
    viewSelectedLists(e) {
        e.preventDefault();
        
        if (this.selectedLists.size === 0) {
            showToast('Selecione pelo menos uma lista para visualizar.', 'warning');
            return;
        }
        
        // Implemente a visualização de múltiplas listas aqui
        showToast(`${this.selectedLists.size} listas selecionadas para visualização.`, 'info');
    }
    
    // Exporta listas selecionadas
    exportSelectedLists(e) {
        e.preventDefault();
        
        if (this.selectedLists.size === 0) {
            showToast('Selecione pelo menos uma lista para exportar.', 'warning');
            return;
        }
        
        Array.from(this.selectedLists).forEach(listId => {
            const list = this.history.find(item => item.id === listId);
            if (list) this.exportList(list);
        });
        
        showToast(`${this.selectedLists.size} listas exportadas.`, 'success');
    }
    
    // Exclui listas selecionadas
    deleteSelectedLists(e) {
        e.preventDefault();
        
        if (this.selectedLists.size === 0) {
            showToast('Selecione pelo menos uma lista para excluir.', 'warning');
            return;
        }
        
        if (!confirm(`Tem certeza que deseja excluir ${this.selectedLists.size} listas selecionadas?`)) {
            return;
        }
        
        const count = this.selectedLists.size;
        this.history = this.history.filter(item => !this.selectedLists.has(item.id));
        this.selectedLists.clear();
        this.saveHistory();
        
        showToast(`${count} listas removidas.`, 'success');
    }
    
    // Envia lista para mensagens em massa
    sendListToBulk(e) {
        e.preventDefault();
        
        const listId = $(e.currentTarget).closest('tr').data('list-id');
        const list = this.history.find(item => item.id === listId);
        
        if (!list || !list.contacts || list.contacts.length === 0) {
            showToast('A lista selecionada está vazia.', 'warning');
            return;
        }
        
        this.sendToBulk([list]);
    }
    
    // Envia listas selecionadas para mensagens em massa
    sendSelectedToBulk(e) {
        e?.preventDefault();
        
        if (this.selectedLists.size === 0) {
            showToast('Selecione pelo menos uma lista para enviar mensagem.', 'warning');
            return;
        }
        
        const lists = this.history.filter(item => this.selectedLists.has(item.id));
        this.sendToBulk(lists);
    }
    
    // Envia para a página de mensagens em massa
    sendToBulk(lists) {
        const contacts = [];
        
        lists.forEach(list => {
            if (list.contacts && list.contacts.length > 0) {
                contacts.push(...list.contacts.map(contact => ({
                    ...contact,
                    listName: list.name
                })));
            }
        });
        
        if (contacts.length === 0) {
            showToast('Nenhum contato encontrado nas listas selecionadas.', 'warning');
            return;
        }
        
        // Salva os contatos no sessionStorage para uso na página de mensagens em massa
        sessionStorage.setItem('selectedContacts', JSON.stringify(contacts));
        
        // Redireciona para a página de mensagens em massa
        window.location.href = 'bulk-messages.html';
    }
    
    // Adiciona uma nova extração ao histórico
    addExtraction(searchTerm, city, contacts) {
        const newList = {
            id: 'ext-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: `${searchTerm} - ${city}`,
            term: searchTerm,
            city: city,
            date: new Date().toISOString(),
            contacts: contacts.map(contact => ({
                name: contact.name,
                phone: contact.phone,
                address: contact.address || ''
            }))
        };
        
        this.history.unshift(newList);
        this.saveHistory();
        return newList.id;
    }
    
    // Salva o histórico no localStorage
    saveHistory() {
        localStorage.setItem('extractionHistory', JSON.stringify(this.history));
        this.renderHistory();
    }
    
    // Renderiza o histórico na interface
    renderHistory() {
        const $historyList = $('#historyList');
        
        if (this.history.length === 0) {
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
        this.history.forEach(list => {
            const isSelected = this.selectedLists.has(list.id) ? 'table-active' : '';
            const date = new Date(list.date);
            const formattedDate = date.toLocaleDateString('pt-BR');
            const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
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
                    <td>${formattedDate}<br><small class="text-muted">${formattedTime}</small></td>
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
        this.updateBulkActionsButton();
    }
}

// Inicializa o gerenciador de histórico quando o documento estiver pronto
$(document).ready(function() {
    window.historyManager = new HistoryManager();
    window.historyManager.renderHistory();
});
