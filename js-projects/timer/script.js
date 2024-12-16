let timerInterval;
let remainingTime = 0; // Stores the remaining time in seconds
let isRunning = false; // Tracks if the timer is currently running

// Format seconds into HH:MM:SS format
function formatTime(seconds) {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${secs}`;
}

// Function to play a beep sound from a file
function playBeep() {
  const beepSound = document.getElementById("beepSound");
  beepSound.currentTime = 0; // Reset sound to start
  beepSound.play(); // Play the sound
}

// Start or resume the timer
function startTimer() {
  if (!isRunning && remainingTime > 0) {
    isRunning = true;
    timerInterval = setInterval(() => {
      if (remainingTime > 0) {
        remainingTime--; // Decrement remaining time
        document.querySelector("#timer span").textContent =
          formatTime(remainingTime); // Update display
      } else {
        timerEnd(); // Stop when it reaches zero
      }
    }, 1000); // Update every second
  }
}

function timerEnd() {
  stopTimer(); // Stop when it reaches zero
  playBeep(); // Play sound
  // alert('ההפסקית הסתיימה!');
}

// Stop the timer
function stopTimer() {
  clearInterval(timerInterval); // Clear the interval
  isRunning = false; // Set running to false
}

// Reset the timer
function resetTimer() {
  stopTimer();
  remainingTime = 0; // Reset remaining time
  document.querySelector("#timer span").textContent = formatTime(remainingTime); // Update display
}

// Additional functionality for preset times (e.g., 20:00, 45:00, 1:00:00 buttons)
document.querySelectorAll(".buttons button").forEach((button) => {
  button.addEventListener("click", () => {
    const timeInput = button.textContent; // Get the time text
    const timeParts = timeInput.split(":").map(Number); // Split by colon and parse to numbers

    let hours = 0, minutes = 0, seconds = 0;

    // Handle cases based on the number of parts (hh:mm:ss, mm:ss, ss)
    if (timeParts.length === 3) {
      [hours, minutes, seconds] = timeParts;
    } else if (timeParts.length === 2) {
      [minutes, seconds] = timeParts;
    } else if (timeParts.length === 1) {
      [seconds] = timeParts;
    }

    // Calculate the total remaining time in seconds
    remainingTime = hours * 3600 + minutes * 60 + seconds;

    // Update the timer display
    document.querySelector("#timer span").textContent = formatTime(remainingTime);

    // Stop the timer if it's currently running
    if (isRunning) stopTimer();
  });
});


// Handling custom time input with the "זמן אחר" button
document.getElementById("customTimeButton").addEventListener("click", () => {
  const hoursInput = document.getElementById("hours").value; // Get hours input
  const minutesInput = document.getElementById("minutes").value; // Get minutes input
  const secondsInput = document.getElementById("seconds").value; // Get seconds input

  const hours = parseInt(hoursInput) || 0; // Convert to integer, default to 0
  const minutes = parseInt(minutesInput) || 0; // Convert to integer, default to 0
  const seconds = parseInt(secondsInput) || 0; // Convert to integer, default to 0

  remainingTime = hours * 3600 + minutes * 60 + seconds; // Update the global remainingTime
  document.querySelector("#timer span").textContent = formatTime(remainingTime); // Update display
  if (isRunning) stopTimer(); // Stop if running to avoid double intervals
});

// Event listeners for start, stop, and reset buttons
document.getElementById("startButton").addEventListener("click", startTimer); // Start
document.getElementById("stopButton").addEventListener("click", stopTimer); // Stop
document.getElementById("resetButton").addEventListener("click", resetTimer); // Reset
