// ===== CONFIG =====
const API_URL = 'http://localhost:7001';


// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('portalTheme') || 'light';
html.setAttribute('data-theme', savedTheme);
themeToggle.checked = savedTheme === 'dark';

themeToggle.addEventListener('change', () => {
  const theme = themeToggle.checked ? 'dark' : 'light';
  html.setAttribute('data-theme', theme);
  localStorage.setItem('portalTheme', theme);
});


// ===== STATE =====
let currentTab  = 'login';    // 'login' | 'signup'
let currentRole = 'student';  // 'student' | 'teacher'


// ===== SWITCH TAB =====
function switchTab(tab) {
  currentTab = tab;

  const loginForm  = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabLogin   = document.getElementById('tabLogin');
  const tabSignup  = document.getElementById('tabSignup');

  if (tab === 'login') {
    loginForm.style.display  = 'block';
    signupForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    loginForm.style.display  = 'none';
    signupForm.style.display = 'block';
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
  }

  updateHeadings();
}


// ===== SWITCH ROLE =====
function switchRole(role) {
  currentRole = role;

  document.getElementById('roleStudent').classList.toggle('active', role === 'student');
  document.getElementById('roleTeacher').classList.toggle('active', role === 'teacher');

  const loginIdInput = document.getElementById('loginId');
  if (loginIdInput) {
    loginIdInput.placeholder = role === 'student' ? 'Student ID or Email' : 'Teacher ID or Email';
  }

  const signupIdInput = document.getElementById('signupId');
  if (signupIdInput) {
    signupIdInput.placeholder = role === 'teacher' ? 'Teacher ID / Employee ID' : 'Student ID';
  }

  const adminNotice = document.getElementById('adminNotice');
  if (adminNotice) {
    adminNotice.style.display = (role === 'teacher' && currentTab === 'login') ? 'block' : 'none';
  }

  updateHeadings();
}


// ===== UPDATE HEADINGS =====
function updateHeadings() {
  const title = document.getElementById('formTitle');
  const sub   = document.getElementById('formSub');
  const roleLabel = currentRole === 'student' ? 'Student' : 'Teacher';

  if (currentTab === 'login') {
    title.textContent = `${roleLabel} Login`;
    sub.textContent   = 'Login to your account to continue';
  } else {
    title.textContent = `${roleLabel} Sign Up`;
    sub.textContent   = `Create your ${roleLabel.toLowerCase()} account`;
  }

  const adminNotice = document.getElementById('adminNotice');
  if (adminNotice) {
    adminNotice.style.display =
      (currentRole === 'teacher' && currentTab === 'login') ? 'block' : 'none';
  }
}


// ===== PASSWORD VISIBILITY =====
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}


// ===== SHOW TOAST =====
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = 'toast' + (isError ? ' error' : '');
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}


// ===== HANDLE LOGIN =====
async function handleLogin() {
  const id   = document.getElementById('loginId').value.trim();
  const pass = document.getElementById('loginPass').value.trim();

  if (!id)   { showToast('Please enter your ID or Email', true); return; }
  if (!pass) { showToast('Please enter your password', true); return; }
  if (pass.length < 4) {
    showToast('Password must be at least 4 characters', true);
    return;
  }

  showToast('Logging in...');

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: id, password: pass, role: currentRole }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || 'Login failed', true);
      return;
    }

    localStorage.setItem('uits_token', data.token);
    localStorage.setItem('uits_user', JSON.stringify(data.user));
    showToast(`✅ Welcome back, ${data.user.firstName}!`);

    setTimeout(() => {
      window.location.href = currentRole === 'student'
        ? './DashBoard/dashboard.html'
        : './TeacherPanel/teacher.html';
    }, 1000);

  } catch {
    showToast('Cannot reach server. Is the backend running?', true);
  }
}


// ===== HANDLE SIGN UP =====
async function handleSignup() {
  const signupForm = document.getElementById('signupForm');
  const inputs     = signupForm.querySelectorAll('input');

  const firstName = inputs[0].value.trim();
  const lastName  = inputs[1].value.trim();
  const email     = inputs[2].value.trim();
  const roleId    = inputs[3].value.trim();
  const dept      = inputs[4].value.trim();
  const pass      = document.getElementById('signupPass').value.trim();
  const pass2     = document.getElementById('signupPass2').value.trim();

  if (!firstName) { showToast('Please enter your first name', true); return; }
  if (!lastName)  { showToast('Please enter your last name', true); return; }
  if (!email)     { showToast('Please enter your email', true); return; }
  if (!validateEmail(email)) { showToast('Please enter a valid email', true); return; }
  if (!roleId)    {
    showToast(`Please enter your ${currentRole === 'student' ? 'Student' : 'Employee'} ID`, true);
    return;
  }
  if (!dept)      { showToast('Please enter your department', true); return; }
  if (!pass)      { showToast('Please enter a password', true); return; }
  if (pass.length < 6) { showToast('Password must be at least 6 characters', true); return; }
  if (pass !== pass2)  { showToast('Passwords do not match', true); return; }

  showToast('Creating your account...');

  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        roleId,
        department: dept,
        password: pass,
        role: currentRole,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || 'Signup failed', true);
      return;
    }

    const roleLabel = currentRole === 'student' ? 'Student' : 'Teacher';
    showToast(`✅ ${roleLabel} account created! Please log in.`);
    setTimeout(() => switchTab('login'), 1800);

  } catch {
    showToast('Cannot reach server. Is the backend running?', true);
  }
}


// ===== EMAIL VALIDATOR =====
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ===== MODAL HELPERS =====
function openForgotPassword() {
  document.getElementById('forgotModal').style.display = 'flex';
}

function openAdminInfo() {
  document.getElementById('adminModal').style.display = 'flex';
}

function hideModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

function submitForgotPassword() {
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email || !validateEmail(email)) {
    showToast('Please enter a valid email address', true);
    return;
  }
  showToast('📧 Reset link sent! Check your inbox.');
  hideModal('forgotModal');
  document.getElementById('forgotEmail').value = '';
}


// ===== ENTER KEY SUPPORT =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (currentTab === 'login') handleLogin();
    else                        handleSignup();
  }
});


// ===== INIT =====
updateHeadings();
