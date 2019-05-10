function hamburgerSwitch() {
  let toggle = document.getElementById("myLinks");
  if (toggle.style.display === "block") {
    toggle.style.display = "none";
  } else {
    toggle.style.display = "block";
  }
}

document.getElementById("togglingForm").addEventListener('click', formToggle);

function formToggle() {
  let toggle = document.getElementById("classToggle");
  toggle.classList.toggle("hidden-toggle");
}