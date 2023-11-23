// Generate a random 6-digit number
function generateRandom6DigitNumber() {
    // Generate a random number between 0 and 999999 (inclusive)
    const randomNumber = Math.floor(Math.random() * 1000000);

    // Convert the random number to a 6-digit string
    const random6DigitNumber = randomNumber.toString().padStart(6, '0');

    return random6DigitNumber;
}

module.exports = { generateRandom6DigitNumber };
