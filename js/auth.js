/**
 * SERENOVA — Centered Authentication helpers
 * Used by standalone login.html / signup.html (/ register.html).
 * Depends on js/main.js (window.Serenova: Toast, Modal, FormValidation).
 * Vanilla ES6+ only. All features degrade gracefully.
 */

'use strict';

(function () {
  var EYE_OPEN = '<svg class="icon icon-stroke" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF = '<svg class="icon icon-stroke" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>';

  function toast(payload) {
    if (window.Serenova && window.Serenova.Toast) {
      window.Serenova.Toast.show(payload);
    }
  }

  /* Password visibility toggles: [data-auth-toggle] controls nearest input */
  function initToggles(root) {
    var toggles = (root || document).querySelectorAll('[data-auth-toggle]');
    toggles.forEach(function (btn) {
      var wrap = btn.closest('.authx-pw, .input-icon-wrap');
      var input = wrap ? wrap.querySelector('input[type="password"], input[type="text"]') : null;
      if (!input) return;
      btn.addEventListener('click', function () {
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? EYE_OFF : EYE_OPEN;
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        btn.setAttribute('aria-pressed', show ? 'true' : 'false');
        input.focus({ preventScroll: true });
      });
    });
  }

  /* Strength meter for the main password field */
  function initStrength() {
    var input = document.getElementById('auth-password');
    var bar = document.getElementById('auth-strength-bar');
    var label = document.getElementById('auth-strength-label');
    if (!input || !bar || !label) return;

    var labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    var colors = ['', '#e74c3c', '#f39c12', '#2ecc71', '#27ae60'];

    input.addEventListener('input', function () {
      var v = input.value;
      var score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      bar.style.width = (score * 25) + '%';
      bar.style.background = colors[score] || 'transparent';
      label.textContent = score > 0 ? ('Strength: ' + labels[score]) : 'Enter password to see strength';
      label.style.color = colors[score] || '';
    });
  }

  /* Confirm-password live matching */
  function initConfirmMatch() {
    var main = document.getElementById('auth-password');
    var confirm = document.getElementById('auth-password-confirm');
    if (!main || !confirm) return;

    function check() {
      var group = confirm.closest('.form-group');
      var err = group ? group.querySelector('.form-error') : null;
      var mismatch = confirm.value.length > 0 && confirm.value !== main.value;
      confirm.classList.toggle('error', mismatch);
      if (err) {
        err.textContent = mismatch ? 'Passwords do not match' : '';
        err.style.display = mismatch ? 'flex' : 'none';
      }
      return !mismatch;
    }

    confirm.addEventListener('blur', check);
    confirm.addEventListener('input', function () {
      if (confirm.classList.contains('error')) check();
    });
    main.addEventListener('input', function () {
      if (confirm.value) check();
    });
  }

  /* Forgot-password modal trigger (frontend-only, reuses global Modal) */
  function initForgot() {
    var link = document.getElementById('auth-forgot-link');
    if (!link) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.Serenova && window.Serenova.Modal) {
        window.Serenova.Modal.open('auth-forgot');
      }
    });

    var resetForm = document.getElementById('auth-reset-form');
    if (resetForm) {
      resetForm.addEventListener('validsubmit', function () {
        toast({ title: 'Reset link sent!', message: 'Check your email for reset instructions.', type: 'success' });
        if (window.Serenova && window.Serenova.Modal) {
          window.Serenova.Modal.close('auth-forgot');
        }
      });
    }
  }

  /* Login submit -> dashboard (existing intended flow) */
  function initLoginForm() {
    var form = document.getElementById('auth-login-form');
    if (!form) return;
    form.addEventListener('validsubmit', function () {
      toast({ title: 'Signing you in...', message: 'Welcome back to Serenova!', type: 'success', duration: 2200 });
      setTimeout(function () { window.location.href = 'client-dashboard.html'; }, 2200);
    });
  }

  /* Signup submit -> dashboard (existing intended flow) */
  function initSignupForm() {
    var form = document.getElementById('auth-signup-form');
    if (!form) return;
    form.addEventListener('validsubmit', function () {
      var confirm = document.getElementById('auth-password-confirm');
      var main = document.getElementById('auth-password');
      if (confirm && main && confirm.value !== main.value) {
        confirm.classList.add('error');
        var err = confirm.closest('.form-group');
        err = err ? err.querySelector('.form-error') : null;
        if (err) { err.textContent = 'Passwords do not match'; err.style.display = 'flex'; }
        toast({ title: 'Please fix the errors', type: 'error' });
        return;
      }
      toast({ title: 'Account created!', message: 'Welcome to Serenova! Redirecting...', type: 'success', duration: 2600 });
      setTimeout(function () { window.location.href = 'client-dashboard.html'; }, 2600);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initToggles(document);
    initStrength();
    initConfirmMatch();
    initForgot();
    initLoginForm();
    initSignupForm();
  });
})();
