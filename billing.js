/* ==========================================================================
   PRO HEALTH FITNESS - BILLING & INVOICE MODULE
   MG Road, Katihar, Bihar - 854105
   ========================================================================== */

const BillingModule = {
  getBills() {
    const data = localStorage.getItem("phf_bills");
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  },

  saveBills(bills) {
    localStorage.setItem("phf_bills", JSON.stringify(bills));
    App.refreshAllData();
  },

  recordBillDirectly(billData) {
    const bills = this.getBills();
    const nextBillNum = bills.length + 1;
    const billId = `INV-2026-${String(nextBillNum).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];

    const newBill = {
      billId: billId,
      memberId: billData.memberId,
      memberName: billData.memberName,
      planName: billData.planName,
      date: today,
      amount: billData.amount,
      paid: billData.paid,
      due: billData.due,
      paymentMode: billData.paymentMode || "Cash",
      status: billData.due > 0 ? "PARTIAL" : "PAID"
    };

    bills.unshift(newBill);
    this.saveBills(bills);
    return newBill;
  },

  renderBillingTable(filter = "all", searchQuery = "") {
    const tbody = document.getElementById("billing-table-body");
    if (!tbody) return;

    let bills = this.getBills();

    if (filter !== "all") {
      bills = bills.filter(b => b.status === filter);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      bills = bills.filter(b => 
        b.memberName.toLowerCase().includes(q) || 
        b.billId.toLowerCase().includes(q) || 
        b.memberId.toLowerCase().includes(q)
      );
    }

    if (bills.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 6px; color: #ffffff;">No invoices recorded yet</div>
            <div style="font-size: 0.85rem; margin-bottom: 14px;">Record membership fees or settle dues to generate receipts.</div>
            <button class="btn btn-primary btn-sm" onclick="BillingModule.openNewBillModal()">+ New Bill / Payment</button>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = bills.map(b => {
      const isPaid = b.status === "PAID";
      const badgeClass = isPaid ? "badge-active" : "badge-pending";

      return `
        <tr>
          <td>
            <div style="font-weight: 700; font-family: var(--font-heading); color: #ffffff;">${b.billId}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${b.date}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${b.memberName}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${b.memberId}</div>
          </td>
          <td>
            <div style="font-weight: 500;">${b.planName}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${b.paymentMode}</div>
          </td>
          <td style="font-weight: 700; font-family: var(--font-heading); color: #ffffff;">
            ₹${b.amount}
          </td>
          <td style="font-weight: 600; color: var(--status-active);">
            ₹${b.paid}
          </td>
          <td style="font-weight: 600; color: ${b.due > 0 ? 'var(--status-danger)' : 'var(--text-muted)'};">
            ${b.due > 0 ? `₹${b.due}` : '₹0'}
          </td>
          <td>
            <div class="table-actions">
              <span class="badge ${badgeClass}" style="margin-right: 6px;">${b.status}</span>
              <button class="btn btn-icon btn-sm" title="Print Invoice Receipt" onclick="BillingModule.openPrintInvoice('${b.billId}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  openNewBillModal() {
    const modal = document.getElementById("new-bill-modal");
    if (!modal) return;

    const members = MembersModule.getMembers();
    const select = document.getElementById("bill-member-select");
    
    select.innerHTML = `<option value="">-- Choose Gym Member --</option>` + members.map(m => `
      <option value="${m.id}">${m.name} (${m.id}) - ${m.phone}</option>
    `).join("");

    document.getElementById("bill-type-select").value = "plan_renewal";
    document.getElementById("bill-plan-select").value = "plan_monthly";
    document.getElementById("bill-amount").value = "1000";
    document.getElementById("bill-paid").value = "1000";
    document.getElementById("bill-due").value = "0";
    document.getElementById("bill-payment-mode").value = "UPI / PhonePe";

    modal.classList.add("active");
  },

  openNewBillForMember(memberId) {
    this.openNewBillModal();
    const select = document.getElementById("bill-member-select");
    if (select) {
      select.value = memberId;
      this.onMemberSelected();
    }
  },

  onMemberSelected() {
    const memberId = document.getElementById("bill-member-select").value;
    if (!memberId) return;

    const member = MembersModule.getMemberById(memberId);
    if (!member) return;

    // Check if member has pending dues
    if (member.amountDue > 0) {
      document.getElementById("bill-type-select").value = "dues_clearance";
      document.getElementById("bill-amount").value = member.amountDue;
      document.getElementById("bill-paid").value = member.amountDue;
      document.getElementById("bill-due").value = 0;
    } else {
      document.getElementById("bill-type-select").value = "plan_renewal";
      document.getElementById("bill-plan-select").value = member.planId;
      const plan = MEMBERSHIP_PLANS.find(p => p.id === member.planId) || MEMBERSHIP_PLANS[0];
      document.getElementById("bill-amount").value = plan.price;
      document.getElementById("bill-paid").value = plan.price;
      document.getElementById("bill-due").value = 0;
    }
  },

  onBillTypeChanged() {
    const type = document.getElementById("bill-type-select").value;
    const planGroup = document.getElementById("bill-plan-group");
    const memberId = document.getElementById("bill-member-select").value;
    const member = memberId ? MembersModule.getMemberById(memberId) : null;

    if (type === "dues_clearance") {
      if (planGroup) planGroup.style.display = "none";
      const due = member ? member.amountDue : 0;
      document.getElementById("bill-amount").value = due;
      document.getElementById("bill-paid").value = due;
      document.getElementById("bill-due").value = 0;
    } else {
      if (planGroup) planGroup.style.display = "block";
      this.onPlanSelected();
    }
  },

  onPlanSelected() {
    const planId = document.getElementById("bill-plan-select").value;
    const plan = MEMBERSHIP_PLANS.find(p => p.id === planId) || MEMBERSHIP_PLANS[0];
    document.getElementById("bill-amount").value = plan.price;
    document.getElementById("bill-paid").value = plan.price;
    document.getElementById("bill-due").value = 0;
  },

  onPaidAmountChange() {
    const total = parseFloat(document.getElementById("bill-amount").value) || 0;
    const paid = parseFloat(document.getElementById("bill-paid").value) || 0;
    const due = Math.max(0, total - paid);
    document.getElementById("bill-due").value = due;
  },

  saveBillFromForm(e) {
    e.preventDefault();
    const memberId = document.getElementById("bill-member-select").value;
    if (!memberId) {
      App.showToast("Please select a gym member", "error");
      return;
    }

    const member = MembersModule.getMemberById(memberId);
    if (!member) return;

    const billType = document.getElementById("bill-type-select").value;
    const planId = document.getElementById("bill-plan-select").value;
    const plan = MEMBERSHIP_PLANS.find(p => p.id === planId) || MEMBERSHIP_PLANS[0];
    const total = parseFloat(document.getElementById("bill-amount").value) || 0;
    const paid = parseFloat(document.getElementById("bill-paid").value) || 0;
    const due = parseFloat(document.getElementById("bill-due").value) || 0;
    const paymentMode = document.getElementById("bill-payment-mode").value;

    let planName = billType === "dues_clearance" ? "Previous Dues Clearance" : plan.name;

    // Record invoice
    const newBill = this.recordBillDirectly({
      memberId: member.id,
      memberName: member.name,
      planName: planName,
      amount: total,
      paid: paid,
      due: due,
      paymentMode: paymentMode
    });

    // Update Member Record
    let members = MembersModule.getMembers();
    const mIndex = members.findIndex(m => m.id === member.id);
    if (mIndex !== -1) {
      if (billType === "dues_clearance") {
        members[mIndex].amountDue = Math.max(0, members[mIndex].amountDue - paid);
      } else {
        // Membership Renewal
        members[mIndex].planId = planId;
        members[mIndex].amountPaid += paid;
        members[mIndex].amountDue = due;
        
        // Extend Expiry Date
        const currentExp = new Date(members[mIndex].expiryDate);
        const today = new Date();
        const baseDate = currentExp > today ? currentExp : today;
        baseDate.setDate(baseDate.getDate() + plan.durationDays);
        members[mIndex].expiryDate = baseDate.toISOString().split("T")[0];
        members[mIndex].status = "active";
      }
      MembersModule.saveMembers(members);
    }

    document.getElementById("new-bill-modal").classList.remove("active");
    App.showToast(`Invoice ${newBill.billId} generated successfully!`, "success");

    // Automatically preview printable receipt
    this.openPrintInvoice(newBill.billId);
  },

  openPrintInvoice(billId) {
    const bills = this.getBills();
    const bill = bills.find(b => b.billId === billId);
    if (!bill) return;

    const member = MembersModule.getMemberById(bill.memberId) || {
      name: bill.memberName,
      phone: "N/A",
      address: "MG Road, Katihar",
      pincode: "854105"
    };

    const modal = document.getElementById("invoice-print-modal");
    if (!modal) return;

    const invoiceContainer = document.getElementById("printable-invoice-content");
    invoiceContainer.innerHTML = `
      <div class="invoice-paper">
        <div class="invoice-header">
          <div class="invoice-brand">
            <h2>${GYM_CONFIG.name}</h2>
            <p style="font-weight: 700; color: #1e293b;">${GYM_CONFIG.tagline}</p>
            <p>${GYM_CONFIG.address} - PIN ${GYM_CONFIG.pincode}</p>
            <p>Phone: ${GYM_CONFIG.phone} | Email: ${GYM_CONFIG.email}</p>
            <p>GSTIN: ${GYM_CONFIG.gstin}</p>
          </div>
          <div class="invoice-meta-box">
            <div class="invoice-badge-title">OFFICIAL RECEIPT</div>
            <div class="invoice-meta-row"><strong>Receipt No:</strong> ${bill.billId}</div>
            <div class="invoice-meta-row"><strong>Date:</strong> ${bill.date}</div>
            <div class="invoice-meta-row"><strong>Payment Mode:</strong> ${bill.paymentMode}</div>
            <div class="invoice-meta-row"><strong>Status:</strong> <span style="color: ${bill.status === 'PAID' ? '#16a34a' : '#ea580c'}; font-weight: 800;">${bill.status}</span></div>
          </div>
        </div>

        <div class="invoice-bill-to">
          <div>
            <h4>Billed To (Gym Member)</h4>
            <p style="font-size: 1.05rem;">${bill.memberName}</p>
            <p style="font-weight: normal; font-size: 0.82rem; color: #475569;">Member ID: <strong>${bill.memberId}</strong></p>
            <p style="font-weight: normal; font-size: 0.82rem; color: #475569;">Phone: ${member.phone || 'N/A'}</p>
          </div>
          <div>
            <h4>Member Address</h4>
            <p style="font-weight: normal; font-size: 0.85rem; color: #334155;">
              ${member.address || 'MG Road, Katihar'}<br>
              PIN: ${member.pincode || '854105'}, Bihar, India
            </p>
            <p style="font-weight: normal; font-size: 0.82rem; color: #475569; margin-top: 4px;">
              Gym Operating Hours: 05:30 AM - 10:30 PM
            </p>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description / Service Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: 700;">${bill.planName}</div>
                <div style="font-size: 0.78rem; color: #64748b;">Fitness Training, Strength Equipment & Cardio Access</div>
              </td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">₹${bill.amount}</td>
              <td style="text-align: right; font-weight: 700;">₹${bill.amount}</td>
            </tr>
          </tbody>
        </table>

        <div class="invoice-summary">
          <table class="invoice-summary-table">
            <tr>
              <td>Subtotal:</td>
              <td>₹${bill.amount}</td>
            </tr>
            <tr>
              <td>GST / Tax (Included):</td>
              <td>₹0.00</td>
            </tr>
            <tr class="total-row">
              <td>Grand Total:</td>
              <td>₹${bill.amount}</td>
            </tr>
            <tr>
              <td style="color: #16a34a; font-weight: 700;">Amount Received:</td>
              <td style="color: #16a34a; font-weight: 700;">₹${bill.paid}</td>
            </tr>
            ${bill.due > 0 ? `
              <tr>
                <td style="color: #dc2626; font-weight: 700;">Balance Due:</td>
                <td style="color: #dc2626; font-weight: 700;">₹${bill.due}</td>
              </tr>
            ` : ''}
          </table>
        </div>

        <div class="invoice-footer">
          <div>
            <p><strong>Terms & Conditions:</strong></p>
            <p>1. Fees once paid are non-refundable & non-transferable.</p>
            <p>2. Proper gym shoes and personal towel are mandatory on the floor.</p>
            <p>3. Keep Katihar fit and healthy!</p>
          </div>
          <div class="signature-box">
            <p style="font-size: 0.72rem; color: #64748b; margin-bottom: 25px;">PRO HEALTH FITNESS</p>
            Authorized Signature
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
  },

  printInvoiceModal() {
    window.print();
  }
};
