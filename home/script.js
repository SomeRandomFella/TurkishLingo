document.addEventListener("DOMContentLoaded", () => {
  let randomWord = ""; 
  const letterBoxes = document.querySelectorAll('.letter');
  const rowLength = 5;
  const totalRows = letterBoxes.length / rowLength;
  let currentIndex = 0;
  let isCheckedRows = new Array(totalRows).fill(false);
  let rowsContent = new Array(totalRows).fill("");
  let hasWon = false;
  let hasLost = false;
  let wordList = [];

  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'text';
  hiddenInput.inputMode = 'text';
  hiddenInput.autocapitalize = 'characters';
  hiddenInput.style.position = 'absolute';
  hiddenInput.style.opacity = '0';
  hiddenInput.style.height = '0';
  hiddenInput.style.width = '0';
  hiddenInput.style.zIndex = '-1';
  document.body.appendChild(hiddenInput);
  hiddenInput.focus();

  fetch('words.txt')
    .then(response => response.text())
    .then(data => {
      wordList = data.split('\n').map(word => word.trim().toUpperCase()).filter(word => word !== "");
      randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      console.log("Random word:", randomWord);
    });

  letterBoxes.forEach(box => box.textContent = "");

  function updateRowContent(row) {
    let start = row * rowLength;
    let content = "";
    for (let i = start; i < start + rowLength; i++) {
      content += letterBoxes[i].textContent.toUpperCase();
    }
    rowsContent[row] = content;
  }

  function flipReveal(index, className) {
    const box = letterBoxes[index];
    box.style.animation = 'flip 0.6s ease';
    setTimeout(() => {
      box.classList.add(className);
    }, 300);
    setTimeout(() => {
      box.style.animation = '';
    }, 600);
  }

  function checkRowWord(row) {
    const guess = rowsContent[row];
    const start = row * rowLength;
    if (!wordList.includes(guess)) return false;

    if (guess === randomWord) {
      hasWon = true;
      for (let i = 0; i < rowLength; i++) {
        flipReveal(start + i, "correct");
      }
      isCheckedRows[row] = true;
      return true;
    }

    let randomWordLetters = randomWord.split('');
    let guessLetters = guess.split('');
    let usedIndices = [];

    for (let i = 0; i < rowLength; i++) {
      if (guessLetters[i] === randomWordLetters[i]) {
        flipReveal(start + i, "correct");
        usedIndices.push(i);
        randomWordLetters[i] = null;
        guessLetters[i] = null;
      }
    }

    for (let i = 0; i < rowLength; i++) {
      if (guessLetters[i] && randomWordLetters.includes(guessLetters[i])) {
        flipReveal(start + i, "almost");
        const index = randomWordLetters.indexOf(guessLetters[i]);
        randomWordLetters[index] = null;
      } else if (guessLetters[i] !== null) {
        flipReveal(start + i, "wrong");
      }
    }

    isCheckedRows[row] = true;
    return true;
  }

  document.addEventListener("keydown", function(event) {
    hiddenInput.focus();
    if (hasWon || hasLost) return;

    let letter = event.key.toUpperCase();
    const invalidKeys = [
      "SHIFT", "TAB", "CAPSLOCK", "CONTROL", "ALT", "META",
      "PAGEDOWN", "PAGEUP", "END", "HOME", "DELETE", 
      "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"
    ];

    let currentRow = Math.floor(currentIndex / rowLength);
    let rowStartIndex = currentRow * rowLength;
    let rowEndIndex = rowStartIndex + rowLength;

    if (letter === "BACKSPACE") {
      if (currentIndex > 0) {
        let backspaceRow = Math.floor((currentIndex - 1) / rowLength);
        if (isCheckedRows[backspaceRow]) return;
        currentIndex--;
        letterBoxes[currentIndex].textContent = "";
        updateRowContent(backspaceRow);
      }
    } else if (letter === "ENTER") {
      if (currentIndex % rowLength === 0 && currentIndex !== 0) {
        let prevRow = currentRow - 1;
        if (prevRow < 0) return; 
        updateRowContent(prevRow);
        if (!checkRowWord(prevRow)) return;

        if (hasWon) return;
        if (currentRow >= totalRows) {
          hasLost = true;
          return;
        }

        currentIndex = currentRow * rowLength;
      }
    } else if (!invalidKeys.includes(letter) && letter.length === 1 && letter.match(/[A-Z]/)) {
      if (currentRow > 0 && !isCheckedRows[currentRow - 1]) return;
      if (isCheckedRows[currentRow]) return;
      if (currentIndex < rowEndIndex) {
        letterBoxes[currentIndex].textContent = letter;
        currentIndex++;
        updateRowContent(currentRow);
      }
    }
  });

  window.addEventListener("click", () => {
    hiddenInput.focus();
  });
});
