// 1. Starting data: an array of note objects
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// 2. searchNotes(word)
// Returns an array of notes whose text contains word,
// ignoring upper/lower case.
function searchNotes(word) {
  const needle = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(needle));
}

// 3. longestNote()
// Returns the note object with the most characters,
// or null if there are no notes.
function longestNote() {
  if (notes.length === 0) return null;

  let longest = notes[0];
  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

// 4. countByCategory()
// Returns an object counting notes per category.
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }
  return counts;
}

// 5. getSummary()
// Returns a sentence such as "5 notes: 2 personal, 1 work, 2 study."
function getSummary() {
  const counts = countByCategory();
  const total = notes.length;

  const label = total === 1 ? "note" : "notes";

  const parts = Object.entries(counts).map(
    ([category, count]) => `${count} ${category}`
  );

  return `${total} ${label}: ${parts.join(", ")}.`;
}

// 6. isDuplicate(text)
// Returns true if a note with the same text already exists,
// ignoring case and extra spaces.
function isDuplicate(text) {
  const cleaned = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === cleaned);
}

// 7. addNote(text, category)
// Adds a note only if the text is 1-200 characters, is not a
// duplicate, and the category is personal, work or study.
// Returns true when added and false otherwise.
function addNote(text, category) {
  const cleaned = text.trim();
  const validCategories = ["personal", "work", "study"];

  if (cleaned.length < 1 || cleaned.length > 200) {
    console.log("Rejected: text must be 1-200 characters.");
    return false;
  }

  if (isDuplicate(cleaned)) {
    console.log("Rejected: note already exists.");
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log("Rejected: category must be personal, work or study.");
    return false;
  }

  const newNote = {
    id: Date.now(),
    text: cleaned,
    category: category,
  };

  notes.push(newNote);
  console.log(`Added: "${newNote.text}" (${newNote.category})`);
  return true;
}

// TESTS

// searchNotes
console.log(searchNotes("milk"));
// Expected: [ { id: 1, text: "Buy milk and bread", category: "personal" } ]

console.log(searchNotes("javascript"));
// Expected: [ { id: 4, text: "Revise JavaScript arrays", category: "study" } ]

console.log(searchNotes("unicorn"));
// Expected: []

// longestNote
console.log(longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

const savedNotes = notes;
notes = [];
console.log(longestNote());
// Expected: null
notes = savedNotes;

// countByCategory
console.log(countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

// getSummary
console.log(getSummary());
// Expected: "5 notes: 2 personal, 2 study, 1 work."
// countByCategory
console.log(countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

// Edge case: empty array
const saved2 = notes;
notes = [];
console.log(countByCategory());
// Expected: {}
notes = saved2;

// getSummary
console.log(getSummary());
const backup = notes;
notes = [{ id: 99, text: "Only one", category: "personal" }];
console.log(getSummary());
// Expected: "1 note: 1 personal."
notes = backup;

// isDuplicate
console.log(isDuplicate("Buy milk and bread"));
// Expected: true

console.log(isDuplicate("  BUY MILK AND BREAD  "));
// Expected: true

console.log(isDuplicate("Something brand new"));
// Expected: false

// addNote
console.log(addNote("Buy groceries", "personal"));
// Expected: Added: "Buy groceries" (personal) then true

console.log(addNote("   ", "personal"));
// Expected: Rejected: text must be 1-200 characters. then false

console.log(addNote("Buy milk and bread", "personal"));
// Expected: Rejected: note already exists. then false

console.log(addNote("Some new task", "urgent"));
// Expected: Rejected: category must be personal, work or study. then false

console.log(getSummary());
// Expected: "6 notes: 3 personal, 2 study, 1 work."