/* ===== avatar.js =====
   Avatar helpers: shows the six avatars and lets the user pick one.
   Images must be saved as: avatars/avatar1.png ... avatars/avatar6.png
*/
const AVATAR_COUNT = 6;
const DEFAULT_AVATAR = 1;

function avatarSrc(n) {
  return "ffverse avatars/avatar" + n + ".png";
}

// Makes sure the value is a whole number from 1 to 6.
function normalizeAvatar(value) {
  const n = parseInt(value, 10);
  return n >= 1 && n <= AVATAR_COUNT ? n : DEFAULT_AVATAR;
}

// Creates an <img> for an avatar. If the image file is missing,
// it shows a purple circle with the avatar number instead.
function makeAvatarImg(n, className) {
  const img = document.createElement("img");
  img.src = avatarSrc(n);
  img.alt = "Avatar " + n;
  img.className = className || "";
  img.addEventListener("error", function () {
    const fallback = document.createElement("span");
    fallback.className = (className || "") + " avatar-fallback";
    fallback.textContent = String(n);
    img.replaceWith(fallback);
  });
  return img;
}

// Draws the six choices inside `container` and returns { get() }.
function renderAvatarPicker(container, selected, onChange) {
  let current = normalizeAvatar(selected);
  container.textContent = "";

  const buttons = [];
  for (let i = 1; i <= AVATAR_COUNT; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "avatar-option";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-label", "Avatar " + i);
    btn.appendChild(makeAvatarImg(i, "avatar-img"));
    btn.addEventListener("click", function () {
      current = i;
      paint();
      if (typeof onChange === "function") onChange(current);
    });
    buttons.push(btn);
    container.appendChild(btn);
  }

  function paint() {
    buttons.forEach(function (b, idx) {
      const on = idx + 1 === current;
      b.classList.toggle("selected", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
  }
  paint();

  return { get: function () { return current; } };
}


