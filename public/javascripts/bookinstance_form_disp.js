var status_input = document.getElementById("status");
var due_back_input = document.getElementById("due_back");
var due_back_disp = document.getElementById("due_back_disp");

// Check on load
document.addEventListener("DOMContentLoaded", (e) => {
  if (status_input.value == "Loaned") {
    due_back_disp.classList.remove("d-none");
  } else {
    due_back_input.value = "";
    due_back_disp.classList.add("d-none");
  }
});

// Check on change
status_input.addEventListener("change", (e) => {
  if (e.target.value == "Loaned") {
    due_back_disp.classList.remove("d-none");
  } else {
    due_back_input.value = "";
    due_back_disp.classList.add("d-none");
  }
});
