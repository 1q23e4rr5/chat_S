document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM
    const adminUsernameElement = document.getElementById('adminUsername');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const refreshAdminBtn = document.getElementById('refreshAdminBtn');
    const menuItems = document.querySelectorAll('.admin-menu li');
    const tabs = document.querySelectorAll('.admin-tab');
    const tabTitle = document.getElementById('adminTabTitle');
    
    // عناصر تب کاربران
    const usersTableBody = document.getElementById('usersTableBody');
    const selectAllUsers = document.getElementById('selectAllUsers');
    const blockUserBtn = document.getElementById('blockUserBtn');
    const deleteUserBtn = document.getElementById('deleteUserBtn');
    const userSearch = document.getElementById('userSearch');
    
    // عناصر تب پیام‌ها
    const messagesTableBody = document.getElementById('messagesTableBody');
    const selectAllMessages = document.getElementById('selectAllMessages');
    const deleteMessageBtn = document.getElementById('deleteMessageBtn');
    const messageSearch = document.getElementById('messageSearch');
    
    // عناصر تب گزارشات
    const reportsTableBody = document.getElementById('reportsTableBody');
    const selectAllReports = document.getElementById('selectAllReports');
    const resolveReportBtn = document.getElementById('resolveReportBtn');
    const reportSearch = document.getElementById('reportSearch');
    const reportStatusFilter = document.getElementById('reportStatusFilter');
    
    // عناصر تب آمار
    const totalUsersElement = document.getElementById('totalUsers');
    const totalMessagesElement = document.getElementById('totalMessages');
    const unresolvedReportsElement = document.getElementById('unresolvedReports');
    const blockedUsersElement = document.getElementById('blockedUsers');
    
    // مودال تأیید
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    const cancelActionBtn = document.getElementById('cancelActionBtn');
    
    // اطلاعات کاربر فعلی
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = 'index.html';
        return;
    }
    
    // تنظیم نام کاربری مدیر
    adminUsernameElement.textContent = currentUser.username;
    
    // بارگذاری اولیه داده‌ها
    loadUsersTab();
    loadAnalyticsTab();
    
    // رویداد تغییر تب‌ها
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // تغییر حالت فعال منو
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // تغییر تب نمایش داده شده
            tabs.forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // تغییر عنوان تب
            tabTitle.textContent = this.textContent.trim();
            
            // بارگذاری داده‌های تب مربوطه
            switch(tabId) {
                case 'users-tab':
                    loadUsersTab();
                    break;
                case 'messages-tab':
                    loadMessagesTab();
                    break;
                case 'reports-tab':
                    loadReportsTab();
                    break;
                case 'analytics-tab':
                    loadAnalyticsTab();
                    break;
            }
        });
    });
    
    // رویداد خروج مدیر
    adminLogoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // رویداد بروزرسانی داده‌ها
    refreshAdminBtn.addEventListener('click', function() {
        const activeTab = document.querySelector('.admin-tab.active').id;
        
        switch(activeTab) {
            case 'users-tab':
                loadUsersTab();
                break;
            case 'messages-tab':
                loadMessagesTab();
                break;
            case 'reports-tab':
                loadReportsTab();
                break;
            case 'analytics-tab':
                loadAnalyticsTab();
                break;
        }
        
        showToast('داده‌ها با موفقیت بروزرسانی شدند');
    });
    
    // تابع بارگذاری تب کاربران
    function loadUsersTab() {
        const users = JSON.parse(localStorage.getItem('chatUsers')) || [];
        const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers')) || [];
        
        usersTableBody.innerHTML = '';
        
        users.forEach(user => {
            const isBlocked = blockedUsers.includes(user.username);
            
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td><input type="checkbox" class="user-checkbox" data-username="${user.username}"></td>
                <td>${user.username}</td>
                <td>${formatDate(user.joinDate)}</td>
                <td>${user.lastLogin ? formatDate(user.lastLogin) : '---'}</td>
                <td>${user.reports || 0}</td>
                <td>
                    <span class="status-badge ${isBlocked ? 'blocked' : 'active'}">
                        ${isBlocked ? 'بلاک شده' : 'فعال'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-view" data-username="${user.username}" title="مشاهده اطلاعات">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm ${isBlocked ? 'btn-unblock' : 'btn-block'}" 
                            data-username="${user.username}" 
                            title="${isBlocked ? 'رفع بلاک' : 'بلاک کاربر'}">
                        <i class="fas ${isBlocked ? 'fa-unlock' : 'fa-ban'}"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" data-username="${user.username}" title="حذف کاربر">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        // رویداد انتخاب همه کاربران
        selectAllUsers.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.user-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
        
        // رویداد کلیک بر روی دکمه‌های عملیات
        document.querySelectorAll('.btn-block, .btn-unblock').forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.getAttribute('data-username');
                const isBlocked = this.classList.contains('btn-unblock');
                
                showConfirmModal(
                    isBlocked ? 'رفع بلاک کاربر' : 'بلاک کاربر',
                    `آیا از ${isBlocked ? 'رفع بلاک' : 'بلاک'} کاربر "${username}" مطمئن هستید؟`,
                    () => {
                        toggleBlockUser(username, isBlocked);
                    }
                );
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.getAttribute('data-username');
                
                showConfirmModal(
                    'حذف کاربر',
                    `آیا از حذف کاربر "${username}" مطمئن هستید؟ این عمل غیرقابل بازگشت است.`,
                    () => {
                        deleteUser(username);
                    }
                );
            });
        });
        
        // رویداد جستجوی کاربران
        userSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = usersTableBody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const username = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                if (username.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // تابع بارگذاری تب پیام‌ها
    function loadMessagesTab() {
        const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        
        messagesTableBody.innerHTML = '';
        
        messages.forEach((message, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td><input type="checkbox" class="message-checkbox" data-index="${index}"></td>
                <td>${message.sender}</td>
                <td class="message-preview">${message.text.length > 50 ? 
                    message.text.substring(0, 50) + '...' : message.text}</td>
                <td>${formatTime(message.timestamp)}</td>
                <td>
                    <button class="btn btn-sm btn-view" data-index="${index}" title="مشاهده کامل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" data-index="${index}" title="حذف پیام">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            messagesTableBody.appendChild(row);
        });
        
        // رویداد انتخاب همه پیام‌ها
        selectAllMessages.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.message-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
        
        // رویداد جستجوی پیام‌ها
        messageSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = messagesTableBody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const sender = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const message = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                
                if (sender.includes(searchTerm) || message.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // تابع بارگذاری تب گزارشات
    function loadReportsTab() {
        const reports = JSON.parse(localStorage.getItem('chatReports')) || [];
        const statusFilter = reportStatusFilter.value;
        
        let filteredReports = reports;
        
        if (statusFilter !== 'all') {
            filteredReports = reports.filter(report => 
                statusFilter === 'resolved' ? report.resolved : !report.resolved
            );
        }
        
        reportsTableBody.innerHTML = '';
        
        filteredReports.forEach((report, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td><input type="checkbox" class="report-checkbox" data-index="${index}"></td>
                <td>${report.reporter}</td>
                <td>${report.reportedUser}</td>
                <td>${getReportReasonText(report.reason)}</td>
                <td class="report-details">${report.details || '---'}</td>
                <td>${formatTime(report.timestamp)}</td>
                <td>
                    <span class="status-badge ${report.resolved ? 'resolved' : 'unresolved'}">
                        ${report.resolved ? 'رسیدگی شده' : 'رسیدگی نشده'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm ${report.resolved ? 'btn-undo' : 'btn-resolve'}" 
                            data-index="${index}" 
                            title="${report.resolved ? 'بازگشت از رسیدگی' : 'رسیدگی به گزارش'}">
                        <i class="fas ${report.resolved ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button class="btn btn-sm btn-view" data-index="${index}" title="مشاهده جزئیات">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            reportsTableBody.appendChild(row);
        });
        
        // رویداد تغییر فیلتر وضعیت
        reportStatusFilter.addEventListener('change', loadReportsTab);
        
        // رویداد جستجوی گزارشات
        reportSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = reportsTableBody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const reporter = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const reported = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                const details = row.querySelector('td:nth-child(5)').textContent.toLowerCase();
                
                if (reporter.includes(searchTerm) || reported.includes(searchTerm) || details.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // تابع بارگذاری تب آمار و آنالیز
    function loadAnalyticsTab() {
        const users = JSON.parse(localStorage.getItem('chatUsers')) || [];
        const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        const reports = JSON.parse(localStorage.getItem('chatReports')) || [];
        const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers')) || [];
        
        // آمار کلی
        totalUsersElement.textContent = users.length;
        totalMessagesElement.textContent = messages.length;
        unresolvedReportsElement.textContent = reports.filter(r => !r.resolved).length;
        blockedUsersElement.textContent = blockedUsers.length;
        
        // نمودار کاربران
        renderUsersChart(users);
        
        // نمودار پیام‌ها
        renderMessagesChart(messages);
    }
    
    // تابع نمایش مودال تأیید
    function showConfirmModal(title, message, callback) {
        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        confirmModal.style.display = 'flex';
        
        const handleConfirm = () => {
            callback();
            confirmModal.style.display = 'none';
            confirmActionBtn.removeEventListener('click', handleConfirm);
            cancelActionBtn.removeEventListener('click', handleCancel);
        };
        
        const handleCancel = () => {
            confirmModal.style.display = 'none';
            confirmActionBtn.removeEventListener('click', handleConfirm);
            cancelActionBtn.removeEventListener('click', handleCancel);
        };
        
        confirmActionBtn.addEventListener('click', handleConfirm);
        cancelActionBtn.addEventListener('click', handleCancel);
    }
    
    // تابع‌های کمکی
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR');
    }
    
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function getReportReasonText(reason) {
        const reasons = {
            'spam': 'ارسال اسپم',
            'abuse': 'رفتار توهین‌آمیز',
            'inappropriate': 'محتوا نامناسب',
            'other': 'سایر موارد'
        };
        return reasons[reason] || reason;
    }
    
    function showToast(message, type = 'success') {
        // پیاده‌سازی toast notification
        alert(message); // برای نمونه ساده
    }
    
    // توابع عملیات مدیریتی
    function toggleBlockUser(username, isCurrentlyBlocked) {
        let blockedUsers = JSON.parse(localStorage.getItem('blockedUsers')) || [];
        
        if (isCurrentlyBlocked) {
            blockedUsers = blockedUsers.filter(u => u !== username);
        } else {
            blockedUsers.push(username);
        }
        
        localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
        loadUsersTab();
        showToast(`کاربر "${username}" ${isCurrentlyBlocked ? 'رفع بلاک شد' : 'بلاک شد'}`);
    }
    
    function deleteUser(username) {
        let users = JSON.parse(localStorage.getItem('chatUsers')) || [];
        users = users.filter(u => u.username !== username);
        
        localStorage.setItem('chatUsers', JSON.stringify(users));
        loadUsersTab();
        loadAnalyticsTab();
        showToast(`کاربر "${username}" با موفقیت حذف شد`);
    }
    
    // توابع رسم نمودارها
    function renderUsersChart(users) {
        // پیاده‌سازی نمودار کاربران
        // در حالت واقعی از Chart.js استفاده می‌شود
    }
    
    function renderMessagesChart(messages) {
        // پیاده‌سازی نمودار پیام‌ها
        // در حالت واقعی از Chart.js استفاده می‌شود
    }
});