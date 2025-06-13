// Navbar scroll effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Form validation
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Basic validation
        if (!email || !password) {
            showAlert('Por favor, preencha todos os campos.', 'danger');
            return;
        }
        
        // Simulate API call
        showLoader(true);
        
        // Simulate API delay
        setTimeout(() => {
            showLoader(false);
            showAlert('Login realizado com sucesso! Redirecionando...', 'success');
            
            // Redirect to dashboard after successful login
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        }, 1500);
    });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsChecked = document.getElementById('termsCheck').checked;
        
        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            showAlert('Por favor, preencha todos os campos.', 'danger');
            return;
        }
        
        if (password !== confirmPassword) {
            showAlert('As senhas não coincidem.', 'danger');
            return;
        }
        
        if (password.length < 6) {
            showAlert('A senha deve ter pelo menos 6 caracteres.', 'danger');
            return;
        }
        
        if (!termsChecked) {
            showAlert('Você deve aceitar os termos de uso para continuar.', 'danger');
            return;
        }
        
        // Simulate API call
        showLoader(true);
        
        // Simulate API delay
        setTimeout(() => {
            showLoader(false);
            
            // Show success message
            const successHTML = `
                <div class="text-center">
                    <div class="mb-4">
                        <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                    </div>
                    <h4 class="mb-3">Cadastro realizado com sucesso!</h4>
                    <p class="mb-4">Enviamos um e-mail de confirmação para <strong>${email}</strong>. Por favor, verifique sua caixa de entrada.</p>
                    <button class="btn btn-primary" data-bs-dismiss="modal">Fechar</button>
                </div>
            `;
            
            // Replace form with success message
            signupForm.innerHTML = successHTML;
            
        }, 2000);
    });
}

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert alert before the form
    const form = document.querySelector('form');
    if (form) {
        form.parentNode.insertBefore(alertDiv, form);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
            alert.close();
        }, 5000);
    }
}

// Show/hide loader
function showLoader(show) {
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
        </div>
    `;
    
    if (show) {
        document.body.appendChild(loader);
    } else {
        const existingLoader = document.querySelector('.loader-overlay');
        if (existingLoader) {
            existingLoader.remove();
        }
    }
}

// Initialize tooltips
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Initialize popovers
const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
});

// Animation on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            element.classList.add('animate__animated', 'animate__fadeInUp');
        }
    });
}

// Run animation on load and scroll
window.addEventListener('load', animateOnScroll);
window.addEventListener('scroll', animateOnScroll);

// Back to top button
const backToTopButton = document.createElement('button');
backToTopButton.className = 'btn btn-primary btn-lg back-to-top';
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.setAttribute('aria-label', 'Voltar ao topo');
document.body.appendChild(backToTopButton);

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

// Initialize modals
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');

if (loginModal) {
    loginModal.addEventListener('hidden.bs.modal', function () {
        const form = loginModal.querySelector('form');
        if (form) form.reset();
    });
}

if (signupModal) {
    signupModal.addEventListener('hidden.bs.modal', function () {
        const form = signupModal.querySelector('form');
        if (form) form.reset();
        
        // Reset to form if user closed after success
        const successHTML = `
            <form id="signupForm">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="firstName" class="form-label">Nome</label>
                        <input type="text" class="form-control" id="firstName" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="lastName" class="form-label">Sobrenome</label>
                        <input type="text" class="form-control" id="lastName" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="signupEmail" class="form-label">E-mail</label>
                    <input type="email" class="form-control" id="signupEmail" required>
                </div>
                <div class="mb-3">
                    <label for="signupPassword" class="form-label">Senha</label>
                    <input type="password" class="form-control" id="signupPassword" required>
                </div>
                <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Confirme a Senha</label>
                    <input type="password" class="form-control" id="confirmPassword" required>
                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="termsCheck" required>
                    <label class="form-check-label" for="termsCheck">Eu concordo com os <a href="#" class="text-primary text-decoration-none">Termos de Uso</a> e <a href="#" class="text-primary text-decoration-none">Política de Privacidade</a></label>
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-3">Criar Conta</button>
                <div class="text-center">
                    <p class="mb-0">Já tem uma conta? <a href="#" class="text-primary text-decoration-none fw-bold" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal">Faça login</a></p>
                </div>
            </form>
            <div class="divider my-4">
                <span>ou cadastre-se com</span>
            </div>
            <div class="d-grid gap-2">
                <button class="btn btn-outline-secondary">
                    <i class="fab fa-google me-2"></i> Cadastrar com Google
                </button>
            </div>
        `;
        
        signupModal.querySelector('.modal-body').innerHTML = successHTML;
    });
}

// Add animation to pricing cards on hover
const pricingCards = document.querySelectorAll('.pricing-card');
pricingCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
        card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
    });
    
    card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('featured')) {
            card.style.transform = 'translateY(0)';
        } else {
            card.style.transform = 'scale(1.05)';
        }
        card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.03)';
    });
});

// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Add smooth scrolling to all links with hashes
document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    if (anchor.getAttribute('href').startsWith('#')) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Close mobile menu if open
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
                    bsCollapse.hide();
                }
                
                // Scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    }
});
