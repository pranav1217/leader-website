console.log("JS Loaded ✅");
document.addEventListener("DOMContentLoaded", function(){

// ============================
// COUNTER
// ============================

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

let target = +counter.getAttribute("data-target");
let count = 0;
let speed = target / 200;

function updateCounter(){

count += speed;

if(count < target){
counter.innerText = Math.ceil(count);
setTimeout(updateCounter,10);
}
else{
counter.innerText = target;
}

}

updateCounter();

});


// ============================
// POSTER LIGHTBOX
// ============================

const posters = document.querySelectorAll(".work-img");
const posterLightbox = document.getElementById("posterLightbox");
const posterImage = document.getElementById("posterImage");
const closePoster = document.getElementById("closePoster");

posters.forEach(img => {

img.addEventListener("click", () => {

if(posterLightbox && posterImage){
posterLightbox.style.display = "flex";
posterImage.src = img.src;
}

});

});

if(closePoster){

closePoster.addEventListener("click", ()=>{
posterLightbox.style.display="none";
});

}


// ============================
// SCROLL TO TOP
// ============================

const scrollBtn = document.getElementById("scrollTopBtn");

if(scrollBtn){

window.addEventListener("scroll", ()=>{

if(window.scrollY > 300){
scrollBtn.style.display="block";
}else{
scrollBtn.style.display="none";
}

});

scrollBtn.addEventListener("click", ()=>{

window.scrollTo({
top:0,
behavior:"smooth"
});

});

}


// ============================
// NAVBAR SCROLL EFFECT
// ============================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", ()=>{

if(window.scrollY > 50){
navbar.classList.add("scrolled");
}
else{
navbar.classList.remove("scrolled");
}

});


// ============================
// CHATBOT OPEN / CLOSE
// ============================

const chatbotBtn = document.getElementById("chatbot-button");
const chatbot = document.getElementById("chatbot-container");
const closeChat = document.getElementById("close-chat");

// OPEN
if(chatbotBtn){
chatbotBtn.addEventListener("click", function(){
chatbot.style.display = "flex";
});
}

// CLOSE BUTTON (✖)
if(closeChat){
closeChat.addEventListener("click", function(){
chatbot.style.display = "none";
});
}

// CLICK OUTSIDE CLOSE
document.addEventListener("click", function(e){

if(chatbot.style.display === "flex"){

if(!chatbot.contains(e.target) && e.target !== chatbotBtn){
chatbot.style.display = "none";
}

}

});

// ESC KEY CLOSE
document.addEventListener("keydown", function(e){

if(e.key === "Escape"){
chatbot.style.display = "none";
}

});
// ============================
// CHATBOT SEND MESSAGE
// ============================

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBody = document.getElementById("chat-body");

async function sendMessage(){

let userText = userInput.value;

if(userText.trim() === "") return;


// USER MESSAGE

let userMsg = document.createElement("div");
userMsg.className = "user-message";
userMsg.innerText = userText;

chatBody.appendChild(userMsg);

userInput.value = "";


try{

const response = await fetch("https://leader-backend-n30e.onrender.com/chat", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
message: userText
})
});

const data = await response.json();

let botMsg = document.createElement("div");
botMsg.className = "bot-message";
botMsg.innerText = data.reply;

chatBody.appendChild(botMsg);

chatBody.scrollTop = chatBody.scrollHeight;

}catch(error){

let botMsg = document.createElement("div");
botMsg.className = "bot-message";
botMsg.innerText = "सर्व्हरशी संपर्क होत नाही.";

chatBody.appendChild(botMsg);

}

}

if(sendBtn){
sendBtn.addEventListener("click", sendMessage);
}

// ENTER KEY SUPPORT
if(userInput){
userInput.addEventListener("keypress", function(e){
if(e.key === "Enter"){
sendMessage();
}
});
}


// ============================
// PAGE LOADER
// ============================

window.addEventListener("load", function(){

const loader = document.getElementById("loader");

if(loader){
loader.style.display = "none";
}

});

});


// GLOBAL
let selectedRating = 0;


// ⭐ CLICK FUNCTION (MAIN FIX)
function setRating(rating){

selectedRating = rating;

let stars = document.querySelectorAll("#starRating span");

stars.forEach((star, index)=>{
if(index < rating){
star.classList.add("active");
}else{
star.classList.remove("active");
}
});

console.log("Selected:", rating);

}


// ============================
// SUBMIT FEEDBACK
// ============================

function submitFeedback(){

let msg = document.getElementById("feedbackInput").value.trim();
let rating = selectedRating;

if(!msg){
alert("अभिप्राय लिहा");
return;
}

if(rating === 0){
alert("कृपया rating निवडा");
return;
}

fetch("https://leader-backend-n30e.onrender.com/feedback",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
message:msg,
rating:rating
})
})
.then(res => res.json())
.then(()=>{

alert("धन्यवाद 🙏");

document.getElementById("feedbackInput").value="";
selectedRating = 0;

// reset stars
document.querySelectorAll("#starRating span")
.forEach(s => s.classList.remove("active"));

loadFeedback();

})
.catch(()=>{
alert("सर्व्हरशी संपर्क होत नाही");
});

}


// ============================
// LOAD FEEDBACK
// ============================

function loadFeedback(){

fetch("https://leader-backend-n30e.onrender.com/feedback")
.then(res => res.json())
.then(data => {

let box = document.getElementById("feedbackList");
box.innerHTML = "";

let total = data.length;
let sum = 0;

data.forEach(f=>{
sum += parseInt(f.rating || 0);
});

let avg = total ? (sum / total).toFixed(1) : 0;

document.getElementById("avgRating").innerText = `⭐ ${avg} / 5`;
document.getElementById("totalReviews").innerText = `${total} Reviews`;

data.forEach(f=>{

let stars = "⭐".repeat(parseInt(f.rating || 0));

box.innerHTML += `
<div class="feedback-card">
${stars} <br>
${f.message}
</div>
`;

});

});

}
// ============================
// GLOBAL VARIABLES
// ============================

let banners = [];
let currentIndex = 0;
let sliderInterval; // 🔥 important


// ============================
// LOAD WEBSITE SINGLE BANNER
// ============================

function loadWebsiteBanner(){

fetch("https://leader-backend-n30e.onrender.com/banners")
.then(res => res.json())
.then(data => {

let box = document.getElementById("dynamicBanner");
if(!box) return;

box.innerHTML = "";

if(data.length === 0){
box.innerHTML = "<p>No banner available</p>";
return;
}

let lastBanner = data[data.length - 1];

box.innerHTML = `
<img src="https://leader-backend-n30e.onrender.com/static/${lastBanner.image}">
`;

});

}


// ============================
// LOAD SLIDER BANNERS
// ============================

function loadBanners(){

fetch("https://leader-backend-n30e.onrender.com/banners")
.then(res => res.json())
.then(data => {

banners = data;

if(banners.length === 0){
document.getElementById("bannerSlider").innerHTML = "No banners";
return;
}

showBanner();
startAutoSlide(); // 🔥 fixed

});

}


// ============================
// AUTO SLIDER FIX
// ============================

function startAutoSlide(){

// clear previous interval
if(sliderInterval){
clearInterval(sliderInterval);
}

sliderInterval = setInterval(()=>{
nextBanner();
},3000);

}


// ============================
// SHOW BANNER
// ============================

function showBanner(){

let img = document.getElementById("sliderImage");

if(!img || banners.length === 0) return;

let banner = banners[currentIndex];

img.style.opacity = 0;

setTimeout(()=>{
img.src = "https://leader-backend-n30e.onrender.com/static/" + banner.image;
img.style.opacity = 1;
},200);

}


// ============================
// NEXT / PREV
// ============================

function nextBanner(){
currentIndex = (currentIndex + 1) % banners.length;
showBanner();
}

function prevBanner(){
currentIndex = (currentIndex - 1 + banners.length) % banners.length;
showBanner();
}


// ============================
// POPUP EVENT (FIXED)
// ============================

function setupPopup(){

let img = document.getElementById("sliderImage");
let popup = document.getElementById("bannerPopup");
let popupImg = document.getElementById("popupImage");
let close = document.getElementById("closePopup");

if(!img || !popup) return;

// open
img.onclick = ()=>{
popup.style.display = "flex";
popupImg.src = img.src;
};

// close
if(close){
close.onclick = ()=>{
popup.style.display = "none";
};
}

}


// ============================
// MAIN LOAD
// ============================

window.addEventListener("DOMContentLoaded", ()=>{

loadWebsiteBanner();
loadBanners();

// buttons
let nextBtn = document.getElementById("nextBtn");
let prevBtn = document.getElementById("prevBtn");

if(nextBtn) nextBtn.onclick = nextBanner;
if(prevBtn) prevBtn.onclick = prevBanner;

// popup (🔥 important)
setupPopup();


// ============================
// SWIPE SUPPORT
// ============================

let slider = document.getElementById("bannerSlider");

if(slider){

let startX = 0;

slider.addEventListener("touchstart", (e)=>{
startX = e.touches[0].clientX;
});

slider.addEventListener("touchend", (e)=>{
let endX = e.changedTouches[0].clientX;

if(startX - endX > 50){
nextBanner();
}

if(endX - startX > 50){
prevBanner();
}

});

}

});
function createDots(){

let dotBox = document.getElementById("sliderDots");

if(!dotBox) return;

dotBox.innerHTML = "";

banners.forEach((_, index)=>{

let dot = document.createElement("span");

dot.onclick = ()=>{
currentIndex = index;
showBanner();
};

dotBox.appendChild(dot);

});

updateDots();

}
// ============================
// QUICK REPLY BUTTONS FIX
// ============================
// ============================
// CHATBOT OPEN / CLOSE
// ============================

const chatbotBtn = document.getElementById("chatbot-button");
const chatbot = document.getElementById("chatbot-container");
const closeChat = document.getElementById("close-chat");

// OPEN
if(chatbotBtn){
chatbotBtn.addEventListener("click", function(e){
e.stopPropagation();
chatbot.style.display = "flex";
});
}

// CLOSE BUTTON
if(closeChat){
closeChat.addEventListener("click", function(){
chatbot.style.display = "none";
});
}

// PREVENT CLOSE INSIDE CLICK
if(chatbot){
chatbot.addEventListener("click", function(e){
e.stopPropagation();
});
}

// CLICK OUTSIDE CLOSE
document.addEventListener("click", function(e){

if(chatbot.style.display === "flex"){

if(!chatbot.contains(e.target) && e.target !== chatbotBtn){
chatbot.style.display = "none";
}

}

});

// ESC CLOSE
document.addEventListener("keydown", function(e){
if(e.key === "Escape"){
chatbot.style.display = "none";
}
});


// ============================
// SEND MESSAGE
// ============================

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBody = document.getElementById("chat-body");

async function sendMessage(){

let userText = userInput.value;
if(userText.trim() === "") return;

// USER MESSAGE
chatBody.innerHTML += `<div class="user-message">${userText}</div>`;
userInput.value = "";

try{
const response = await fetch("https://leader-backend-n30e.onrender.com/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body: JSON.stringify({message:userText})
});

const data = await response.json();

chatBody.innerHTML += `<div class="bot-message">${data.reply}</div>`;
chatBody.scrollTop = chatBody.scrollHeight;

}catch{
chatBody.innerHTML += `<div class="bot-message">सर्व्हरशी संपर्क होत नाही.</div>`;
}

}

if(sendBtn){
sendBtn.addEventListener("click", sendMessage);
}

if(userInput){
userInput.addEventListener("keypress", function(e){
if(e.key === "Enter"){
sendMessage();
}
});
}


// ============================
// QUICK REPLY (FIXED)
// ============================

function quickReply(type, event){

if(event) event.stopPropagation();

let message = "";

switch(type){

case "नेता माहिती":
message = "राजेश पुंडलिक मोरे हे शिवसेना विभाग प्रमुख आहेत.";
break;

case "फोन":
message = "📞 संपर्क: 9282367577";
break;

case "पत्ता":
message = "📍 कार्यालय: पुणे कॅन्टोन्मेंट विधानसभा";
break;

case "काम":
message = "📅 दर मंगळवारी आधार कार्ड शिबीर आयोजित केले जाते.";
break;

default:
message = "कृपया योग्य पर्याय निवडा";
}

chatBody.innerHTML += `<div class="user-message">${type}</div>`;
chatBody.innerHTML += `<div class="bot-message">${message}</div>`;

chatBody.scrollTop = chatBody.scrollHeight;

}


// ============================
// COMPLAINT MODAL
// ============================

function openComplaint(event){
if(event) event.stopPropagation();
document.getElementById("complaintModal").style.display = "flex";
}

function closeComplaint(){
document.getElementById("complaintModal").style.display = "none";
}

function submitComplaint(){

let name = document.getElementById("name").value;
let phone = document.getElementById("phone").value;
let area = document.getElementById("area").value;
let problem = document.getElementById("problem").value;

fetch("https://leader-backend-n30e.onrender.com/complaints",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
name:name,
phone:phone,
area:area,
problem:problem
})
})
.then(res => res.json())
.then(data => {

alert("तक्रार नोंदवली गेली ✅");

})
.catch(() => {
alert("Server error ❌");
});

}
// ============================
// LOADER
// ============================

window.addEventListener("load", function(){
const loader = document.getElementById("loader");
if(loader){
loader.style.display = "none";
}
});


// ============================
// FEEDBACK SYSTEM
// ============================


function setRating(rating){

selectedRating = rating;

let stars = document.querySelectorAll("#starRating span");

stars.forEach((star, index)=>{
if(index < rating){
star.classList.add("active");
}else{
star.classList.remove("active");
}
});

}

function submitFeedback(){

let msg = document.getElementById("feedbackInput").value.trim();
if(!msg || selectedRating === 0){
alert("Complete feedback");
return;
}

fetch("https://leader-backend-n30e.onrender.com/feedback",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:msg, rating:selectedRating})
})
.then(()=>{

alert("धन्यवाद 🙏");

document.getElementById("feedbackInput").value="";
selectedRating = 0;

document.querySelectorAll("#starRating span")
.forEach(s=>s.classList.remove("active"));

loadFeedback();

});

}

function loadFeedback(){

fetch("https://leader-backend-n30e.onrender.com/feedback")
.then(res=>res.json())
.then(data=>{

let box = document.getElementById("feedbackList");
box.innerHTML = "";

let total = data.length;
let sum = data.reduce((a,b)=>a + parseInt(b.rating || 0),0);

let avg = total ? (sum/total).toFixed(1) : 0;

document.getElementById("avgRating").innerText = `⭐ ${avg} / 5`;
document.getElementById("totalReviews").innerText = `${total} Reviews`;

data.forEach(f=>{
box.innerHTML += `
<div class="feedback-card">
${"⭐".repeat(f.rating)}<br>
${f.message}
</div>`;
});

});

}


// ============================
// BANNER SLIDER
// ============================


function loadBanners(){

fetch("https://leader-backend-n30e.onrender.com/banners")
.then(res=>res.json())
.then(data=>{

banners = data;

if(banners.length === 0) return;

showBanner();
startAutoSlide();

});

}

function startAutoSlide(){
if(sliderInterval) clearInterval(sliderInterval);
sliderInterval = setInterval(nextBanner,3000);
}

function showBanner(){

let img = document.getElementById("sliderImage");
if(!img) return;

let banner = banners[currentIndex];

img.src = "https://leader-backend-n30e.onrender.com/static/" + banner.image;

}

function nextBanner(){
currentIndex = (currentIndex + 1) % banners.length;
showBanner();
}

function prevBanner(){
currentIndex = (currentIndex - 1 + banners.length) % banners.length;
showBanner();
}


// ============================
// MAIN LOAD
// ============================

window.addEventListener("DOMContentLoaded", ()=>{

loadBanners();
loadFeedback();

// buttons
let nextBtn = document.getElementById("nextBtn");
let prevBtn = document.getElementById("prevBtn");

if(nextBtn) nextBtn.onclick = nextBanner;
if(prevBtn) prevBtn.onclick = prevBanner;

// swipe
let slider = document.getElementById("bannerSlider");

if(slider){

let startX = 0;

slider.addEventListener("touchstart", e=>{
startX = e.touches[0].clientX;
});

slider.addEventListener("touchend", e=>{
let endX = e.changedTouches[0].clientX;

if(startX - endX > 50) nextBanner();
if(endX - startX > 50) prevBanner();

});

}

});