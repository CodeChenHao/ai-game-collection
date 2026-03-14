class ForgotPasswordSystem {
    constructor() {
        this.captchaCode = '';
        this.captchaCanvas = document.getElementById('captchaCanvas');
        this.captchaCtx = this.captchaCanvas.getContext('2d');
        this.forgotPasswordForm = document.getElementById('forgotPasswordForm');
        this.emailInput = document.getElementById('email');
        this.captchaInput = document.getElementById('captcha');
        this.submitBtn = document.querySelector('.login-btn');
        
        this.init();
    }
    
    init() {
        this.generateCaptcha();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.forgotPasswordForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.captchaCanvas.addEventListener('click', () => this.generateCaptcha());
        this.emailInput.addEventListener('input', () => this.validateForm());
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
        const captcha = this.captchaInput.value.trim();
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(email);
        
        const isValid = isValidEmail && captcha.length > 0;
        this.submitBtn.disabled = !isValid;
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        const captcha = this.captchaInput.value.trim();
        
        if (!email || !captcha) {
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
        
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;
        
        setTimeout(() => {
            this.performForgotPassword(email);
        }, 1500);
    }
    
    performForgotPassword(email) {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        const user = existingUsers.find(u => u.email === email);
        
        if (!user) {
            this.showToast('邮箱未注册', 'error');
            this.generateCaptcha();
            this.captchaInput.value = '';
        } else {
            this.showToast('重置链接已发送到您的邮箱', 'success');
            
            setTimeout(() => {
                window.location.href = '../login/login.html';
            }, 2000);
        }
        
        this.submitBtn.classList.remove('loading');
        this.submitBtn.disabled = false;
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

function generateCaptcha() {
    if (window.forgotPasswordSystem) {
        window.forgotPasswordSystem.generateCaptcha();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.forgotPasswordSystem = new ForgotPasswordSystem();
});
