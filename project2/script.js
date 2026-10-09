const photoInput = document.getElementById("photo-input");
const uploadBtn  = document.getElementById("upload-btn");
const feedList   = document.getElementById("feed-list");

// Day 1 – just log to the console; replace with real logic later
uploadBtn.addEventListener("click", () => {
  const file = photoInput.files[0];
  if (!file) {
    alert("Choose a photo first");
    return;
  }
  console.log("Selected file:", file.name, file.size, "bytes");
});

// Placeholder feed render
const samplePhotos = [
  { id: 1, url: "https://picsum.photos/seed/a/600/400" },
  { id: 2, url: "https://picsum.photos/seed/b/600/400" },
];

samplePhotos.forEach(p => {
  const img = document.createElement("img");
  img.src = p.url;
  img.alt = "Sample photo " + p.id;
  feedList.appendChild(img);
});