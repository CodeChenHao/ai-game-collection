class RegisterSystem {
    constructor() {
        this.captchaCode = '';
        this.captchaCanvas = document.getElementById('captchaCanvas');
        this.captchaCtx = this.captchaCanvas.getContext('2d');
        this.registerForm = document.getElementById('registerForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.captchaInput = document.getElementById('captcha');
        this.registerBtn = document.querySelector('.login-btn');
        
        this.init();
    }
    
    init() {
        this.generateCaptcha();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.registerForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.captchaCanvas.addEventListener('click', () => this.generateCaptcha());
        this.emailInput.addEventListener('input', () => this.validateForm());
        this.passwordInput.addEventListener('input', () => this.validateForm());
        this.confirmPasswordInput.addEventListener('input', () => this.validateForm());
        this.captchaInput.addEventListener('input', () => this.validateForm());
        document.getElementById('agreement').addEventListener('change', () => this.validateForm());
    }
    
    generateCaptcha() {
        const canvas = this.captchaCanvas;
        const ctx = this.captchaCtx;
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, this.getRandomColor(200, 255));
        gradient.addColorStop(1, this.getRandomColor(200, 255));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.strokeStyle = this.getRandomColor(100, 200);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * width,
                Math.random() * height,
                1,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = this.getRandomColor(100, 200);
            ctx.fill();
        }
        
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        this.captchaCode = '';
        for (let i = 0; i < 4; i++) {
            this.captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        ctx.font = 'bold 24px Arial';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        
        for (let i = 0; i < this.captchaCode.length; i++) {
            const x = (width / 4) * i + (width / 8);
            const y = height / 2;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.random() - 0.5) * 0.4);
            ctx.fillStyle = this.getRandomColor(50, 150);
            ctx.fillText(this.captchaCode[i], 0, 0);
            ctx.restore();
        }
    }
    
    getRandomColor(min, max) {
        const r = Math.floor(Math.random() * (max - min) + min);
        const g = Math.floor(Math.random() * (max - min) + min);
        const b = Math.floor(Math.random() * (max - min) + min);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    validateForm() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value.trim();
        const confirmPassword = this.confirmPasswordInput.value.trim();
        const captcha = this.captchaInput.value.trim();
        const agreement = document.getElementById('agreement').checked;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(email);
        
        const isValid = isValidEmail && 
                        password.length > 0 && 
                        confirmPassword.length > 0 && 
                        captcha.length > 0 && 
                        agreement;
        this.registerBtn.disabled = !isValid;
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value.trim();
        const confirmPassword = this.confirmPasswordInput.value.trim();
        const captcha = this.captchaInput.value.trim();
        const agreement = document.getElementById('agreement').checked;
        
        if (!email || !password || !confirmPassword || !captcha) {
            this.showToast('请填写所有字段', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showToast('请输入有效的邮箱地址', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showToast('密码至少需要6个字符', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showToast('两次输入的密码不一致', 'error');
            return;
        }
        
        if (!agreement) {
            this.showToast('请阅读并同意用户协议', 'error');
            return;
        }
        
        if (captcha.toUpperCase() !== this.captchaCode) {
            this.showToast('验证码错误，请重新输入', 'error');
            this.generateCaptcha();
            this.captchaInput.value = '';
            return;
        }
        
        this.registerBtn.classList.add('loading');
        this.registerBtn.disabled = true;
        
        setTimeout(() => {
            this.performRegister(email, password);
        }, 1500);
    }
    
    performRegister(email, password) {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        const userExists = existingUsers.some(u => u.email === email);
        
        if (userExists) {
            this.showToast('邮箱已被注册', 'error');
            this.generateCaptcha();
            this.captchaInput.value = '';
        } else {
            const newUser = {
                email: email,
                password: password,
                registerTime: new Date().toISOString()
            };
            
            existingUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(existingUsers));
            
            this.showToast('注册成功！正在跳转到登录页面...', 'success');
            
            setTimeout(() => {
                window.location.href = '../login/login.html';
            }, 1500);
        }
        
        this.registerBtn.classList.remove('loading');
        this.registerBtn.disabled = false;
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = passwordInput.nextElementSibling;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈️';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

function toggleConfirmPassword() {
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const toggleBtn = confirmPasswordInput.nextElementSibling;
    
    if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        toggleBtn.textContent = '🙈️';
    } else {
        confirmPasswordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

function generateCaptcha() {
    if (window.registerSystem) {
        window.registerSystem.generateCaptcha();
    }
}

function openAgreementModal(event) {
    event.preventDefault();
    const modal = document.getElementById('agreementModal');
    modal.style.display = 'flex';
}

function closeAgreementModal() {
    const modal = document.getElementById('agreementModal');
    modal.style.display = 'none';
    
    const agreementCheckbox = document.getElementById('agreement');
    agreementCheckbox.checked = true;
    
    window.registerSystem.validateForm();
}

document.addEventListener('DOMContentLoaded', () => {
    window.registerSystem = new RegisterSystem();
});
