class LoginSystem {
    constructor() {
        this.captchaCode = '';
        this.captchaCanvas = document.getElementById('captchaCanvas');
        this.captchaCtx = this.captchaCanvas.getContext('2d');
        this.loginForm = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.captchaInput = document.getElementById('captcha');
        this.loginBtn = document.querySelector('.login-btn');
        
        this.init();
    }
    
    init() {
        this.generateCaptcha();
        this.setupEventListeners();
        this.loadRememberedUser();
    }
    
    setupEventListeners() {
        this.loginForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.captchaCanvas.addEventListener('click', () => this.generateCaptcha());
        this.emailInput.addEventListener('input', () => this.validateForm());
        this.passwordInput.addEventListener('input', () => this.validateForm());
        this.captchaInput.addEventListener('input', () => this.validateForm());
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
        const captcha = this.captchaInput.value.trim();
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(email);
        
        const isValid = isValidEmail && password.length > 0 && captcha.length > 0;
        this.loginBtn.disabled = !isValid;
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value.trim();
        const captcha = this.captchaInput.value.trim();
        const remember = document.getElementById('remember').checked;
        
        if (!email || !password || !captcha) {
            this.showToast('请填写所有字段', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showToast('请输入有效的邮箱地址', 'error');
            return;
        }
        
        if (captcha.toUpperCase() !== this.captchaCode) {
            this.showToast('验证码错误，请重新输入', 'error');
            this.generateCaptcha();
            this.captchaInput.value = '';
            return;
        }
        
        this.loginBtn.classList.add('loading');
        this.loginBtn.disabled = true;
        
        setTimeout(() => {
            this.performLogin(email, password, remember);
        }, 1500);
    }
    
    performLogin(email, password, remember) {
        const mockUsers = [
            { email: 'admin@example.com', password: '123456' },
            { email: 'user@example.com', password: '123456' }
        ];
        
        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            if (remember) {
                localStorage.setItem('rememberedUser', email);
            } else {
                localStorage.removeItem('rememberedUser');
            }
            
            localStorage.setItem('currentUser', JSON.stringify({
                email: user.email,
                loginTime: new Date().toISOString()
            }));
            
            this.showToast('登录成功！', 'success');
            
            setTimeout(() => {
                window.location.href = '../home/home.html';
            }, 1000);
        } else {
            this.showToast('邮箱或密码错误', 'error');
            this.generateCaptcha();
            this.captchaInput.value = '';
        }
        
        this.loginBtn.classList.remove('loading');
        this.loginBtn.disabled = false;
    }
    
    loadRememberedUser() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            this.emailInput.value = rememberedUser;
            document.getElementById('remember').checked = true;
        }
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
    const toggleBtn = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈️';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

function generateCaptcha() {
    if (window.loginSystem) {
        window.loginSystem.generateCaptcha();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
});
