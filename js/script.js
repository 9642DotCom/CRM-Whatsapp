$(document).ready(function () {
    // Toggle sidebar
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar, #content').toggleClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });

    // Close sidebar when clicking on a nav item on mobile
    $('.nav-item').on('click', function(){
        if($(window).width() < 768) {
            $('.navbar-toggler').click();
        }
    });

    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();

    // Update time ago
    function updateTimeAgo() {
        $('.time-ago').each(function() {
            const date = $(this).data('time');
            $(this).text(timeSince(new Date(date)) + ' atrás');
        });
    }


    // Initialize time ago
    updateTimeAgo();
    setInterval(updateTimeAgo, 60000);
});

// Helper function to format time since
function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + ' ano' + (interval === 1 ? '' : 's');
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + ' mês' + (interval === 1 ? '' : 'es');
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + ' dia' + (interval === 1 ? '' : 's');
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + ' hora' + (interval === 1 ? '' : 's');
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + ' minuto' + (interval === 1 ? '' : 's');
    }
    
    return 'agora mesmo';
}

// Notification system
function showNotification(type, message) {
    const alert = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    
    $('#notifications').append(alert);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        $('.alert').fadeOut('slow', function() {
            $(this).remove();
        });
    }, 5000);
}

// Initialize charts
function initCharts() {
    // Sales Funnel Chart
    const salesFunnelCtx = document.getElementById('salesFunnelChart');
    if (salesFunnelCtx) {
        new Chart(salesFunnelCtx, {
            type: 'bar',
            data: {
                labels: ['Leads', 'Contatos Iniciais', 'Apresentação', 'Proposta', 'Fechamento'],
                datasets: [{
                    label: 'Clientes',
                    data: [100, 70, 50, 30, 15],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Messages Chart
    const messagesCtx = document.getElementById('messagesChart');
    if (messagesCtx) {
        new Chart(messagesCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Mensagens Recebidas',
                    data: [1200, 1900, 1500, 2500, 2200, 3000, 2800],
                    backgroundColor: 'rgba(37, 211, 102, 0.1)',
                    borderColor: 'rgba(37, 211, 102, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }, {
                    label: 'Mensagens Enviadas',
                    data: [1000, 1700, 1300, 2000, 2000, 2800, 2500],
                    backgroundColor: 'rgba(18, 140, 126, 0.1)',
                    borderColor: 'rgba(18, 140, 126, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Initialize charts when document is ready
$(document).ready(function() {
    // Load Chart.js if not already loaded
    if (typeof Chart !== 'undefined') {
        initCharts();
    } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = initCharts;
        document.head.appendChild(script);
    }
});
