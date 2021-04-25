// This should be an `import` (without version) once RunKit supports it.
const hibp = require('hibp@11.0.0');

try {
  const data = await hibp.breach('Adobe');

  if (data) {
    // Breach data found
    console.log(data);
  } else {
    console.log('No breach data found by that name.');
  }
} catch (err) {
  // Something went wrong.
  console.log(err.message);
}
