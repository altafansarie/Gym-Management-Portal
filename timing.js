/* ==========================================================================
   PRO HEALTH FITNESS - TIMING & BATCH MANAGEMENT MODULE
   MG Road, Katihar, Bihar - 854105
   ========================================================================== */

const TimingModule = {
  clockInterval: null,

  init() {
    this.startLiveClock();
    this.renderBatches();
    this.populateCheckinDropdown();
    this.renderCheckinLogs();
  },

  startLiveClock() {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      const timeStr = now.toLocaleDateString('en-IN', options);

      const headerClock = document.getElementById("header-live-clock");
      if (headerClock) {
        headerClock.innerText = timeStr;
      }

      const activeBadge = document.getElementById("header-active-batch-badge");
      if (activeBadge) {
        const currentBatch = this.getCurrentActiveBatch();
        if (currentBatch) {
          activeBadge.innerHTML = `<span class="status-dot"></span>${currentBatch.name}`;
          activeBadge.style.display = "inline-flex";
        } else {
          activeBadge.innerHTML = `<span style="background: #94a3b8;" class="status-dot"></span>Gym Closed`;
          activeBadge.style.display = "inline-flex";
        }
      }
    };

    updateTime();
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = setInterval(updateTime, 1000);
  },

  getCurrentActiveBatch() {
    const now = new Date();
    const currentDecimal = now.getHours() + (now.getMinutes() / 60);

    return BATCH_TIMINGS.find(b => currentDecimal >= b.startHour && currentDecimal < b.endHour) || null;
  },

  renderBatches() {
    const container = document.getElementById("batches-container");
    if (!container) return;

    const members = MembersModule.getMembers();
    const currentActive = this.getCurrentActiveBatch();

    container.innerHTML = BATCH_TIMINGS.map(batch => {
      const enrolled = members.filter(m => m.batchId === batch.id);
      const count = enrolled.length;
      const percent = Math.min(100, Math.round((count / batch.capacity) * 100));
      const isActiveNow = currentActive && currentActive.id === batch.id;
      const isHighCapacity = percent >= 80;

      const memberChips = enrolled.map(m => `
        <span class="member-chip" title="${m.phone}">${m.name}</span>
      `).join("");

      return `
        <div class="metallic-card batch-card ${isActiveNow ? 'current-active' : ''}">
          <div class="batch-card-top">
            <div>
              <div class="batch-name">${batch.name}</div>
              <div class="batch-time">⏰ ${batch.timeRange}</div>
            </div>
            ${isActiveNow ? '<span class="badge badge-active"><span class="status-dot"></span> LIVE NOW</span>' : '<span class="badge badge-silver">Scheduled</span>'}
          </div>

          <div class="batch-meter">
            <div class="batch-meter-labels">
              <span>Slot Occupancy</span>
              <span><strong>${count}</strong> / ${batch.capacity} Members (${percent}%)</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${isHighCapacity ? 'warning' : ''}" style="width: ${percent}%;"></div>
            </div>
          </div>

          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">
              Enrolled Trainees (${count}):
            </div>
            <div class="enrolled-members-list">
              ${count > 0 ? memberChips : '<span style="font-size: 0.75rem; color: var(--text-muted);">No members assigned yet.</span>'}
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  populateCheckinDropdown() {
    const select = document.getElementById("checkin-member-select");
    if (!select) return;

    const members = MembersModule.getMembers();
    select.innerHTML = `<option value="">-- Select Member to Check In --</option>` + members.map(m => `
      <option value="${m.id}">${m.name} (${m.id}) - ${m.phone}</option>
    `).join("");
  },

  getCheckinLogs() {
    const todayStr = new Date().toISOString().split("T")[0];
    const key = `phf_checkins_${todayStr}`;
    const data = localStorage.getItem(key);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  },

  saveCheckinLogs(logs) {
    const todayStr = new Date().toISOString().split("T")[0];
    const key = `phf_checkins_${todayStr}`;
    localStorage.setItem(key, JSON.stringify(logs));
  },

  recordCheckin(e) {
    if (e) e.preventDefault();
    const select = document.getElementById("checkin-member-select");
    const memberId = select ? select.value : "";

    if (!memberId) {
      App.showToast("Please select a gym member to record check-in", "warning");
      return;
    }

    const member = MembersModule.getMemberById(memberId);
    if (!member) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const currentBatch = this.getCurrentActiveBatch() || { name: "General Access" };

    const logs = this.getCheckinLogs();
    logs.unshift({
      memberId: member.id,
      memberName: member.name,
      time: timeStr,
      batch: currentBatch.name
    });

    this.saveCheckinLogs(logs);

    // Update member's last check-in
    let members = MembersModule.getMembers();
    const idx = members.findIndex(m => m.id === member.id);
    if (idx !== -1) {
      members[idx].lastCheckin = `Today, ${timeStr}`;
      MembersModule.saveMembers(members);
    }

    if (select) select.value = "";
    this.renderCheckinLogs();
    App.updateDashboardStats();
    App.showToast(`Checked in: ${member.name} at ${timeStr}`, "success");
  },

  renderCheckinLogs() {
    const list = document.getElementById("checkin-activity-log");
    if (!list) return;

    const logs = this.getCheckinLogs();

    if (logs.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 20px;">
          No check-ins recorded today yet.
        </div>
      `;
      return;
    }

    list.innerHTML = logs.map(l => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(0,0,0,0.3); border: 1px solid var(--titanium-border); border-radius: var(--radius-sm); margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--status-active);"></div>
          <div>
            <div style="font-weight: 600; color: #ffffff; font-size: 0.88rem;">${l.memberName}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${l.memberId} • ${l.batch}</div>
          </div>
        </div>
        <div style="font-family: var(--font-heading); font-size: 0.82rem; font-weight: 700; color: var(--steel-cyan);">
          ${l.time}
        </div>
      </div>
    `).join("");
  }
};
