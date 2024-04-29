window.onload = function () {
			// Detect screen size
			let screenWidth = window.innerWidth;
			let screenHeight = window.innerHeight;
			if (screenWidth < 768) {
				// Pequeno, ajuste o tamanho do bloco e o número de linhas e colunas
				blockSize = 10;
				totalRows = 30;
				totalCols = 35;
			} else if (screenWidth > 768) {
				// Grande, use os valores padrão
				blockSize = 20;
				totalRows = 30;
				totalCols = 35;
			}
			alert("tela Width:" + screenWidth + " height:" + screenHeight );
            let board;
            let context;
            let snakeX = blockSize * 5;
            let snakeY = blockSize * 5;
            let speedX = 0; // Speed of snake in X coordinate.
            let speedY = 0; // Speed of snake in Y coordinate.
            let snakeBody = [];
            let foodX;
            let foodY;
            let foodImage;
            let gameOver = false;
            let score = 0;
            let level = 0;
            let interval = 200; // Initial speed
            let intervalId;
            let isSuperFood = false; // Flag to indicate if the food is a superfood
            let paused = false;    // Variável para controlar se o jogo está pausado
            
            // Load food images
            let foodImages = ["imgs/food.png", "imgs/food2.png", "imgs/food3.png", "imgs/food4.png", "imgs/food5.png"];
            // Load food image
            function loadFoodImage() {
                // Select a random index to load in the foodImages array
                                let randomIndex = Math.floor(Math.random() * foodImages.length);
                foodImage.src = foodImages[randomIndex];
            }
            // Check if the snake hits the wall and adjust its position
			function checkWallCollision() {
				if (snakeX < 0) {
					snakeX = totalCols * blockSize - blockSize; // Move a cobra para a borda direita
				} else if (snakeX >= totalCols * blockSize) {
					snakeX = 0; // Move a cobra para a borda esquerda
				} else if (snakeY < 0) {
					snakeY = totalRows * blockSize - blockSize; // Move a cobra para a borda inferior
				} else if (snakeY >= totalRows * blockSize) {
					snakeY = 0; // Move a cobra para a borda superior
				}
			}
			// Place food on the board
			function placeFood() {
				foodX = Math.floor(Math.random() * totalCols) * blockSize;
				foodY = Math.floor(Math.random() * totalRows) * blockSize;
				// Add a 20% chance of being a super food
				isSuperFood = Math.random() < 0.2;
				if (isSuperFood) {
					// Superfood effect lasts for 5 seconds (5000 milliseconds)
					superFoodTimer = 5000;
					// Superfood starts with a score of 5 points
					scoreForSuperFood = 5;
					foodImage = new Image();
					foodImage.src = "imgs/superfood.png";
				} else {
					// Regular food
					superFoodTimer = 0;
					scoreForSuperFood = 1;
					foodImage = new Image();
					foodImage.src = "imgs/food.png";
				}

				// Draw the food on the board
								context.drawImage(foodImage, foodX, foodY, isSuperFood ? blockSize * 1 : blockSize * 0.95, isSuperFood ? blockSize * 1 : blockSize * 0.95);
												// Load food image for the next food
												loadFoodImage();
																return scoreForSuperFood;
			}
			// Update game state
			function update() {
				if (gameOver) {
				  updateBestScore(); // Atualizar o melhor recorde
					// Exibir tela de Game Over
					document.getElementById("gameOverScore").textContent = score;
					let bestScore = localStorage.getItem("bestScore");
					document.getElementById("gameOverBestScore").textContent = bestScore ? bestScore : 0;
					document.getElementById("gameOverScreen").style.display = "block";
				  					return;
				}

				// Check snake body collision
				for (let i = 0; i < snakeBody.length; i++) {
					if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
						gameOver = true;
						//alert("Game Over");
						updateBestScore();
						return; // Exit early to prevent further updates
					}
				}
				// Update snake position
				for (let i = snakeBody.length - 1; i > 0; i--) {
					snakeBody[i] = snakeBody[i - 1];
				}
				if (snakeBody.length) {
					snakeBody[0] = [snakeX, snakeY];
				}
				checkWallCollision();
				context.fillStyle = "green";
				context.fillRect(0, 0, board.width, board.height);
				context.drawImage(foodImage, foodX, foodY, isSuperFood ? blockSize * 1 : blockSize * 0.95, isSuperFood ? blockSize * 1 : blockSize * 0.95);
				if (snakeX === foodX && snakeY === foodY) {
					snakeBody.push([foodX, foodY]);
					placeFood();
					score += (isSuperFood ? 2 : 1);
					document.getElementById("score").textContent = "Pontuação: " + score;
					if (score % 10 === 1) {
						level++;
						document.getElementById("level").textContent = "Nível: " + level;
						updateSpeed();
					}
				}
				for (let i = snakeBody.length - 1; i > 0; i--) {
					snakeBody[i] = snakeBody[i - 1];
				}
				if (snakeBody.length) {
					snakeBody[0] = [snakeX, snakeY];
				}
				context.fillStyle = "white";
				snakeX += speedX * blockSize;
				snakeY += speedY * blockSize;
				context.fillRect(snakeX, snakeY, blockSize, blockSize);
				for (let i = 0; i < snakeBody.length; i++) {
					let segmentX = snakeBody[i][0];
					let segmentY = snakeBody[i][1];
					context.fillStyle = "white";
					context.fillRect(segmentX, segmentY, blockSize, blockSize);
					if (isBorderSegment(segmentX, segmentY)) {
						context.strokeStyle = "black";
						context.strokeRect(segmentX, segmentY, blockSize, blockSize);
					}
				}
			}
			function isBorderSegment(segmentX, segmentY) {
				if (segmentX % blockSize === 0 && segmentY % blockSize === 0) {
					return true;
				}
				for (let i = 0; i < snakeBody.length; i++) {
					if (segmentX === snakeBody[i][0] && segmentY === snakeBody[i][1]) {
						return true;
					}
				}
				return false;
			}
			function updateSpeed() {
				interval -= 5;
				clearInterval(intervalId);
				intervalId = setInterval(update, interval);
			}
			function changeDirection(e) {
				if ((e.code === "ArrowUp" || e.key === "w") && speedY !== 1) {
					speedX = 0;
					speedY = -1;
				} else if ((e.code === "ArrowDown" || e.key === "s") && speedY !== -1) {
					speedX = 0;
					speedY = 1;
				} else if ((e.code === "ArrowLeft" || e.key === "a") && speedX !== 1) {
					speedX = -1;
					speedY = 0;
				} else if ((e.code === "ArrowRight" || e.key === "d") && speedX !== -1) {
					speedX = 1;
					speedY = 0;
				} else if (e.code === "Space") {
					resetGame();
				}
			}
			
			function resetGame() {

				//resetf
				if (!gameOver) {
                if (paused) {
                    // Se estiver pausado, continue o jogo
                    intervalId = setInterval(update, interval);
                    paused = false;
                } else {
                    // Se não estiver pausado, pause o jogo
                    clearInterval(intervalId);
                    paused = true;
                }
} else {
  snakeX = blockSize * 5;

				snakeY = blockSize * 5;

				speedX = 0;
				speedY = 0;
				snakeBody = [];
				score = 0;
				level = 0;
				gameOver = false;
            document.getElementById("score").textContent = "Pontuação: " + score;
            document.getElementById("level").textContent = "Nível: " + level;
            document.getElementById("gameOverScreen").style.display = "none"; // Esconder tela de Game Over
  }

			}

			function updateBestScore() {
			  let bestScore = localStorage.getItem("bestScore");
				if (!bestScore || score > parseInt(bestScore)) {
					localStorage.setItem("bestScore", score);
					document.getElementById("bestscore").textContent = "Recorde: " + score;
				}
			}
			const joystick = document.getElementById('joystick');
			joystick.addEventListener('touchstart', handleTouchStart);
			joystick.addEventListener('touchmove', handleTouchMove);
			joystick.addEventListener('touchend', handleTouchEnd);
			let startX, startY;
			function handleTouchStart(event) {
				startX = event.touches[0].clientX;
				startY = event.touches[0].clientY;
			}
			function handleTouchMove(event) {
				event.preventDefault();
				let endX = event.touches[0].clientX;
				let endY = event.touches[0].clientY;
				let deltaX = endX - startX;
				let deltaY = endY - startY;
				if (Math.abs(deltaX) > Math.abs(deltaY)) {
					if (deltaX > 0 && speedX !== -1) {
						speedX = 1;
						speedY = 0;
					} else if (deltaX < 0 && speedX !== 1) {
						speedX = -1;
						speedY = 0;
					}
				} else {
					if (deltaY > 0 && speedY !== -1) {
						speedX = 0;
						speedY = 1;
					} else if (deltaY < 0 && speedY !== 1) {
						speedX = 0;
						speedY = -1;
					}
				}
			}
			function handleTouchEnd(event) {
				// Você pode adicionar código aqui se quiser realizar alguma ação quando o toque no joystick terminar
			}
			// Set up the game board
			board = document.getElementById("board");
			board.height = totalRows * blockSize;
			board.width = totalCols * blockSize;
			context = board.getContext("2d");
			// Load food image
			foodImage = new Image();
			foodImage.onload = function () {
				placeFood();
				document.addEventListener("keyup", changeDirection);
				intervalId = setInterval(update, interval);
				document.getElementById("reset").addEventListener("click", resetGame);
				document.getElementById("restart").addEventListener("click", resetGame);
								// Load best score from localStorage
				let bestScore = localStorage.getItem("bestScore");
								if (bestScore) {
					document.getElementById("bestscore").textContent = "Recorde: " + bestScore;
				}
			};
			// Load food image for the next food
			loadFoodImage(); // Chame a função aqui
			}
