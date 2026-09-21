/* ==========================================================================
   PRO HEALTH FITNESS - MEMBER MANAGEMENT MODULE
   MG Road, Katihar, Bihar - 854105
   ========================================================================== */

const MembersModule = {
  getMembers() {
    const data = localStorage.getItem("phf_members");
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  },

  saveMembers(members) {
    localStorage.setItem("phf_members", JSON.stringify(members));
    App.refreshAllData();
  },

  getMemberById(id) {
    const members = this.getMembers();
    return members.find(m => m.id === id);
  },

  calculateStatus(member) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(member.expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "expired", label: "Expired", class: "badge-expired", daysLeft: diffDays };
    } else if (diffDays <= 7) {
      return { status: "expiring_soon", label: `Expiring (${diffDays}d)`, class: "badge-pending", daysLeft: diffDays };
    } else if (member.amountDue > 0) {
      return { status: "due", label: "Dues Pending", class: "badge-pending", daysLeft: diffDays };
    } else {
      return { status: "active", label: "Active", class: "badge-active", daysLeft: diffDays };
    }
  },

  renderMembersTable(filter = "all", searchQuery = "") {
    const tbody = document.getElementById("members-table-body");
    if (!tbody) return;

    let members = this.getMembers();

    // Apply Filter
    if (filter !== "all") {
      members = members.filter(m => {
        const computed = this.calculateStatus(m);
        return computed.status === filter;
      });
    }

    // Apply Search
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      members = members.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.phone.includes(q) || 
        m.id.toLowerCase().includes(q) ||
        (m.address && m.address.toLowerCase().includes(q))
      );
    }

    if (members.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 6px; color: #ffffff;">No members registered yet</div>
            <div style="font-size: 0.85rem; margin-bottom: 14px;">Your gym roster is clean. Click below to add your first member.</div>
            <button class="btn btn-primary btn-sm" onclick="MembersModule.openAddModal()">+ Add New Member</button>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = members.map(m => {
      const statusInfo = this.calculateStatus(m);
      const plan = MEMBERSHIP_PLANS.find(p => p.id === m.planId) || { name: "Standard Plan" };
      const batch = BATCH_TIMINGS.find(b => b.id === m.batchId) || { name: "General Batch" };
      const initials = m.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

      return `
        <tr>
          <td>
            <div class="member-cell">
              <div class="member-avatar">${initials}</div>
              <div>
                <div class="member-meta-name">${m.name}</div>
                <div class="member-meta-phone">${m.id} • ${m.phone}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 600;">${plan.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Exp: ${m.expiryDate}</div>
          </td>
          <td>
            <span style="font-size: 0.85rem; color: var(--steel-cyan); font-weight: 500;">
              ${batch.name}
            </span>
          </td>
          <td>
            <span class="badge ${statusInfo.class}">${statusInfo.label}</span>
          </td>
          <td>
            <div style="font-weight: 600; color: ${m.amountDue > 0 ? 'var(--status-danger)' : 'var(--status-active)'}">
              ${m.amountDue > 0 ? `₹${m.amountDue} Due` : 'Clear'}
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-icon btn-sm" title="View Profile" onclick="MembersModule.openProfileModal('${m.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
              <button class="btn btn-icon btn-sm" title="Edit Member" onclick="MembersModule.openEditModal('${m.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn btn-icon btn-sm" title="Assign Workout" onclick="WorkoutsModule.openAssignModal('${m.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v16M18 4v16M2 8h4M2 16h4M18 8h4M18 16h4M6 12h12"></path></svg>
              </button>
              <button class="btn btn-icon btn-sm" title="Quick Bill" onclick="BillingModule.openNewBillForMember('${m.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </button>
              <button class="btn btn-icon btn-sm btn-danger" title="Delete Member" onclick="MembersModule.deleteMember('${m.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  openAddModal() {
    const modal = document.getElementById("member-form-modal");
    if (!modal) return;

    document.getElementById("member-modal-title").innerText = "REGISTER NEW MEMBER";
    document.getElementById("member-id-field").value = "";
    document.getElementById("member-name").value = "";
    document.getElementById("member-phone").value = "";
    document.getElementById("member-email").value = "";
    document.getElementById("member-address").value = "MG Road, Katihar, Bihar";
    document.getElementById("member-pincode").value = "854105";
    document.getElementById("member-gender").value = "Male";
    document.getElementById("member-goal").value = "General Fitness & Weight Training";
    
    // Set default dates
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("member-joindate").value = today;
    
    // Auto calculate expiry based on first plan
    this.updateExpiryBasedOnPlan("plan_monthly", today);

    document.getElementById("member-plan").value = "plan_monthly";
    document.getElementById("member-batch").value = "batch_2";

    const routines = WorkoutsModule.getRoutines();
    const workoutSelect = document.getElementById("member-workout");
    if (workoutSelect) {
      workoutSelect.innerHTML = Object.keys(routines).map(k => `
        <option value="${k}">${routines[k].name}</option>
      `).join("");
      workoutSelect.value = Object.keys(routines)[0] || "ppl";
    }

    document.getElementById("member-paid").value = "1000";
    document.getElementById("member-due").value = "0";

    modal.classList.add("active");
  },

  updateExpiryBasedOnPlan(planId, startDateStr) {
    const plan = MEMBERSHIP_PLANS.find(p => p.id === planId) || MEMBERSHIP_PLANS[0];
    const startDate = new Date(startDateStr || document.getElementById("member-joindate").value || new Date());
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays);
    
    const expiryInput = document.getElementById("member-expirydate");
    if (expiryInput) {
      expiryInput.value = expiryDate.toISOString().split("T")[0];
    }
    
    // Auto set plan price in form if new member
    const paidInput = document.getElementById("member-paid");
    if (paidInput && !document.getElementById("member-id-field").value) {
      paidInput.value = plan.price;
      document.getElementById("member-due").value = 0;
    }
  },

  openEditModal(id) {
    const m = this.getMemberById(id);
    if (!m) return;

    const modal = document.getElementById("member-form-modal");
    if (!modal) return;

    document.getElementById("member-modal-title").innerText = `EDIT MEMBER (${m.id})`;
    document.getElementById("member-id-field").value = m.id;
    document.getElementById("member-name").value = m.name;
    document.getElementById("member-phone").value = m.phone;
    document.getElementById("member-email").value = m.email || "";
    document.getElementById("member-address").value = m.address || "MG Road, Katihar";
    document.getElementById("member-pincode").value = m.pincode || "854105";
    document.getElementById("member-gender").value = m.gender || "Male";
    document.getElementById("member-goal").value = m.fitnessGoal || "";
    document.getElementById("member-joindate").value = m.joinDate;
    document.getElementById("member-expirydate").value = m.expiryDate;
    document.getElementById("member-plan").value = m.planId;
    document.getElementById("member-batch").value = m.batchId;

    const routines = WorkoutsModule.getRoutines();
    const workoutSelect = document.getElementById("member-workout");
    if (workoutSelect) {
      workoutSelect.innerHTML = Object.keys(routines).map(k => `
        <option value="${k}" ${k === m.workoutId ? 'selected' : ''}>${routines[k].name}</option>
      `).join("");
    }

    document.getElementById("member-paid").value = m.amountPaid;
    document.getElementById("member-due").value = m.amountDue;

    modal.classList.add("active");
  },

  saveMemberFromForm(e) {
    e.preventDefault();
    const idField = document.getElementById("member-id-field").value;
    const members = this.getMembers();

    const planId = document.getElementById("member-plan").value;
    const plan = MEMBERSHIP_PLANS.find(p => p.id === planId);
    const amountPaid = parseFloat(document.getElementById("member-paid").value) || 0;
    const amountDue = parseFloat(document.getElementById("member-due").value) || 0;

    if (idField) {
      // Update existing
      const index = members.findIndex(m => m.id === idField);
      if (index !== -1) {
        members[index].name = document.getElementById("member-name").value.trim();
        members[index].phone = document.getElementById("member-phone").value.trim();
        members[index].email = document.getElementById("member-email").value.trim();
        members[index].address = document.getElementById("member-address").value.trim();
        members[index].pincode = document.getElementById("member-pincode").value.trim();
        members[index].gender = document.getElementById("member-gender").value;
        members[index].fitnessGoal = document.getElementById("member-goal").value.trim();
        members[index].joinDate = document.getElementById("member-joindate").value;
        members[index].expiryDate = document.getElementById("member-expirydate").value;
        members[index].planId = planId;
        members[index].batchId = document.getElementById("member-batch").value;
        members[index].workoutId = document.getElementById("member-workout").value;
        members[index].amountPaid = amountPaid;
        members[index].amountDue = amountDue;

        this.saveMembers(members);
        App.showToast(`Updated member ${members[index].name}`, "success");
      }
    } else {
      // Create new
      const nextNum = members.length > 0 
        ? Math.max(...members.map(m => parseInt(m.id.replace("PHF-", "")) || 1000)) + 1 
        : 1001;
      const newId = `PHF-${nextNum}`;

      const newMember = {
        id: newId,
        name: document.getElementById("member-name").value.trim(),
        phone: document.getElementById("member-phone").value.trim(),
        email: document.getElementById("member-email").value.trim(),
        address: document.getElementById("member-address").value.trim(),
        pincode: document.getElementById("member-pincode").value.trim(),
        gender: document.getElementById("member-gender").value,
        fitnessGoal: document.getElementById("member-goal").value.trim(),
        joinDate: document.getElementById("member-joindate").value,
        expiryDate: document.getElementById("member-expirydate").value,
        planId: planId,
        batchId: document.getElementById("member-batch").value,
        workoutId: document.getElementById("member-workout").value,
        amountPaid: amountPaid,
        amountDue: amountDue,
        status: "active",
        lastCheckin: "Just Enrolled"
      };

      members.unshift(newMember);
      this.saveMembers(members);

      // Also create initial bill record
      BillingModule.recordBillDirectly({
        memberId: newId,
        memberName: newMember.name,
        planName: plan ? plan.name : "Gym Membership",
        amount: amountPaid + amountDue,
        paid: amountPaid,
        due: amountDue,
        paymentMode: "Cash / UPI Initial",
        status: amountDue > 0 ? "PARTIAL" : "PAID"
      });

      App.showToast(`Successfully registered ${newMember.name} (${newId})!`, "success");
    }

    document.getElementById("member-form-modal").classList.remove("active");
  },

  openProfileModal(id) {
    const m = this.getMemberById(id);
    if (!m) return;

    const modal = document.getElementById("member-profile-modal");
    if (!modal) return;

    const plan = MEMBERSHIP_PLANS.find(p => p.id === m.planId) || { name: "Standard Plan", price: 1000 };
    const batch = BATCH_TIMINGS.find(b => b.id === m.batchId) || { name: "General Batch", timeRange: "06:00 - 08:00 AM" };
    const routines = WorkoutsModule.getRoutines();
    const workout = routines[m.workoutId] || { name: m.workoutId || "Push - Pull - Legs" };
    const statusInfo = this.calculateStatus(m);

    document.getElementById("profile-modal-content").innerHTML = `
      <div style="display: flex; gap: 20px; align-items: center; border-bottom: 1px solid var(--titanium-border); padding-bottom: 20px; margin-bottom: 20px;">
        <div class="member-avatar" style="width: 64px; height: 64px; font-size: 1.5rem;">
          ${m.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
        </div>
        <div>
          <h3 style="font-size: 1.4rem; margin-bottom: 4px;">${m.name}</h3>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="badge ${statusInfo.class}">${statusInfo.label}</span>
            <span class="badge badge-silver">${m.id}</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">${m.gender || 'Member'}</span>
          </div>
        </div>
      </div>

      <div class="form-row-2" style="margin-bottom: 18px;">
        <div class="metallic-card" style="padding: 14px;">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Contact & Location</div>
          <div style="font-weight: 600; margin-top: 4px;">📞 ${m.phone}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">✉️ ${m.email || 'N/A'}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">📍 ${m.address}, PIN: ${m.pincode || '854105'}</div>
        </div>
        <div class="metallic-card" style="padding: 14px;">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Membership Status</div>
          <div style="font-weight: 600; margin-top: 4px;">${plan.name}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">Joined: ${m.joinDate}</div>
          <div style="font-size: 0.85rem; color: ${statusInfo.status === 'expired' ? 'var(--status-danger)' : 'var(--steel-cyan)'}; margin-top: 2px;">
            Expires: ${m.expiryDate} (${statusInfo.daysLeft >= 0 ? `${statusInfo.daysLeft} days left` : `Expired ${Math.abs(statusInfo.daysLeft)} days ago`})
          </div>
        </div>
      </div>

      <div class="form-row-2" style="margin-bottom: 20px;">
        <div class="metallic-card" style="padding: 14px;">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Assigned Batch Timing</div>
          <div style="font-weight: 600; margin-top: 4px; color: var(--steel-cyan);">${batch.name}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">⏰ ${batch.timeRange}</div>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">Last Check-in: ${m.lastCheckin || 'Never'}</div>
        </div>
        <div class="metallic-card" style="padding: 14px;">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Workout Routine</div>
          <div style="font-weight: 600; margin-top: 4px;">${workout.name}</div>
          <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">Goal: ${m.fitnessGoal || 'General Fitness'}</div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-outline btn-sm" onclick="WorkoutsModule.openAssignModal('${m.id}')">Change Workout</button>
        <button class="btn btn-primary btn-sm" onclick="AlertsModule.sendWhatsAppReminder('${m.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          WhatsApp Message
        </button>
      </div>
    `;

    modal.classList.add("active");
  },

  deleteMember(id) {
    const member = this.getMemberById(id);
    if (!member) return;

    if (confirm(`Are you sure you want to remove member ${member.name} (${member.id}) from Pro Health Fitness records?`)) {
      let members = this.getMembers();
      members = members.filter(m => m.id !== id);
      this.saveMembers(members);
      App.showToast(`Removed member ${member.name}`, "info");
    }
  }
};
