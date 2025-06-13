document.addEventListener('DOMContentLoaded', () => {
    const guessInput = document.getElementById('guessInput');
    const submitGuessButton = document.getElementById('submitGuess');
    const feedbackDisplay = document.getElementById('feedback');
    const attemptsDisplay = document.getElementById('attempts');

    let randomNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;

    submitGuessButton.addEventListener('click', () => {
        const userGuess = parseInt(guessInput.value);
        attempts++;

        if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
            feedbackDisplay.textContent = 'Please enter a valid number between 1 and 100.';
            return;
        }

        if (userGuess === randomNumber) {
            feedbackDisplay.textContent = `Correct! You guessed the number ${randomNumber} in ${attempts} attempts.`;
            feedbackDisplay.style.color = 'green';
            submitGuessButton.disabled = true; // Disable further guesses
            // Optionally, offer a way to restart the game
            // e.g., by showing a "Play Again" button that reloads the page or resets the game state.
        } else if (userGuess < randomNumber) {
            feedbackDisplay.textContent = 'Too low! Try again.';
            feedbackDisplay.style.color = 'red';
        } else {
            feedbackDisplay.textContent = 'Too high! Try again.';
            feedbackDisplay.style.color = 'red';
        }
        attemptsDisplay.textContent = `Attempts: ${attempts}`;
        guessInput.value = ''; // Clear the input field
        guessInput.focus();
    });
});
