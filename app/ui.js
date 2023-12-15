// Select DOM elements to work with
const userNameDiv = document.getElementById("userName");
const signInButton = document.getElementById("SignIn");
const cardDiv = document.getElementById("welcome");
const mailButton = document.getElementById("readMail");
const profileButton = document.getElementById("seeProfile");
const profileDiv = document.getElementById("profile-div");

function enableSignInButton() {
    signInButton.classList.remove('d-none');
}

function showWelcomeMessage(username) {
    // Reconfiguring DOM elements
    cardDiv.classList.remove('d-none');
    userNameDiv.innerHTML = username;
    signInButton.setAttribute("onclick", "signOut();");
    signInButton.setAttribute('class', "btn btn-success")
    signInButton.innerHTML = "Sign Out";
}
