let questions = [];
let currentIndex = -1;
let score = 0;
let asked = 0;

const scoreEl = document.getElementById("score");
const qnumEl = document.getElementById("qnum");
const qtotalEl = document.getElementById("qtotal");
const categoryEl = document.getElementById("category");
const promptEl = document.getElementById("prompt");
const choicesEl = document.getElementById("choices");

const resultWrap = document.getElementById("result");
const resultBadge = document.getElementById("resultBadge");
const answerText = document.getElementById("answerText");
const explainEl = document.getElementById("explain");
const sourcesList = document.getElementById("sourcesList");

const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setScore() {
  scoreEl.textContent = String(score);
}

function setCounters() {
  qnumEl.textContent = String(asked);
  qtotalEl.textContent = String(questions.length);
}

function clearResult() {
  resultWrap.classList.add("hidden");
  resultBadge.textContent = "";
  resultBadge.className = "badge";
  answerText.textContent = "";
  explainEl.textContent = "";
  sourcesList.innerHTML = "";
}

function disableChoices() {
  const btns = choicesEl.querySelectorAll("button");
  btns.forEach((b) => (b.disabled = true));
}

function renderSources(sources) {
  sourcesList.innerHTML = "";
  for (const s of sources) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = `${s.title} (${s.publisher})`;
    li.appendChild(a);
    sourcesList.appendChild(li);
  }
}

function showQuestion() {
  clearResult();

  if (!questions.length) {
    categoryEl.textContent = "No questions loaded";
    promptEl.textContent = "Add questions to questions.json";
    choicesEl.innerHTML = "";
    return;
  }

  currentIndex++;
  if (currentIndex >= questions.length) {
    currentIndex = 0;
    questions = shuffle(questions);
  }

  const q = questions[currentIndex];
  asked += 1;

  categoryEl.textContent = q.category;
  promptEl.textContent = q.prompt;

  choicesEl.innerHTML = "";
  q.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.type = "button";
    btn.textContent = choice;
    btn.addEventListener("click", () => handleAnswer(choice));
    choicesEl.appendChild(btn);
  });

  setCounters();
}

function handleAnswer(choice) {
  const q = questions[currentIndex];
  const correct = choice === q.answer;

  disableChoices();

  if (correct) score += 1;
  setScore();

  resultWrap.classList.remove("hidden");
  resultBadge.textContent = correct ? "Correct" : "Not quite";
  resultBadge.classList.add(correct ? "good" : "bad");

  answerText.textContent = `Answer: ${q.answer}`;
  explainEl.textContent = q.explain || "";
  renderSources(q.sources || []);
}

function resetGame() {
  score = 0;
  asked = 0;
  currentIndex = -1;
  setScore();
  setCounters();
  showQuestion();
}

async function init() {
  try {
    const res = await fetch("questions.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load questions.json (${res.status})`);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("questions.json must be an array");
    questions = shuffle(data);

    setScore();
    setCounters();
    showQuestion();
  } catch (err) {
    categoryEl.textContent = "Error loading questions";
    promptEl.textContent = String(err.message || err);
    choicesEl.innerHTML = "";
    resultWrap.classList.add("hidden");
  }
}

nextBtn.addEventListener("click", showQuestion);
resetBtn.addEventListener("click", resetGame);

init();
