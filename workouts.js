/* ==========================================================================
   PRO HEALTH FITNESS - CUSTOMER WORKOUT SCHEDULE MODULE
   MG Road, Katihar, Bihar - 854105
   Schedule: Strictly Monday to Saturday (Editable & Deletable)
   ========================================================================== */

const WorkoutsModule = {
  currentActiveRoutineKey: "ppl",
  DAYS_OF_WEEK: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

  getRoutines() {
    const data = localStorage.getItem("phf_workout_templates");
    if (!data) {
      localStorage.setItem("phf_workout_templates", JSON.stringify(DEFAULT_WORKOUT_TEMPLATES));
      return DEFAULT_WORKOUT_TEMPLATES;
    }
    return JSON.parse(data);
  },

  saveRoutines(routines) {
    localStorage.setItem("phf_workout_templates", JSON.stringify(routines));
    this.renderRoutineSelector();
    this.renderRoutineSchedule(this.currentActiveRoutineKey);
  },

  init() {
    // Ensure active key exists
    const routines = this.getRoutines();
    if (!routines[this.currentActiveRoutineKey]) {
      const keys = Object.keys(routines);
      this.currentActiveRoutineKey = keys.length > 0 ? keys[0] : "ppl";
    }

    this.renderRoutineSelector();
    this.renderRoutineSchedule(this.currentActiveRoutineKey);
    this.populateMemberFilterDropdown();
  },

  renderRoutineSelector() {
    const container = document.getElementById("workout-routines-selector");
    if (!container) return;

    const routines = this.getRoutines();
    const routineKeys = Object.keys(routines);

    const buttonsHtml = routineKeys.map(key => {
      const r = routines[key];
      const isActive = key === this.currentActiveRoutineKey;
      return `
        <button class="routine-pill-btn ${isActive ? 'active' : ''}" onclick="WorkoutsModule.switchRoutine('${key}')">
          ${r.name}
        </button>
      `;
    }).join("");

    const actionButtonsHtml = `
      <button class="routine-pill-btn" style="border-style: dashed; color: var(--steel-cyan);" onclick="WorkoutsModule.promptNewRoutine()" title="Create New Custom Routine">
        + New Routine
      </button>
      ${routineKeys.length > 1 ? `
        <button class="routine-pill-btn" style="color: var(--status-danger);" onclick="WorkoutsModule.deleteCurrentRoutine()" title="Delete Current Routine">
          🗑️ Delete Routine
        </button>
      ` : ''}
    `;

    container.innerHTML = buttonsHtml + actionButtonsHtml;
  },

  switchRoutine(routineKey) {
    this.currentActiveRoutineKey = routineKey;
    this.renderRoutineSelector();
    this.renderRoutineSchedule(routineKey);
  },

  renderRoutineSchedule(routineKey, customMember = null) {
    const scheduleContainer = document.getElementById("routine-schedule-container");
    const headerTitle = document.getElementById("active-routine-name");
    const headerDesc = document.getElementById("active-routine-desc");
    if (!scheduleContainer) return;

    const routines = this.getRoutines();
    const routine = routines[routineKey] || routines[Object.keys(routines)[0]];

    if (!routine) {
      scheduleContainer.innerHTML = `
        <div class="metallic-card" style="padding: 40px; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">
          No workout routines found. Click '+ New Routine' to create one.
        </div>
      `;
      return;
    }

    if (headerTitle) {
      headerTitle.innerText = customMember 
        ? `${customMember.name}'s Routine: ${routine.name}` 
        : routine.name;
    }
    if (headerDesc) {
      headerDesc.innerText = customMember
        ? `Trainee Goal: ${customMember.fitnessGoal || 'General Fitness'} | Monday to Saturday Program`
        : `${routine.category} • Monday to Saturday Split (${routine.description || 'Custom schedule'})`;
    }

    // Strictly Monday to Saturday (No Sunday)
    scheduleContainer.innerHTML = this.DAYS_OF_WEEK.map(day => {
      const dayData = (routine.schedule && routine.schedule[day]) || { focus: `${day} Training`, exercises: [] };
      const exercises = dayData.exercises || [];

      const exercisesHtml = exercises.length > 0 ? exercises.map((ex, idx) => `
        <div class="exercise-item">
          <div class="exercise-details">
            <div class="exercise-title">${ex.name}</div>
            <div class="exercise-target">${ex.muscle}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="exercise-scheme">${ex.sets} × ${ex.reps}</div>
            <div class="exercise-actions" style="display: flex; gap: 4px;">
              <button class="btn btn-icon btn-sm" style="padding: 4px 6px;" title="Edit Exercise" onclick="WorkoutsModule.openExerciseModal('${day}', ${idx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn btn-icon btn-sm btn-danger" style="padding: 4px 6px;" title="Delete Exercise" onclick="WorkoutsModule.deleteExercise('${day}', ${idx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `).join("") : `
        <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.82rem; border: 1px dashed var(--titanium-border); border-radius: var(--radius-sm);">
          No exercises scheduled for ${day}.
        </div>
      `;

      return `
        <div class="metallic-card day-card">
          <div class="day-header">
            <div>
              <div class="day-name">${day}</div>
              <div class="day-focus" style="display: flex; align-items: center; gap: 6px;">
                <span>${dayData.focus}</span>
                <button class="btn btn-icon btn-sm" style="padding: 2px 4px; border: none; background: transparent;" title="Edit Day Focus" onclick="WorkoutsModule.editDayFocus('${day}')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-silver">${exercises.length} Ex</span>
              <button class="btn btn-secondary btn-sm" style="padding: 4px 8px; font-size: 0.75rem;" onclick="WorkoutsModule.openExerciseModal('${day}', -1)" title="Add exercise to ${day}">
                + Add
              </button>
            </div>
          </div>

          <div class="exercise-list">
            ${exercisesHtml}
          </div>
        </div>
      `;
    }).join("");
  },

  openExerciseModal(day, exerciseIndex = -1) {
    const modal = document.getElementById("exercise-modal");
    if (!modal) return;

    const routines = this.getRoutines();
    const routine = routines[this.currentActiveRoutineKey];
    if (!routine) return;

    document.getElementById("exercise-modal-routine").value = this.currentActiveRoutineKey;
    document.getElementById("exercise-modal-day").value = day;
    document.getElementById("exercise-modal-index").value = exerciseIndex;

    const dayData = (routine.schedule && routine.schedule[day]) || { exercises: [] };

    if (exerciseIndex >= 0 && dayData.exercises && dayData.exercises[exerciseIndex]) {
      const ex = dayData.exercises[exerciseIndex];
      document.getElementById("exercise-modal-title").innerText = `EDIT EXERCISE (${day})`;
      document.getElementById("exercise-name-input").value = ex.name;
      document.getElementById("exercise-muscle-input").value = ex.muscle;
      document.getElementById("exercise-sets-input").value = ex.sets;
      document.getElementById("exercise-reps-input").value = ex.reps;
    } else {
      document.getElementById("exercise-modal-title").innerText = `ADD EXERCISE TO ${day.toUpperCase()}`;
      document.getElementById("exercise-name-input").value = "";
      document.getElementById("exercise-muscle-input").value = "";
      document.getElementById("exercise-sets-input").value = "4 Sets";
      document.getElementById("exercise-reps-input").value = "10-12 Reps";
    }

    modal.classList.add("active");
  },

  saveExerciseFromModal(e) {
    e.preventDefault();
    const routineKey = document.getElementById("exercise-modal-routine").value;
    const day = document.getElementById("exercise-modal-day").value;
    const exerciseIndex = parseInt(document.getElementById("exercise-modal-index").value);

    const name = document.getElementById("exercise-name-input").value.trim();
    const muscle = document.getElementById("exercise-muscle-input").value.trim() || "Target Muscle";
    const sets = document.getElementById("exercise-sets-input").value.trim() || "3 Sets";
    const reps = document.getElementById("exercise-reps-input").value.trim() || "10-12 Reps";

    if (!name) {
      App.showToast("Please enter an exercise name", "error");
      return;
    }

    const routines = this.getRoutines();
    if (!routines[routineKey]) return;

    if (!routines[routineKey].schedule) {
      routines[routineKey].schedule = {};
    }
    if (!routines[routineKey].schedule[day]) {
      routines[routineKey].schedule[day] = { focus: `${day} Workout`, exercises: [] };
    }
    if (!routines[routineKey].schedule[day].exercises) {
      routines[routineKey].schedule[day].exercises = [];
    }

    const exerciseObj = { name, muscle, sets, reps };

    if (exerciseIndex >= 0) {
      // Edit existing
      routines[routineKey].schedule[day].exercises[exerciseIndex] = exerciseObj;
      App.showToast(`Updated exercise: ${name}`, "success");
    } else {
      // Add new
      routines[routineKey].schedule[day].exercises.push(exerciseObj);
      App.showToast(`Added ${name} to ${day}`, "success");
    }

    this.saveRoutines(routines);
    document.getElementById("exercise-modal").classList.remove("active");
  },

  deleteExercise(day, exerciseIndex) {
    const routines = this.getRoutines();
    const routine = routines[this.currentActiveRoutineKey];
    if (!routine || !routine.schedule || !routine.schedule[day] || !routine.schedule[day].exercises) return;

    const exName = routine.schedule[day].exercises[exerciseIndex].name;
    if (confirm(`Remove "${exName}" from ${day}'s workout schedule?`)) {
      routine.schedule[day].exercises.splice(exerciseIndex, 1);
      this.saveRoutines(routines);
      App.showToast(`Removed "${exName}" from ${day}`, "info");
    }
  },

  editDayFocus(day) {
    const routines = this.getRoutines();
    const routine = routines[this.currentActiveRoutineKey];
    if (!routine || !routine.schedule) return;

    const currentFocus = (routine.schedule[day] && routine.schedule[day].focus) || `${day} Focus`;
    const newFocus = prompt(`Enter target focus for ${day}:`, currentFocus);

    if (newFocus !== null && newFocus.trim() !== "") {
      if (!routine.schedule[day]) {
        routine.schedule[day] = { focus: newFocus.trim(), exercises: [] };
      } else {
        routine.schedule[day].focus = newFocus.trim();
      }
      this.saveRoutines(routines);
      App.showToast(`Updated ${day} focus to: ${newFocus.trim()}`, "success");
    }
  },

  promptNewRoutine() {
    const name = prompt("Enter Name for New Workout Routine (e.g. Strength & Conditioning 6-Day):");
    if (!name || !name.trim()) return;

    const key = name.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
    const routines = this.getRoutines();

    if (routines[key]) {
      App.showToast("A routine with this name already exists", "warning");
      return;
    }

    const schedule = {};
    this.DAYS_OF_WEEK.forEach(day => {
      schedule[day] = { focus: `${day} Workout`, exercises: [] };
    });

    routines[key] = {
      name: name.trim(),
      category: "Custom Split",
      description: "Monday to Saturday customized schedule.",
      schedule: schedule
    };

    this.currentActiveRoutineKey = key;
    this.saveRoutines(routines);
    App.showToast(`Created new routine: ${name.trim()}`, "success");
  },

  deleteCurrentRoutine() {
    const routines = this.getRoutines();
    const keys = Object.keys(routines);

    if (keys.length <= 1) {
      App.showToast("You cannot delete the only remaining routine", "warning");
      return;
    }

    const currentName = routines[this.currentActiveRoutineKey] ? routines[this.currentActiveRoutineKey].name : this.currentActiveRoutineKey;

    if (confirm(`Are you sure you want to permanently delete the routine "${currentName}"?`)) {
      delete routines[this.currentActiveRoutineKey];
      const remainingKeys = Object.keys(routines);
      this.currentActiveRoutineKey = remainingKeys[0];
      this.saveRoutines(routines);
      App.showToast(`Deleted routine "${currentName}"`, "info");
    }
  },

  filterByMemberRoutine() {
    const memberSelect = document.getElementById("workout-member-filter");
    if (!memberSelect) return;
    const memberId = memberSelect.value;
    
    if (!memberId) {
      this.switchRoutine(this.currentActiveRoutineKey);
      return;
    }

    const member = MembersModule.getMemberById(memberId);
    if (!member) return;

    const routineKey = member.workoutId || "ppl";
    this.currentActiveRoutineKey = routineKey;
    this.renderRoutineSelector();
    this.renderRoutineSchedule(routineKey, member);
  },

  populateMemberFilterDropdown() {
    const select = document.getElementById("workout-member-filter");
    if (!select) return;

    const members = MembersModule.getMembers();
    select.innerHTML = `<option value="">-- View Individual Member Plan --</option>` + members.map(m => `
      <option value="${m.id}">${m.name} (${m.id})</option>
    `).join("");
  },

  openAssignModal(memberId = "") {
    const modal = document.getElementById("assign-workout-modal");
    if (!modal) return;

    const select = document.getElementById("assign-workout-member");
    const members = MembersModule.getMembers();

    if (members.length === 0) {
      App.showToast("No members registered yet. Please add a member first.", "warning");
      return;
    }

    select.innerHTML = `<option value="">-- Select Member --</option>` + members.map(m => `
      <option value="${m.id}" ${m.id === memberId ? 'selected' : ''}>${m.name} (${m.id})</option>
    `).join("");

    const routineSelect = document.getElementById("assign-workout-plan");
    const routines = this.getRoutines();
    routineSelect.innerHTML = Object.keys(routines).map(k => `
      <option value="${k}">${routines[k].name}</option>
    `).join("");

    if (memberId) {
      const member = MembersModule.getMemberById(memberId);
      if (member && member.workoutId) {
        routineSelect.value = member.workoutId;
      }
    }

    modal.classList.add("active");
  },

  saveAssignedWorkout(e) {
    e.preventDefault();
    const memberId = document.getElementById("assign-workout-member").value;
    const workoutId = document.getElementById("assign-workout-plan").value;

    if (!memberId) {
      App.showToast("Please select a gym member", "error");
      return;
    }

    let members = MembersModule.getMembers();
    const index = members.findIndex(m => m.id === memberId);
    if (index !== -1) {
      members[index].workoutId = workoutId;
      MembersModule.saveMembers(members);
      const routines = this.getRoutines();
      const rName = routines[workoutId] ? routines[workoutId].name : workoutId;
      App.showToast(`Assigned ${rName} to ${members[index].name}!`, "success");
      this.renderRoutineSchedule(workoutId, members[index]);
    }

    document.getElementById("assign-workout-modal").classList.remove("active");
    this.populateMemberFilterDropdown();
  },

  printWorkoutSheet() {
    window.print();
  }
};
