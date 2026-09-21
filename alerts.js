/* ==========================================================================
   PRO HEALTH FITNESS - MONTHLY ALERT & NOTIFICATIONS MODULE
   MG Road, Katihar, Bihar - 854105
   ========================================================================== */

const AlertsModule = {
  currentAlertTab: "all",

  init() {
    this.updateNotificationBadges();
    this.renderAlertsFeed(this.currentAlertTab);
  },

  getAllAlertItems() {
    const members = MembersModule.getMembers();
    const alerts = [];

    members.forEach(m => {
      const statusInfo = MembersModule.calculateStatus(m);
      const plan = MEMBERSHIP_PLANS.find(p => p.id === m.planId) || { name: "Standard Plan" };

      // Expired Alert
      if (statusInfo.status === "expired") {
        alerts.push({
          type: "expired",
          priority: 1,
          member: m,
          plan: plan,
          title: `Membership Expired: ${m.name}`,
          message: `Membership expired ${Math.abs(statusInfo.daysLeft)} days ago on ${m.expiryDate}. Workout access paused.`,
          actionLabel: "Renew Now",
          dueAmount: m.amountDue
        });
      }
      // Critical Expiry (within 3 days)
      else if (statusInfo.daysLeft >= 0 && statusInfo.daysLeft <= 3) {
        alerts.push({
          type: "critical",
          priority: 2,
          member: m,
          plan: plan,
          title: `Renewal Urgent: ${m.name}`,
          message: `Expiring in ${statusInfo.daysLeft === 0 ? 'Today' : `${statusInfo.daysLeft} days`} (${m.expiryDate}). Send reminder.`,
          actionLabel: "Renew Plan",
          dueAmount: m.amountDue
        });
      }
      // Upcoming Expiry (4 to 7 days)
      else if (statusInfo.daysLeft > 3 && statusInfo.daysLeft <= 7) {
        alerts.push({
          type: "upcoming",
          priority: 3,
          member: m,
          plan: plan,
          title: `Upcoming Renewal: ${m.name}`,
          message: `Expiring in ${statusInfo.daysLeft} days on ${m.expiryDate}.`,
          actionLabel: "Renew Plan",
          dueAmount: m.amountDue
        });
      }

      // Pending Dues Alert
      if (m.amountDue > 0) {
        alerts.push({
          type: "due",
          priority: 2,
          member: m,
          plan: plan,
          title: `Payment Due: ${m.name}`,
          message: `Pending balance of ₹${m.amountDue} against plan ${plan.name}.`,
          actionLabel: "Clear Due",
          dueAmount: m.amountDue
        });
      }
    });

    // Sort by priority (highest first)
    alerts.sort((a, b) => a.priority - b.priority);
    return alerts;
  },

  updateNotificationBadges() {
    const alerts = this.getAllAlertItems();
    const count = alerts.length;

    // Sidebar badge
    const sideBadge = document.getElementById("nav-alerts-badge");
    if (sideBadge) {
      sideBadge.innerText = count;
      sideBadge.style.display = count > 0 ? "inline-block" : "none";
    }

    // Header bell badge
    const headerBadge = document.getElementById("header-alerts-badge");
    if (headerBadge) {
      headerBadge.innerText = count;
      headerBadge.style.display = count > 0 ? "inline-block" : "none";
    }

    // Dashboard alert count
    const dashBadge = document.getElementById("dash-alerts-count");
    if (dashBadge) {
      dashBadge.innerText = count;
    }
  },

  renderAlertsFeed(filterType = "all") {
    this.currentAlertTab = filterType;
    const container = document.getElementById("alerts-feed-container");
    if (!container) return;

    let alerts = this.getAllAlertItems();

    if (filterType !== "all") {
      alerts = alerts.filter(a => a.type === filterType);
    }

    // Highlight active tab button
    document.querySelectorAll(".alert-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === filterType);
    });

    if (alerts.length === 0) {
      container.innerHTML = `
        <div class="metallic-card" style="padding: 40px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 1.5rem; margin-bottom: 8px;">🛡️</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #ffffff; margin-bottom: 4px;">All Clear! No Pending Alerts</div>
          <div style="font-size: 0.85rem;">No member memberships are overdue or pending payment in this category.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = alerts.map(a => {
      const cardClass = a.type === 'expired' ? 'expired' : (a.type === 'critical' ? 'critical' : (a.type === 'due' ? 'due' : ''));
      
      let icon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      `;

      if (a.type === 'expired') {
        icon = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        `;
      } else if (a.type === 'due') {
        icon = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        `;
      }

      return `
        <div class="metallic-card alert-card ${cardClass}">
          <div class="alert-info-main">
            <div class="alert-type-icon">
              ${icon}
            </div>
            <div class="alert-title-text">
              <h4>${a.title}</h4>
              <p>${a.message}</p>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                Member ID: ${a.member.id} • Phone: ${a.member.phone} • Address: ${a.member.address || 'Katihar'}
              </div>
            </div>
          </div>

          <div class="alert-actions">
            <button class="btn btn-primary btn-sm" onclick="BillingModule.openNewBillForMember('${a.member.id}')">
              ${a.actionLabel}
            </button>
            <button class="btn btn-secondary btn-sm" onclick="AlertsModule.sendWhatsAppReminder('${a.member.id}')" title="Send WhatsApp Notification">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              WhatsApp
            </button>
          </div>
        </div>
      `;
    }).join("");
  },

  sendWhatsAppReminder(memberId) {
    const member = MembersModule.getMemberById(memberId);
    if (!member) return;

    const plan = MEMBERSHIP_PLANS.find(p => p.id === member.planId) || { name: "Gym Membership" };
    const statusInfo = MembersModule.calculateStatus(member);

    let message = "";
    if (statusInfo.status === "expired") {
      message = `Dear ${member.name}, Greetings from *Pro Health Fitness*, MG Road, Katihar (PIN: 854105). Your gym membership (${plan.name}) expired on ${member.expiryDate}. To continue your fitness journey uninterrupted, please renew your membership at our front desk. Feel free to contact us at +91 98351 28940. Stay strong!`;
    } else if (member.amountDue > 0) {
      message = `Dear ${member.name}, Greetings from *Pro Health Fitness*, MG Road, Katihar. You have a pending fee balance of *₹${member.amountDue}* for your membership. Kindly settle your dues at your earliest convenience. Thank you!`;
    } else {
      message = `Dear ${member.name}, Greetings from *Pro Health Fitness*, MG Road, Katihar. This is a gentle reminder that your membership (${plan.name}) is due for renewal on *${member.expiryDate}* (${statusInfo.daysLeft} days remaining). Keep up the great work! Contact: +91 98351 28940.`;
    }

    const cleanPhone = member.phone.replace(/[^0-9]/g, "");
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
    App.showToast(`WhatsApp reminder dispatched for ${member.name}!`, "success");
  }
};
