document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');
    
    // رمز سایت اصلی
    const SITE_SECRET_KEY = '123654';
    const ADMIN_USERNAME = 'manager';
    const ADMIN_PASSWORD = '13899831';
    const ADMIN_SITE_KEY = '123456789';
    
    // ذخیره کاربران در localStorage اگر وجود ندارد
    if (!localStorage.getItem('chatUsers')) {
        localStorage.setItem('chatUsers', JSON.stringify([]));
    }
    
    // ذخیره پیام‌ها در localStorage اگر وجود ندارد
    if (!localStorage.getItem('chatMessages')) {
        localStorage.setItem('chatMessages', JSON.stringify([]));
    }
    
    // ذخیره گزارشات در localStorage اگر وجود ندارد
    if (!localStorage.getItem('chatReports')) {
        localStorage.setItem('chatReports', JSON.stringify([]));
    }
    
    // ذخیره کاربران بلاک شده در localStorage اگر وجود ندارد
    if (!localStorage.getItem('blockedUsers')) {
        localStorage.setItem('blockedUsers', JSON.stringify([]));
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const siteKey = document.getElementById('siteKey').value;
        
        // اعتبارسنجی ورودی‌ها
        if (!username || !password || !siteKey) {
            showError('لطفاً تمام فیلدها را پر کنید');
            return;
        }
        
        // بررسی رمز سایت
        if (username === ADMIN_USERNAME && siteKey === ADMIN_SITE_KEY) {
            // ورود به عنوان مدیر
            if (password === ADMIN_PASSWORD) {
                localStorage.setItem('currentUser', JSON.stringify({
                    username: ADMIN_USERNAME,
                    isAdmin: true
                }));
                window.location.href = 'admin.html';
                return;
            } else {
                showError('رمز عبور مدیر اشتباه است');
                return;
            }
        }
        
        // بررسی رمز سایت برای کاربران عادی
        if (siteKey !== SITE_SECRET_KEY) {
            showError('رمز سایت نامعتبر است');
            return;
        }
        
        // بررسی کاربر موجود
        const users = JSON.parse(localStorage.getItem('chatUsers'));
        const existingUser = users.find(u => u.username === username);
        
        if (existingUser) {
            // کاربر موجود - بررسی رمز عبور
            if (existingUser.password !== password) {
                showError('رمز عبور اشتباه است');
                return;
            }
        } else {
            // کاربر جدید - ثبت نام
            users.push({
                username,
                password,
                joinDate: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                reports: 0
            });
            localStorage.setItem('chatUsers', JSON.stringify(users));
        }
        
        // ذخیره کاربر فعلی و انتقال به صفحه چت
        localStorage.setItem('currentUser', JSON.stringify({
            username,
            isAdmin: false
        }));
        
        // به روزرسانی آخرین ورود
        if (existingUser) {
            existingUser.lastLogin = new Date().toISOString();
            localStorage.setItem('chatUsers', JSON.stringify(users));
        }
        
        window.location.href = 'chat.html';
    });
    
    function showError(message) {
        errorMsg.textContent = message;
        setTimeout(() => {
            errorMsg.textContent = '';
        }, 5000);
    }
});