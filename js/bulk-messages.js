$(document).ready(function() {
    // Load selected contacts from sessionStorage if available
    function loadSelectedContacts() {
        const selectedContacts = sessionStorage.getItem('selectedContacts');
        if (selectedContacts) {
            try {
                const contacts = JSON.parse(selectedContacts);
                if (Array.isArray(contacts) && contacts.length > 0) {
                    // Add contacts to the contact list
                    const $contactList = $('#contactList');
                    contacts.forEach(contact => {
                        const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                        const phone = contact.phone.replace(/\D/g, '');
                        const formattedPhone = formatPhone(phone);
                        
                        const contactHtml = `
                            <div class="contact-item d-flex align-items-center p-2 border-bottom">
                                <div class="form-check me-3">
                                    <input class="form-check-input contact-checkbox" type="checkbox" 
                                           value="${phone}" id="contact-${phone}" checked>
                                </div>
                                <div class="contact-avatar me-3">${initials}</div>
                                <div class="flex-grow-1">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h6 class="mb-0">${contact.name}</h6>
                                    </div>
                                    <p class="mb-0 text-muted small">
                                        <i class="fas fa-phone-alt me-1"></i> ${formattedPhone}
                                    </p>
                                </div>
                            </div>
                        `;
                        
                        $contactList.prepend(contactHtml);
                    });
                    
                    // Update counters
                    updateSelectedCount();
                    updateSendButtonState();
                    
                    // Show success message
                    showToast(`Carregados ${contacts.length} contatos selecionados`, 'success');
                    
                    // Clear the stored contacts
                    sessionStorage.removeItem('selectedContacts');
                }
            } catch (error) {
                console.error('Error loading selected contacts:', error);
            }
        }
    }
    
    // Format phone number
    function formatPhone(phone) {
        // Simple formatting for demonstration
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    }
    
    // Initialize Select2 for better dropdowns
    $('.select2').select2({
        theme: 'bootstrap-5',
        width: '100%'
    });
    
    // Move the formatPhone function to the global scope
    window.formatPhone = function(phone) {
        // Simple formatting for demonstration
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    };

    // Initialize date and time pickers for scheduling
    const datePicker = flatpickr('#scheduleDate', {
        dateFormat: 'd/m/Y',
        locale: 'pt',
        minDate: 'today',
        disableMobile: true
    });

    const timePicker = flatpickr('#scheduleTime', {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true,
        minuteIncrement: 5,
        disableMobile: true
    });

    // Toggle schedule options
    $('#scheduleMessage').change(function() {
        if($(this).is(':checked')) {
            $('#scheduleOptions').slideDown();
            // Set default time to next hour
            const now = new Date();
            now.setHours(now.getHours() + 1, 0, 0, 0);
            datePicker.setDate(now);
            timePicker.setDate(now);
        } else {
            $('#scheduleOptions').slideUp();
        }
    });

    // Toggle batch sending options
    $('#enableBatchSending').change(function() {
        if($(this).is(':checked')) {
            $('#batchSendingOptions').slideDown();
        } else {
            $('#batchSendingOptions').slideUp();
        }
    });

    // Toggle AI media options when AI tab is active
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        if (e.target.id === 'ai-tab') {
            $('#aiMediaOptions').slideDown();
        } else {
            $('#aiMediaOptions').slideUp();
        }
    });

    // Handle instance selection
    $(document).on('click', '.select-instance', function() {
        const instanceId = $(this).data('instance-id');
        const instanceName = $(this).closest('tr').find('td:first').text();
        $('#whatsappInstance').val(instanceId);
        $('#whatsappInstance').trigger('change');
        $('#whatsappInstancesModal').modal('hide');
        showToast(`Instância "${instanceName}" selecionada com sucesso!`, 'success');
    });

    // Handle refresh instances button
    $('#refreshInstances').click(function() {
        const $btn = $(this);
        const $icon = $btn.find('i');
        
        $btn.prop('disabled', true);
        $icon.removeClass('fa-sync-alt').addClass('fa-spinner fa-spin');
        
        // Simulate API call to refresh instances
        setTimeout(function() {
            $btn.prop('disabled', false);
            $icon.removeClass('fa-spinner fa-spin').addClass('fa-sync-alt');
            showToast('Status das instâncias atualizado com sucesso!', 'success');
        }, 1500);
    });

    // Handle add new instance button
    $('#addNewInstance').click(function() {
        // Here you would typically open a modal to add a new instance
        showToast('Funcionalidade de adicionar nova instância em desenvolvimento', 'info');
    });

    // Handle media file for AI
    $('#mediaFileForAI').change(function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showToast('O arquivo é muito grande. Tamanho máximo permitido: 10MB', 'error');
            $(this).val('');
            return;
        }
        
        // Here you would typically upload the file and get a URL
        showToast('Mídia carregada com sucesso!', 'success');
    });
    
    // Helper function to show toast notifications
    function showToast(message, type = 'info') {
        const toast = `
            <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
                </div>
            </div>`;
            
        const $toast = $(toast);
        $('#toastContainer').append($toast);
        const bsToast = new bootstrap.Toast($toast[0]);
        bsToast.show();
        
        // Remove toast after it's hidden
        $toast.on('hidden.bs.toast', function() {
            $(this).remove();
        });
    }

    // Handle tab changes
    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        const target = $(e.target).data('bs-target');
        // Update UI based on active tab
        updatePreview();
    });

    // Handle message input
    $('#messageText').on('input', function() {
        updatePreview();
        updateCharCount();
    });

    // Handle variable insertion
    window.insertVariable = function(variable) {
        const editor = document.getElementById('messageText');
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        range.deleteContents();
        const textNode = document.createTextNode(variable);
        range.insertNode(textNode);
        
        // Move cursor after the inserted variable
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        updatePreview();
        updateCharCount();
    };

    // Update character count
    function updateCharCount() {
        const text = $('#messageText').text();
        $('#charCount').text(text.length);
    }


    // Update message preview
    function updatePreview() {
        let message = $('#messageText').html() || 'Sua mensagem aparecerá aqui...';
        $('#messagePreview').html(message);
    }

    // Handle media type selection
    $('input[name="mediaType"]').change(function() {
        const mediaType = $(this).attr('id').replace('Type', '');
        updateMediaPreview(mediaType);
    });

    // Handle media file selection
    $('#mediaFile').on('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const mediaType = $('input[name="mediaType"]:checked').attr('id').replace('Type', '');
        const reader = new FileReader();

        reader.onload = function(e) {
            const mediaUrl = e.target.result;
            window.currentMedia = {
                type: mediaType,
                file: file,
                url: mediaUrl
            };
            updateMediaPreview(mediaType, mediaUrl);
        };

        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            // For non-image files, we'll just show the file name
            updateMediaPreview(mediaType, file.name);
        }
    });

    // Update media preview
    function updateMediaPreview(type, source = '') {
        let previewHtml = '';
        
        if (!source) {
            previewHtml = '<p class="text-muted">Nenhuma mídia selecionada</p>';
        } else if (type === 'image') {
            previewHtml = `<img src="${source}" class="img-fluid" alt="Preview">`;
        } else if (type === 'video') {
            previewHtml = `
                <video controls class="w-100">
                    <source src="${source}" type="video/mp4">
                    Seu navegador não suporta o elemento de vídeo.
                </video>`;
        } else if (type === 'audio') {
            previewHtml = `
                <audio controls class="w-100">
                    <source src="${source}" type="audio/mp3">
                    Seu navegador não suporta o elemento de áudio.
                </audio>`;
        } else if (type === 'document') {
            previewHtml = `
                <div class="d-flex align-items-center">
                    <i class="fas fa-file-pdf fa-3x text-danger me-3"></i>
                    <div>
                        <p class="mb-0">${source.name || 'documento.pdf'}</p>
                        <small class="text-muted">${formatFileSize(source.size || 0)}</small>
                    </div>
                </div>`;
        }
        
        $('#mediaPreview').html(previewHtml);
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Handle contact selection
    $(document).on('change', '.contact-checkbox', function() {
        updateSelectedCount();
        updateSendButtonState();
    });

    // Select all contacts
    $('#selectAllContacts').change(function() {
        const isChecked = $(this).prop('checked');
        $('.contact-checkbox').prop('checked', isChecked).trigger('change');
    });

    // Clear selection
    $('#clearSelection').click(function(e) {
        e.preventDefault();
        $('.contact-checkbox').prop('checked', false).trigger('change');
        $('#selectAllContacts').prop('checked', false);
    });

    // Update selected contacts count
    function updateSelectedCount() {
        const count = $('.contact-checkbox:checked').length;
        $('#selectedCount').text(count);
        $('label[for="selectAllContacts"]').text(`Selecionar todos (${count})`);
    }

    // Update send button state based on selection
    function updateSendButtonState() {
        const hasRecipients = $('.contact-checkbox:checked').length > 0;
        const hasMessage = $('#messageText').text().trim().length > 0;
        $('#sendMessageBtn').prop('disabled', !(hasRecipients && hasMessage));
    }

    // Handle send message
    $('#sendMessageBtn').click(function() {
        // Validate form
        const instanceId = $('#whatsappInstance').val();
        if (!instanceId) {
            showToast('Selecione uma instância do WhatsApp para continuar', 'warning');
            return;
        }
        
        // Get message data
        const messageData = {
            instanceId: instanceId,
            message: $('#messageText').html(),
            isScheduled: $('#scheduleMessage').is(':checked'),
            scheduleDate: null,
            scheduleTime: null,
            useRecipientTimezone: $('#timezoneCheck').is(':checked'),
            batchSending: {
                enabled: $('#enableBatchSending').is(':checked'),
                batchSize: $('#batchSize').val(),
                batchInterval: $('#batchInterval').val(),
                startTime: $('#startTime').val(),
                endTime: $('#endTime').val()
            },
            media: null
        };
        
        // If scheduled, add schedule date and time
        if (messageData.isScheduled) {
            const dateStr = $('#scheduleDate').val();
            const timeStr = $('#scheduleTime').val();
            
            if (!dateStr || !timeStr) {
                showToast('Preencha a data e hora do agendamento', 'warning');
                return;
            }
            
            // Combine date and time
            const [day, month, year] = dateStr.split('/');
            const [hours, minutes] = timeStr.split(':');
            messageData.scheduleDate = new Date(year, month - 1, day, hours, minutes);
        }
        
        // Get selected contacts
        const recipients = [];
        $('.contact-checkbox:checked').each(function() {
            recipients.push($(this).val());
        });
        
        if (recipients.length === 0) {
            showToast('Selecione pelo menos um destinatário', 'warning');
            return;
        }
        
        // Show loading state
        const $btn = $(this);
        const originalText = $btn.html();
        $btn.prop('disabled', true).html(`
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Enviando...
        `);
        
        // Simulate API call
        setTimeout(function() {
            // Reset button
            $btn.prop('disabled', false).html(originalText);
            
            // Show success message
            const successMsg = messageData.isScheduled 
                ? `Mensagem agendada com sucesso para ${recipients.length} destinatários!`
                : `Mensagem enviada com sucesso para ${recipients.length} destinatários!`;
                
            showToast(successMsg, 'success');
            
            // Reset form if not in batch mode
            if (!messageData.batchSending.enabled) {
                $('#messageText').html('');
                $('.contact-checkbox:checked').prop('checked', false);
                updateSelectedCount();
                updateSendButtonState();
            }
        }, 2000);
        });

        const message = {
            subject: $('#messageSubject').val(),
            text: $('#messageText').html(),
            media: window.currentMedia || null,
            schedule: $('#scheduleCheck').prop('checked') ? $('#scheduleDatetime').val() : null,
            timezone: $('#timezoneCheck').prop('checked')
        };

        // Here you would typically send this data to your server
        console.log('Sending message:', message);
        console.log('To recipients:', recipients);
        
        // Show success message
        alert(`Mensagem programada para envio a ${recipients.length} contatos!`);
    });

    // Handle AI message generation
    $('#generateMessage').click(function() {
        const prompt = $('#aiPrompt').val().trim();
        if (!prompt) {
            alert('Por favor, descreva a mensagem que deseja gerar.');
            return;
        }


        // Show loading state
        const $btn = $(this);
        const originalText = $btn.html();
        $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Gerando...');

        // Simulate API call (replace with actual API call)
        setTimeout(() => {
            // This is a mock response - in a real app, you would call an AI API here
            const mockResponses = [
                `Olá {nome}, gostaríamos de compartilhar uma oferta especial para você!`,
                `Prezado(a) {nome}, temos novidades que podem te interessar.`,
                `Olá {nome}, tudo bem? Gostaríamos de manter você atualizado sobre nossos produtos.`
            ];
            const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
            
            // Set the generated message
            $('#messageText').html(response);
            updatePreview();
            updateCharCount();
            
            // Switch to text tab
            $('#text-tab').tab('show');
            
            // Reset button
            $btn.prop('disabled', false).html(originalText);
            
        }, 1500);
    });

    // Handle camera functionality
    let stream = null;
    
    $('#cameraModal').on('shown.bs.modal', function () {
        startCamera();
    });
    
    $('#cameraModal').on('hidden.bs.modal', function () {
        stopCamera();
    });
    
    $('#switchCamera').click(function() {
        stopCamera();
        startCamera({ facingMode: 'environment' });
    });
    
    function startCamera(constraints = { video: true }) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(mediaStream) {
                stream = mediaStream;
                const video = document.getElementById('cameraFeed');
                video.srcObject = mediaStream;
                video.play();
            })
            .catch(function(err) {
                console.error("Error accessing camera: ", err);
                alert('Não foi possível acessar a câmera. Por favor, verifique as permissões.');
            });
    }
    
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }
    
    $('#captureBtn').click(function() {
        const video = document.getElementById('cameraFeed');
        const canvas = document.getElementById('cameraCanvas');
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob(function(blob) {
            // Create a file from the blob
            const file = new File([blob], 'capture.png', { type: 'image/png' });
            
            // Set as current media
            window.currentMedia = {
                type: 'image',
                file: file,
                url: canvas.toDataURL('image/png')
            };
            
            // Update UI
            updateMediaPreview('image', window.currentMedia.url);
            
            // Close modal
            $('#cameraModal').modal('hide');
            
            // Switch to media tab
            $('#media-tab').tab('show');
            
        }, 'image/png');
    });

    // Handle CSV import
    $('#csvFile').on('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // In a real app, you would parse the CSV/Excel file here
        // and show column mapping options
        
        // For demo purposes, we'll just enable the import button
        $('#importCSVBtn').prop('disabled', false);
    });

    // Handle WhatsApp import
    $('#whatsappSession').change(function() {
        const sessionId = $(this).val();
        // In a real app, you would load groups for the selected session
    });

    // Initialize
    updatePreview();
    updateCharCount();
    
    // Check for selected contacts from the extraction page
    const selectedContacts = sessionStorage.getItem('selectedContacts');
    if (selectedContacts) {
        try {
            const contacts = JSON.parse(selectedContacts);
            handleExtractedContacts(contacts);
            // Clear the stored contacts
            sessionStorage.removeItem('selectedContacts');
        } catch (error) {
            console.error('Error loading selected contacts:', error);
        }
    }
});

// Function to handle contact selection from the extraction page
function handleExtractedContacts(contacts) {
    if (Array.isArray(contacts) && contacts.length > 0) {
        const $contactList = $('#contactList');
        contacts.forEach(contact => {
            const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            const phone = contact.phone.replace(/\D/g, '');
            const formattedPhone = window.formatPhone(phone);
            
            // Check if contact already exists
            if ($(`#contact-${phone}`).length === 0) {
                const contactHtml = `
                    <div class="contact-item d-flex align-items-center p-2 border-bottom">
                        <div class="form-check me-3">
                            <input class="form-check-input contact-checkbox" type="checkbox" 
                                   value="${phone}" id="contact-${phone}" checked>
                        </div>
                        <div class="contact-avatar me-3">${initials}</div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">${contact.name}</h6>
                            </div>
                            <p class="mb-0 text-muted small">
                                <i class="fas fa-phone-alt me-1"></i> ${formattedPhone}
                            </p>
                        </div>
                    </div>
                `;
                
                $contactList.prepend(contactHtml);
            }
        });
        
        // Update counters
        updateSelectedCount();
        updateSendButtonState();
        
        // Show success message
        showToast(`Carregados ${contacts.length} contatos selecionados`, 'success');
    }
}
