/* ==========================================================================
   PRO HEALTH FITNESS - DEFAULT DATA & CONSTANTS
   MG Road, Katihar, Bihar - 854105
   ========================================================================== */

const GYM_CONFIG = {
  name: "Pro Health Fitness",
  tagline: "Iron Sharpens Iron • Elite Fitness Center",
  address: "MG Road, Katihar, Bihar, India",
  pincode: "854105",
  phone: "+91 98351 28940",
  email: "support@prohealthfitness.in",
  gstin: "10AAKCP1294F1Z8",
  operatingHours: {
    weekdays: "05:30 AM - 10:30 PM",
    sunday: "06:00 AM - 01:00 PM"
  }
};

const MEMBERSHIP_PLANS = [
  { id: "plan_monthly", name: "Monthly Standard", durationDays: 30, price: 1000, description: "Full Gym Access + Cardio + Locker" },
  { id: "plan_quarterly", name: "Quarterly Pro", durationDays: 90, price: 2700, description: "Full Gym + Free Diet Chart + Cardio" },
  { id: "plan_halfyearly", name: "Half-Yearly Elite", durationDays: 180, price: 5000, description: "All Access + Trainer Guidance + 1 Month Freeze" },
  { id: "plan_annual", name: "Annual Titan", durationDays: 365, price: 9000, description: "VIP Access + Nutritionist Consultation + Gym Kit" },
  { id: "plan_pt", name: "Monthly + Personal Training", durationDays: 30, price: 4200, description: "Dedicated 1-on-1 Fitness Coach + Custom Diet" }
];

const BATCH_TIMINGS = [
  { id: "batch_1", name: "Morning Early Bird", timeRange: "05:30 AM - 07:30 AM", capacity: 30, startHour: 5.5, endHour: 7.5 },
  { id: "batch_2", name: "Morning Prime", timeRange: "07:30 AM - 09:30 AM", capacity: 35, startHour: 7.5, endHour: 9.5 },
  { id: "batch_3", name: "Women's Special", timeRange: "10:30 AM - 12:00 PM", capacity: 25, startHour: 10.5, endHour: 12.0 },
  { id: "batch_4", name: "Afternoon Power", timeRange: "01:00 PM - 04:00 PM", capacity: 25, startHour: 13.0, endHour: 16.0 },
  { id: "batch_5", name: "Evening Rush", timeRange: "05:00 PM - 08:00 PM", capacity: 40, startHour: 17.0, endHour: 20.0 },
  { id: "batch_6", name: "Night Iron", timeRange: "08:00 PM - 10:30 PM", capacity: 30, startHour: 20.0, endHour: 22.5 }
];

/* Default Workout Templates (Monday to Saturday Only - Sunday Removed) */
const DEFAULT_WORKOUT_TEMPLATES = {
  "ppl": {
    name: "Push - Pull - Legs (6-Day Split)",
    category: "Hypertrophy & Muscle Building",
    description: "High efficiency split training each muscle group twice a week (Monday to Saturday).",
    schedule: {
      "Monday": {
        focus: "Push (Chest, Shoulders & Triceps)",
        exercises: [
          { name: "Barbell Flat Bench Press", sets: "4 Sets", reps: "8-10 Reps", muscle: "Chest" },
          { name: "Incline Dumbbell Press", sets: "3 Sets", reps: "10-12 Reps", muscle: "Upper Chest" },
          { name: "Standing Overhead Dumbbell Press", sets: "4 Sets", reps: "8-10 Reps", muscle: "Delts" },
          { name: "Cable Lateral Raises", sets: "4 Sets", reps: "12-15 Reps", muscle: "Side Delts" },
          { name: "Rope Tricep Pushdowns", sets: "3 Sets", reps: "12-15 Reps", muscle: "Triceps" },
          { name: "Overhead EZ-Bar Extensions", sets: "3 Sets", reps: "10-12 Reps", muscle: "Triceps" }
        ]
      },
      "Tuesday": {
        focus: "Pull (Back & Biceps)",
        exercises: [
          { name: "Deadlift / Rack Pulls", sets: "4 Sets", reps: "6-8 Reps", muscle: "Back / Traps" },
          { name: "Lat Pulldowns (Wide Grip)", sets: "4 Sets", reps: "10-12 Reps", muscle: "Lats" },
          { name: "Seated Cable Rows", sets: "3 Sets", reps: "10-12 Reps", muscle: "Mid Back" },
          { name: "Face Pulls", sets: "4 Sets", reps: "15 Reps", muscle: "Rear Delts" },
          { name: "Incline Dumbbell Bicep Curls", sets: "3 Sets", reps: "10-12 Reps", muscle: "Biceps" },
          { name: "Hammer Curls with Rope", sets: "3 Sets", reps: "12-15 Reps", muscle: "Forearms / Brachialis" }
        ]
      },
      "Wednesday": {
        focus: "Legs & Core",
        exercises: [
          { name: "Barbell Back Squats", sets: "4 Sets", reps: "8-10 Reps", muscle: "Quads & Glutes" },
          { name: "Leg Press 45-Degree", sets: "4 Sets", reps: "12 Reps", muscle: "Quads" },
          { name: "Romanian Dumbbell Deadlifts", sets: "3 Sets", reps: "10-12 Reps", muscle: "Hamstrings" },
          { name: "Leg Curl Machine", sets: "3 Sets", reps: "12-15 Reps", muscle: "Hamstrings" },
          { name: "Standing Calf Raises", sets: "4 Sets", reps: "15-20 Reps", muscle: "Calves" },
          { name: "Hanging Leg Raises", sets: "3 Sets", reps: "15 Reps", muscle: "Abs" }
        ]
      },
      "Thursday": {
        focus: "Push Hypertrophy",
        exercises: [
          { name: "Incline Barbell Press", sets: "4 Sets", reps: "8-10 Reps", muscle: "Chest" },
          { name: "Dips (Chest Focus)", sets: "3 Sets", reps: "10-12 Reps", muscle: "Lower Chest" },
          { name: "Dumbbell Arnold Press", sets: "3 Sets", reps: "10-12 Reps", muscle: "Shoulders" },
          { name: "Pec Deck Flyes", sets: "3 Sets", reps: "12-15 Reps", muscle: "Chest" },
          { name: "Skull Crushers", sets: "3 Sets", reps: "10-12 Reps", muscle: "Triceps" }
        ]
      },
      "Friday": {
        focus: "Pull Width & Detail",
        exercises: [
          { name: "Weighted Pull-Ups / Lat Machine", sets: "4 Sets", reps: "8-10 Reps", muscle: "Lats" },
          { name: "Barbell Bent-Over Rows", sets: "4 Sets", reps: "8-10 Reps", muscle: "Thickness" },
          { name: "Single Arm Dumbbell Row", sets: "3 Sets", reps: "10 Reps each", muscle: "Lats" },
          { name: "Preacher Curls EZ-Bar", sets: "3 Sets", reps: "10-12 Reps", muscle: "Biceps" },
          { name: "Reverse Cable Flyes", sets: "4 Sets", reps: "15 Reps", muscle: "Rear Delts" }
        ]
      },
      "Saturday": {
        focus: "Legs & Functional Core",
        exercises: [
          { name: "Front Squats / Goblet Squats", sets: "4 Sets", reps: "10 Reps", muscle: "Quads" },
          { name: "Walking Lunges with Dumbbells", sets: "3 Sets", reps: "12 Steps each", muscle: "Glutes/Quads" },
          { name: "Seated Leg Extensions", sets: "4 Sets", reps: "15 Reps (Drop set)", muscle: "Quads" },
          { name: "Seated Calf Raises", sets: "4 Sets", reps: "15-20 Reps", muscle: "Calves" },
          { name: "Cable Woodchoppers & Plank", sets: "3 Sets", reps: "60 Sec", muscle: "Obliques/Core" }
        ]
      }
    }
  },
  "fat_loss": {
    name: "Fat Loss & HIIT Conditioning",
    category: "Weight Loss & Stamina",
    description: "Dynamic circuits combined with strength maintenance to shred fat (Monday to Saturday).",
    schedule: {
      "Monday": {
        focus: "Full Body Metabolic Circuit",
        exercises: [
          { name: "Kettlebell Swings", sets: "4 Sets", reps: "20 Reps", muscle: "Full Body" },
          { name: "Goblet Squats to Overhead Press", sets: "4 Sets", reps: "12 Reps", muscle: "Quads & Shoulders" },
          { name: "Battle Ropes Waves", sets: "4 Sets", reps: "30 Sec", muscle: "Conditioning" },
          { name: "Box Jumps / Step-Ups", sets: "3 Sets", reps: "15 Reps", muscle: "Power" },
          { name: "Treadmill Incline Sprints", sets: "10 Mins", reps: "30s Sprint / 30s Walk", muscle: "Cardio" }
        ]
      },
      "Tuesday": {
        focus: "Upper Body & Core Burn",
        exercises: [
          { name: "Push-ups to Renegade Rows", sets: "4 Sets", reps: "10 Reps", muscle: "Chest & Back" },
          { name: "Dumbbell Thrusters", sets: "4 Sets", reps: "12 Reps", muscle: "Full Body" },
          { name: "Mountain Climbers", sets: "4 Sets", reps: "40 Sec", muscle: "Core" },
          { name: "Plank Shoulder Taps", sets: "3 Sets", reps: "20 Reps", muscle: "Core" },
          { name: "Elliptical HIIT Intervals", sets: "15 Mins", reps: "Level 8-12", muscle: "Cardio" }
        ]
      },
      "Wednesday": {
        focus: "Lower Body Conditioning",
        exercises: [
          { name: "Barbell Romanian Deadlifts", sets: "4 Sets", reps: "12 Reps", muscle: "Hamstrings" },
          { name: "Bodyweight Jump Squats", sets: "4 Sets", reps: "15 Reps", muscle: "Quads" },
          { name: "Walking Lunges", sets: "3 Sets", reps: "20 Steps", muscle: "Legs" },
          { name: "Rowing Machine Sprint", sets: "5 Rounds", reps: "250 Meters", muscle: "Cardio" }
        ]
      },
      "Thursday": {
        focus: "Cardio Shred & Abs",
        exercises: [
          { name: "Spin Bike Intervals", sets: "20 Mins", reps: "High RPM", muscle: "Cardio" },
          { name: "Hanging Knee Raises", sets: "4 Sets", reps: "15 Reps", muscle: "Abs" },
          { name: "Russian Twists with Medicine Ball", sets: "4 Sets", reps: "20 Reps", muscle: "Obliques" },
          { name: "Burpees", sets: "4 Sets", reps: "12 Reps", muscle: "Full Body" }
        ]
      },
      "Friday": {
        focus: "Full Body Strength Circuit",
        exercises: [
          { name: "Hex Bar Deadlifts", sets: "4 Sets", reps: "10 Reps", muscle: "Posterior Chain" },
          { name: "Dumbbell Floor Press", sets: "4 Sets", reps: "12 Reps", muscle: "Chest" },
          { name: "Lat Pulldown Machine", sets: "4 Sets", reps: "12 Reps", muscle: "Back" },
          { name: "Farmer's Walk", sets: "4 Sets", reps: "40 Meters", muscle: "Grip / Traps" }
        ]
      },
      "Saturday": {
        focus: "Endurance & Agility",
        exercises: [
          { name: "Jump Rope / Skipping", sets: "5 Rounds", reps: "2 Mins", muscle: "Cardio" },
          { name: "Agility Ladder Drills", sets: "4 Sets", reps: "Drill Mix", muscle: "Speed" },
          { name: "Sled Push / Tyre Flips", sets: "4 Sets", reps: "20 Meters", muscle: "Power" }
        ]
      }
    }
  },
  "bro_split": {
    name: "Classic Muscle Bro Split (6-Day)",
    category: "Bodybuilding",
    description: "Focus on hammering one specific muscle group intensely each day (Monday to Saturday).",
    schedule: {
      "Monday": {
        focus: "Chest Day",
        exercises: [
          { name: "Flat Barbell Bench Press", sets: "4 Sets", reps: "8-10 Reps", muscle: "Mid Chest" },
          { name: "Incline Dumbbell Press", sets: "4 Sets", reps: "10 Reps", muscle: "Upper Chest" },
          { name: "Decline Barbell Press", sets: "3 Sets", reps: "10-12 Reps", muscle: "Lower Chest" },
          { name: "Cable Crossover Flyes", sets: "4 Sets", reps: "12-15 Reps", muscle: "Chest Inner" },
          { name: "Parallel Bar Dips", sets: "3 Sets", reps: "To Failure", muscle: "Chest" }
        ]
      },
      "Tuesday": {
        focus: "Back Day",
        exercises: [
          { name: "Conventional Deadlifts", sets: "4 Sets", reps: "6 Reps", muscle: "Erectors / Back" },
          { name: "Wide Grip Lat Pulldown", sets: "4 Sets", reps: "10 Reps", muscle: "Upper Lats" },
          { name: "Bent-Over T-Bar Rows", sets: "4 Sets", reps: "8-10 Reps", muscle: "Mid Back" },
          { name: "Close-Grip Seated Cable Row", sets: "3 Sets", reps: "12 Reps", muscle: "Lower Lats" },
          { name: "Hyperextensions", sets: "3 Sets", reps: "15 Reps", muscle: "Lower Back" }
        ]
      },
      "Wednesday": {
        focus: "Shoulders & Traps",
        exercises: [
          { name: "Overhead Military Barbell Press", sets: "4 Sets", reps: "8 Reps", muscle: "Anterior Delts" },
          { name: "Dumbbell Lateral Raises", sets: "5 Sets", reps: "12-15 Reps", muscle: "Lateral Delts" },
          { name: "Rear Delt Dumbbell Flyes", sets: "4 Sets", reps: "12-15 Reps", muscle: "Rear Delts" },
          { name: "Barbell Shrugs (Heavy)", sets: "4 Sets", reps: "12 Reps", muscle: "Upper Traps" },
          { name: "Front Dumbbell Raises", sets: "3 Sets", reps: "12 Reps", muscle: "Front Delts" }
        ]
      },
      "Thursday": {
        focus: "Legs (Quad & Hamstring Overload)",
        exercises: [
          { name: "Barbell Back Squats", sets: "5 Sets", reps: "8-10 Reps", muscle: "Quads" },
          { name: "Heavy Leg Press", sets: "4 Sets", reps: "12 Reps", muscle: "Quads / Glutes" },
          { name: "Lying Leg Curls", sets: "4 Sets", reps: "12 Reps", muscle: "Hamstrings" },
          { name: "Stiff Leg Dumbbell Deadlifts", sets: "3 Sets", reps: "10 Reps", muscle: "Hamstrings" },
          { name: "Standing & Seated Calf Raises", sets: "5 Sets", reps: "15-20 Reps", muscle: "Calves" }
        ]
      },
      "Friday": {
        focus: "Arms (Biceps & Triceps)",
        exercises: [
          { name: "Barbell Bicep Curls", sets: "4 Sets", reps: "10 Reps", muscle: "Biceps" },
          { name: "Close-Grip Bench Press", sets: "4 Sets", reps: "8-10 Reps", muscle: "Triceps" },
          { name: "Incline Dumbbell Hammer Curls", sets: "3 Sets", reps: "12 Reps", muscle: "Brachialis" },
          { name: "Skullcrushers with EZ Bar", sets: "3 Sets", reps: "10-12 Reps", muscle: "Triceps Long Head" },
          { name: "Concentration Curls", sets: "3 Sets", reps: "12 Reps", muscle: "Bicep Peak" },
          { name: "Cable Rope Pushdowns", sets: "4 Sets", reps: "15 Reps (Burnout)", muscle: "Triceps" }
        ]
      },
      "Saturday": {
        focus: "Abs, Core & Conditioning",
        exercises: [
          { name: "Hanging Leg Raises", sets: "4 Sets", reps: "15 Reps", muscle: "Abs" },
          { name: "Cable Crunches", sets: "4 Sets", reps: "15 Reps", muscle: "Upper Abs" },
          { name: "Side Planks", sets: "3 Sets", reps: "45 Sec each", muscle: "Obliques" },
          { name: "Treadmill Incline Walk", sets: "25 Mins", reps: "Speed 5.5 / Inc 10", muscle: "Cardio" }
        ]
      }
    }
  }
};

/* Empty Initial Data - No Sample Data */
const SEED_MEMBERS = [];
const SEED_BILLS = [];
