const xpEl = document.getElementById("xp");
const xpGoalEl = document.getElementById("xp-goal");
const xpBar = document.getElementById("xp-bar");
const levelEl = document.getElementById("level");
const badgeCountEl = document.getElementById("badge-count");
const streakEl = document.getElementById("streak");
const toast = document.getElementById("toast");
const badgeGrid = document.getElementById("badge-grid");

const state = {
  xp: 0,
  level: 1,
  xpGoal: 300,
  streak: 0,
  badges: new Set(),
};

const badges = [
  { id: "resolver", label: "Resolver Rookie", threshold: 100 },
  { id: "cache", label: "Cache Commander", threshold: 220 },
  { id: "guardian", label: "Zone Guardian", threshold: 380 },
];

const labChallenges = [
  {
    prompt: "A user types a domain in the browser and needs the IP address.",
    correct: "A",
    options: ["A", "MX", "TXT", "CNAME"],
    tip: "A records map domains to IPv4 addresses.",
  },
  {
    prompt: "You want to point one subdomain to another domain name.",
    correct: "CNAME",
    options: ["AAAA", "CNAME", "SRV", "TXT"],
    tip: "CNAME aliases one name to another.",
  },
  {
    prompt: "Your mail server priority needs to be defined.",
    correct: "MX",
    options: ["MX", "A", "NS", "CAA"],
    tip: "MX records route email with priorities.",
  },
  {
    prompt: "Publish SPF rules to protect against spoofing.",
    correct: "TXT",
    options: ["TXT", "NS", "PTR", "CAA"],
    tip: "TXT records store SPF and DMARC policies.",
  },
];

const quizQuestions = [
  {
    question: "What does a recursive resolver do first?",
    answer: "Checks its cache",
    options: ["Contacts the registry", "Checks its cache", "Updates the zone", "Issues a TLS cert"],
  },
  {
    question: "Which setting controls how long DNS data is cached?",
    answer: "TTL",
    options: ["SOA", "TTL", "NS", "SRV"],
  },
  {
    question: "Which role sells domain names to customers?",
    answer: "Registrar",
    options: ["Registry", "Registrar", "Resolver", "Authoritative server"],
  },
  {
    question: "DNSSEC primarily protects against what?",
    answer: "Record tampering",
    options: ["Record tampering", "Slow routing", "Expired domains", "Cloud outages"],
  },
];

let labIndex = 0;
let quizIndex = 0;
let labAnswered = false;
let quizAnswered = false;

function updateStats() {
  xpEl.textContent = state.xp;
  xpGoalEl.textContent = state.xpGoal;
  levelEl.textContent = state.level;
  badgeCountEl.textContent = state.badges.size;
  streakEl.textContent = `${state.streak} days`;
  xpBar.style.width = `${Math.min((state.xp / state.xpGoal) * 100, 100)}%`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function gainXp(amount, reason = "XP gained!") {
  state.xp += amount;
  if (state.xp >= state.xpGoal) {
    state.level += 1;
    state.xp -= state.xpGoal;
    state.xpGoal = Math.round(state.xpGoal * 1.2);
    showToast("Level up! New powers unlocked.");
  } else {
    showToast(reason);
  }
  unlockBadges();
  updateStats();
}

function unlockBadges() {
  badges.forEach((badge) => {
    if (state.level >= 2 && state.xp + state.level * 100 >= badge.threshold) {
      state.badges.add(badge.id);
    }
  });
  badgeGrid.innerHTML = badges
    .map((badge) => {
      const unlocked = state.badges.has(badge.id);
      return `<div class="badge ${unlocked ? "unlocked" : "locked"}">${badge.label}</div>`;
    })
    .join("");
}

function renderLab() {
  const challenge = labChallenges[labIndex];
  document.getElementById("lab-question").textContent = challenge.prompt;
  const optionsContainer = document.getElementById("lab-options");
  optionsContainer.innerHTML = "";
  labAnswered = false;
  challenge.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "secondary option-button";
    button.textContent = option;
    button.addEventListener("click", () => handleLabAnswer(option));
    optionsContainer.appendChild(button);
  });
}

function handleLabAnswer(answer) {
  if (labAnswered) {
    return;
  }
  labAnswered = true;
  const feedback = document.getElementById("lab-feedback");
  const challenge = labChallenges[labIndex];
  const optionButtons = document.querySelectorAll("#lab-options .option-button");
  optionButtons.forEach((button) => {
    button.disabled = true;
    button.classList.add(button.textContent === challenge.correct ? "correct" : "wrong");
  });
  if (answer === challenge.correct) {
    feedback.textContent = `Correct! ${challenge.tip}`;
    gainXp(35, "Lab success! +35 XP");
  } else {
    feedback.textContent = `Not quite. ${challenge.tip}`;
  }
}

function renderQuiz() {
  const question = quizQuestions[quizIndex];
  document.getElementById("quiz-question").textContent = question.question;
  document.getElementById("quiz-progress").textContent = `Question ${quizIndex + 1} of ${quizQuestions.length}`;
  const optionsContainer = document.getElementById("quiz-options");
  optionsContainer.innerHTML = "";
  quizAnswered = false;
  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "secondary option-button";
    button.textContent = option;
    button.addEventListener("click", () => handleQuizAnswer(option));
    optionsContainer.appendChild(button);
  });
}

function handleQuizAnswer(answer) {
  if (quizAnswered) {
    return;
  }
  quizAnswered = true;
  const feedback = document.getElementById("quiz-feedback");
  const question = quizQuestions[quizIndex];
  const optionButtons = document.querySelectorAll("#quiz-options .option-button");
  optionButtons.forEach((button) => {
    button.disabled = true;
    button.classList.add(button.textContent === question.answer ? "correct" : "wrong");
  });
  if (answer === question.answer) {
    state.streak += 1;
    gainXp(50, "Quiz streak! +50 XP");
    feedback.textContent = "Correct! Streak extended.";
  } else {
    state.streak = 0;
    feedback.textContent = `Oops! The right answer is ${question.answer}.`;
  }
  updateStats();
}

function setupButtons() {
  document.getElementById("earn-xp").addEventListener("click", () => gainXp(50));
  document.getElementById("view-badges").addEventListener("click", () => {
    badgeGrid.scrollIntoView({ behavior: "smooth" });
  });

  document.querySelectorAll(".mission-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) {
        return;
      }
      const xp = Number(button.dataset.xp);
      gainXp(xp, `Mission complete! +${xp} XP`);
      button.disabled = true;
      button.textContent = "Mission Complete";
    });
  });

  document.getElementById("next-lab").addEventListener("click", () => {
    labIndex = (labIndex + 1) % labChallenges.length;
    document.getElementById("lab-feedback").textContent = "Pick the right record to win XP.";
    renderLab();
  });

  document.getElementById("next-quiz").addEventListener("click", () => {
    quizIndex = (quizIndex + 1) % quizQuestions.length;
    document.getElementById("quiz-feedback").textContent = "Choose the best answer.";
    renderQuiz();
  });

  const suffixButtons = document.querySelectorAll(".chip");
  suffixButtons.forEach((button) => {
    button.addEventListener("click", () => {
      suffixButtons.forEach((chip) => chip.classList.remove("active"));
      button.classList.add("active");
    });
  });

  document.getElementById("check-domain").addEventListener("click", () => {
    const name = document.getElementById("domain-name").value.trim();
    const suffix = document.querySelector(".chip.active")?.dataset.suffix;
    const status = document.getElementById("domain-status");
    if (!name || !suffix) {
      status.textContent = "Pick a name and suffix to check.";
      return;
    }
    const available = Math.random() > 0.4;
    if (available) {
      status.textContent = `${name}${suffix} is available! Lock it in.`;
      gainXp(40, "Availability win! +40 XP");
    } else {
      status.textContent = `${name}${suffix} is taken. Try a new twist.`;
    }
  });

  document.getElementById("register-domain").addEventListener("click", () => {
    const checklist = document.querySelectorAll("#registrar-list input");
    const completed = Array.from(checklist).filter((item) => item.checked).length;
    if (completed >= 3) {
      gainXp(80, "Domain registered! +80 XP");
      showToast("Domain secured! Welcome to the registry.");
    } else {
      showToast("Complete at least 3 checklist items to register.");
    }
  });

  document.getElementById("start-adventure").addEventListener("click", () => {
    document.getElementById("mission-board").scrollIntoView({ behavior: "smooth" });
  });
}

updateStats();
unlockBadges();
renderLab();
renderQuiz();
setupButtons();
