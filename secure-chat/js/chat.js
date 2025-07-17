document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM
    const currentUserElement = document.getElementById('currentUsername');
    const onlineUsersElement = document.getElementById('onlineUsers');
    const onlineCountElement = document.getElementById('onlineCount');
    const chatMessagesElement = document.getElementById('chatMessages');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const reportBtn = document.getElementById('reportBtn');
    const reportModal = document.getElementById('reportModal');
    const closeModal = document.querySelector('.close-modal');
    const reportForm = document.getElementById('reportForm');
    const reportUserSelect = document.getElementById('reportUserSelect');
    
    // اطلاعات کاربر فعلی
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // تنظیم نام کاربری
    currentUserElement.textContent = currentUser.username;
    
    // شبیه‌سازی کاربران آنلاین (در حالت واقعی از WebSocket استفاده می‌شود)
    const onlineUsers = [
        { username: currentUser.username, status: 'online' },
        { username: 'user1', status: 'online' },
        { username: 'user2', status: 'online' },
        { username: 'user3', status: 'away' }
    ];
    
    // بارگذاری پیام‌های قبلی
    loadMessages();
    updateOnlineUsers();
    
    // رویداد ارسال پیام
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const messageText = messageInput.value.trim();
        if (!messageText) return;
        
        // ایجاد پیام جدید
        const newMessage = {
            sender: currentUser.username,
            text: messageText,
            timestamp: new Date().toISOString(),
            isAdmin: currentUser.isAdmin || false
        };
        
        // ذخیره پیام
        const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        messages.push(newMessage);
        localStorage.setItem('chatMessages', JSON.stringify(messages));
        
        // نمایش پیام
        displayMessage(newMessage);
        
        // پاک کردن فیلد ورودی
        messageInput.value = '';
    });
    
    // رویداد خروج
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // رویداد بروزرسانی
    refreshBtn.addEventListener('click', function() {
        loadMessages();
        updateOnlineUsers();
    });
    
    // رویداد باز کردن مودال گزارش
    reportBtn.addEventListener('click', function() {
        // پر کردن لیست کاربران برای گزارش (به جز خود کاربر)
        reportUserSelect.innerHTML = '<option value="">انتخاب کاربر...</option>';
        
        const users = JSON.parse(localStorage.getItem('chatUsers')) || [];
        users.forEach(user => {
            if (user.username !== currentUser.username) {
                const option = document.createElement('option');
                option.value = user.username;
                option.textContent = user.username;
                reportUserSelect.appendChild(option);
            }
        });
        
        reportModal.style.display = 'flex';
    });
    
    // رویداد بستن مودال
    closeModal.addEventListener('click', function() {
        reportModal.style.display = 'none';
    });
    
    // رویداد کلیک خارج از مودال
    window.addEventListener('click', function(e) {
        if (e.target === reportModal) {
            reportModal.style.display = 'none';
        }
    });
    
    // رویداد ارسال گزارش
    reportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const reportedUser = reportUserSelect.value;
        const reason = document.getElementById('reportReason').value;
        const details = document.getElementById('reportDetails').value;
        
        if (!reportedUser) {
            alert('لطفاً کاربر مورد نظر را انتخاب کنید');
            return;
        }
        
        // ذخیره گزارش
        const reports = JSON.parse(localStorage.getItem('chatReports')) || [];
        reports.push({
            reporter: currentUser.username,
            reportedUser,
            reason,
            details,
            timestamp: new Date().toISOString(),
            resolved: false
        });
        localStorage.setItem('chatReports', JSON.stringify(reports));
        
        // افزایش تعداد گزارشات کاربر گزارش شده
        const users = JSON.parse(localStorage.getItem('chatUsers')) || [];
        const userIndex = users.findIndex(u => u.username === reportedUser);
        if (userIndex !== -1) {
            if (!users[userIndex].reports) {
                users[userIndex].reports = 0;
            }
            users[userIndex].reports++;
            localStorage.setItem('chatUsers', JSON.stringify(users));
        }
        
        alert('گزارش شما با موفقیت ثبت شد. مدیر سیستم آن را بررسی خواهد کرد.');
        reportModal.style.display = 'none';
        reportForm.reset();
    });
    
    // تابع بارگذاری پیام‌ها
    function loadMessages() {
        const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        chatMessagesElement.innerHTML = '';
        
        messages.forEach(message => {
            displayMessage(message);
        });
        
        // اسکرول به پایین
        chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
    }
    
    // تابع نمایش پیام
    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        if (message.sender === currentUser.username) {
            messageElement.classList.add('message-sent');
        } else {
            messageElement.classList.add('message-received');
        }
        
        const senderElement = document.createElement('span');
        senderElement.classList.add('message-sender');
        senderElement.textContent = message.sender;
        
        const textElement = document.createElement('div');
        textElement.textContent = message.text;
        
        const timeElement = document.createElement('div');
        timeElement.classList.add('message-time');
        timeElement.textContent = formatTime(message.timestamp);
        
        messageElement.appendChild(senderElement);
        messageElement.appendChild(textElement);
        messageElement.appendChild(timeElement);
        
        chatMessagesElement.appendChild(messageElement);
        
        // اسکرول به پایین برای پیام جدید
        chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
    }
    
    // تابع به‌روزرسانی لیست کاربران آنلاین
    function updateOnlineUsers() {
        onlineUsersElement.innerHTML = '';
        const users = JSON.parse(localStorage.getItem('chatUsers')) || [];
        
        // فقط کاربرانی که در 5 دقیقه گذشته فعالیت داشتند
        const activeUsers = users.filter(user => {
            const lastLogin = new Date(user.lastLogin || user.joinDate);
            const now = new Date();
            return (now - lastLogin) < (5 * 60 * 1000); // 5 دقیقه
        });
        
        activeUsers.forEach(user => {
            const userElement = document.createElement('li');
            userElement.textContent = user.username;
            
            if (user.username === currentUser.username) {
                userElement.innerHTML += ' <span class="you-badge">(شما)</span>';
            }
            
            onlineUsersElement.appendChild(userElement);
        });
        
        onlineCountElement.textContent = activeUsers.length;
    }
    
    // تابع فرمت زمان
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // شبیه‌سازی به‌روزرسانی آنلاین (در حالت واقعی از WebSocket استفاده می‌شود)
    setInterval(() => {
        updateOnlineUsers();
    }, 30000); // هر 30 ثانیه
});