document.addEventListener('DOMContentLoaded', () => {
    const rockButton = document.getElementById('rock');
    const paperButton = document.getElementById('paper');
    const scissorsButton = document.getElementById('scissors');
    const playerChoiceDisplay = document.getElementById('player-choice');
    const computerChoiceDisplay = document.getElementById('computer-choice');
    const resultDisplay = document.getElementById('result');

    const choices = ['rock', 'paper', 'scissors'];

    rockButton.addEventListener('click', () => playGame('rock'));
    paperButton.addEventListener('click', () => playGame('paper'));
    scissorsButton.addEventListener('click', () => playGame('scissors'));

    function playGame(playerChoice) {
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];

        playerChoiceDisplay.textContent = playerChoice;
        computerChoiceDisplay.textContent = computerChoice;

        if (playerChoice === computerChoice) {
            resultDisplay.textContent = "It's a tie!";
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            resultDisplay.textContent = 'You win!';
        } else {
            resultDisplay.textContent = 'Computer wins!';
        }
    }
});
