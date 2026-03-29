// ========== Fade-Up on Scroll ==========
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ========== Typing Animation in Hero Phone ==========
const typingText = document.querySelector('.typing-text');
const cursorEl = document.querySelector('.cursor');
const aiResponse = document.getElementById('aiResponse');
const responseIcon = document.getElementById('responseIcon');
const responseTitle = document.getElementById('responseTitle');
const responseDetail = document.getElementById('responseDetail');

const phrases = [
  { text: 'he just ate 5oz',       icon: '\u{1F37C}', title: 'Feed logged',     detail: '5 oz \u00B7 2:34 PM' },
  { text: 'nap from 1 to 3pm',     icon: '\u{1F4A4}', title: 'Nap logged',      detail: '2 hrs \u00B7 1:00 - 3:00 PM' },
  { text: 'wet diaper just now',    icon: '\u{1F6BD}', title: 'Diaper logged',   detail: 'Wet \u00B7 4:15 PM' },
  { text: 'she weighs 4.1kg',      icon: '\u2696\uFE0F', title: 'Weight recorded', detail: '4.1 kg (9.0 lbs) \u00B7 Today' },
];

let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;
let pauseTimer = null;

function typeLoop() {
  const phrase = phrases[phraseIdx];

  if (!isDeleting) {
    charIdx++;
    typingText.textContent = phrase.text.slice(0, charIdx);

    if (charIdx === phrase.text.length) {
      // Update response card to match current phrase
      responseIcon.textContent = phrase.icon;
      responseTitle.textContent = phrase.title;
      responseDetail.textContent = phrase.detail;
      aiResponse.classList.add('show');
      pauseTimer = setTimeout(() => {
        isDeleting = true;
        setTimeout(() => aiResponse.classList.remove('show'), 200);
        typeLoop();
      }, 2200);
      return;
    }
    setTimeout(typeLoop, 50 + Math.random() * 40);
  } else {
    charIdx--;
    typingText.textContent = phrase.text.slice(0, charIdx);

    if (charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(typeLoop, 400);
      return;
    }
    setTimeout(typeLoop, 25);
  }
}

// Start typing after a short delay
setTimeout(typeLoop, 1200);

