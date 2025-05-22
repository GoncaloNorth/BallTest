
function startGame() {
  const username = document.getElementById('username').value;
  if (!username) {
    alert("Please enter a username");
    return;
  }
  localStorage.setItem('username', username);
  document.getElementById('menu-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  // Initialize game
  console.log("Game started for", username);
}
