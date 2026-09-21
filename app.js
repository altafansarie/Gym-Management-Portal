/* ==========================================================================
   PRO HEALTH FITNESS - MAIN CONTROLLER & APPLICATION ENGINE
   MG Road, Katihar, Bihar - 854105
   ========================================================================== */

const App = {
  currentTab: "dashboard",

  init() {
    // Purge previous sample/mock data to start clean
    if (!localStorage.getItem("phf_sample_purged_v2")) {
      localStorage.removeItem("phf_members");
      localStorage.removeItem("phf_bills");
      localStorage.removeItem("phf_workout_templates");
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith("phf_checkins_")) localStorage.removeItem(k);
      });
      localStorage.setItem("phf_sample_purged_v2", "true");
    }

    this.setupNavigation();
    this.setupEventListeners();
    this.refreshAllData();
    TimingModule.init();
    WorkoutsModule.init();
    AlertsModule.init();
    
    // Close modals on escape key or clicking backdrop
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals();
      }
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.closeAllModals();
        }
      });
    });
  },

  setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const tabId = item.dataset.tab;
        this.switchTab(tabId);

        // Close mobile sidebar if open
        const sidebar = document.querySelector(".sidebar");
        if (sidebar && sidebar.classList.contains("open")) {
          sidebar.classList.remove("open");
        }
      });
    });

    // Mobile menu toggler
    const mobileBtn = document.getElementById("mobile-menu-toggle");
    if (mobileBtn) {
      mobileBtn.addEventListener("click", () => {
        const sidebar = document.querySelector(".sidebar");
        if (sidebar) sidebar.classList.toggle("open");
      });
    }
  },

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update active nav button
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.tab === tabId);
    });

    // Switch active view pane
    document.querySelectorAll(".view-pane").forEach(pane => {
      pane.classList.remove("active");
    });

    const targetPane = document.getElementById(`view-${tabId}`);
    if (targetPane) {
      targetPane.classList.add("active");
    }

    // Refresh specific pane data
    if (tabId === "members") {
      MembersModule.renderMembersTable();
    } else if (tabId === "billing") {
      BillingModule.renderBillingTable();
    } else if (tabId === "workouts") {
      WorkoutsModule.populateMemberFilterDropdown();
    } else if (tabId === "timing") {
      TimingModule.renderBatches();
      TimingModule.populateCheckinDropdown();
      TimingModule.renderCheckinLogs();
    } else if (tabId === "alerts") {
      AlertsModule.renderAlertsFeed(AlertsModule.currentAlertTab);
    } else if (tabId === "dashboard") {
      this.updateDashboardStats();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  updateDashboardStats() {
    const members = MembersModule.getMembers();
    const bills = BillingModule.getBills();
    const alerts = AlertsModule.getAllAlertItems();
    const checkinLogs = TimingModule.getCheckinLogs();

    // 1. Total Active Members
    const activeCount = members.filter(m => {
      const s = MembersModule.calculateStatus(m);
      return s.status === "active" || s.status === "expiring_soon";
    }).length;

    const countEl = document.getElementById("dash-active-members");
    if (countEl) countEl.innerText = activeCount;

    // 2. Monthly Collections (Sum of all bills)
    const totalCollected = bills.reduce((sum, b) => sum + (parseFloat(b.paid) || 0), 0);
    const revEl = document.getElementById("dash-revenue");
    if (revEl) revEl.innerText = `₹${totalCollected.toLocaleString('en-IN')}`;

    // 3. Today's Checkins
    const checkinEl = document.getElementById("dash-checkins-today");
    if (checkinEl) checkinEl.innerText = checkinLogs.length;

    // 4. Pending Alerts count
    const alertsCountEl = document.getElementById("dash-alerts-count");
    if (alertsCountEl) alertsCountEl.innerText = alerts.length;

    // 5. Total pending dues
    const totalDues = members.reduce((sum, m) => sum + (parseFloat(m.amountDue) || 0), 0);
    const duesEl = document.getElementById("dash-total-dues");
    if (duesEl) duesEl.innerText = `₹${totalDues.toLocaleString('en-IN')}`;

    // 6. Dashboard Recent Activity / Urgent Alerts preview
    this.renderDashboardUrgentFeed(alerts);
  },

  renderDashboardUrgentFeed(alerts) {
    const container = document.getElementById("dash-urgent-feed");
    if (!container) return;

    if (alerts.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          ✨ All memberships and payments are in order!
        </div>
      `;
      return;
    }

    const topAlerts = alerts.slice(0, 3);
    container.innerHTML = topAlerts.map(a => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(0,0,0,0.25); border-left: 3px solid ${a.type === 'expired' ? 'var(--status-danger)' : 'var(--status-warning)'}; border-radius: var(--radius-sm); margin-bottom: 10px; gap: 12px;">
        <div>
          <div style="font-weight: 600; font-size: 0.88rem; color: #ffffff;">${a.title}</div>
          <div style="font-size: 0.76rem; color: var(--text-secondary);">${a.message}</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="BillingModule.openNewBillForMember('${a.member.id}')">
          Renew
        </button>
      </div>
    `).join("");
  },

  refreshAllData() {
    this.updateDashboardStats();
    MembersModule.renderMembersTable();
    BillingModule.renderBillingTable();
    AlertsModule.updateNotificationBadges();
  },

  setupEventListeners() {
    // Member search & filter
    const memberSearch = document.getElementById("member-search-input");
    const memberFilter = document.getElementById("member-status-filter");
    if (memberSearch) {
      memberSearch.addEventListener("input", () => {
        MembersModule.renderMembersTable(memberFilter.value, memberSearch.value);
      });
    }
    if (memberFilter) {
      memberFilter.addEventListener("change", () => {
        MembersModule.renderMembersTable(memberFilter.value, memberSearch.value);
      });
    }

    // Billing search & filter
    const billingSearch = document.getElementById("billing-search-input");
    const billingFilter = document.getElementById("billing-status-filter");
    if (billingSearch) {
      billingSearch.addEventListener("input", () => {
        BillingModule.renderBillingTable(billingFilter.value, billingSearch.value);
      });
    }
    if (billingFilter) {
      billingFilter.addEventListener("change", () => {
        BillingModule.renderBillingTable(billingFilter.value, billingSearch.value);
      });
    }

    // Member Form plan change listener to auto calculate expiry
    const planSelect = document.getElementById("member-plan");
    if (planSelect) {
      planSelect.addEventListener("change", () => {
        MembersModule.updateExpiryBasedOnPlan(planSelect.value);
      });
    }

    const joinDateInput = document.getElementById("member-joindate");
    if (joinDateInput) {
      joinDateInput.addEventListener("change", () => {
        MembersModule.updateExpiryBasedOnPlan(document.getElementById("member-plan").value, joinDateInput.value);
      });
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  },

  closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✓";
    if (type === "error") icon = "✕";
    if (type === "warning") icon = "⚠️";

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: bold;">${icon}</span>
        <span>${message}</span>
      </div>
      <button style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem;" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  clearAllData() {
    if (confirm("Are you sure you want to clear all members, billing transactions, and check-in logs? This will reset the portal to a fresh, blank state.")) {
      localStorage.removeItem("phf_members");
      localStorage.removeItem("phf_bills");
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith("phf_checkins_")) localStorage.removeItem(k);
      });
      location.reload();
    }
  },

  resetDemoData() {
    this.clearAllData();
  },

  exportDataJSON() {
    const data = {
      gym: GYM_CONFIG,
      members: MembersModule.getMembers(),
      bills: BillingModule.getBills(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pro_health_fitness_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("Data backup file exported successfully!", "success");
  }
};

// Initialize App when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
