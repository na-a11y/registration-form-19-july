// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDDeDqJy2hd4GhtXU9osaWj7t4bE5J6VY0",
    authDomain: "mobile-number-validation-5ab72.firebaseapp.com",
    projectId: "mobile-number-validation-5ab72",
    storageBucket: "mobile-number-validation-5ab72.appspot.com",
    messagingSenderId: "208431635162",
    appId: "1:208431635162:web:664d1c45db379b269323e3",
    measurementId: "G-R7JZK5T2BV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize EmailJS
emailjs.init("G1fxwMk3zZlEX2u5b"); // Initialize EmailJS with your User ID

// Function to validate basic user information
function validateBasicInfo() {
    // Clear previous error messages
    document.getElementById("fullNameError").textContent = "";
    document.getElementById("usernameError").textContent = "";
    document.getElementById("passwordError").textContent = "";

    // Get form values
    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    let valid = true;

    // Validate Full Name
    if (fullName === "") {
        document.getElementById("fullNameError").textContent = "Full Name cannot be empty.";
        valid = false;
    } else if (!/^[A-Z]/.test(fullName)) {
        document.getElementById("fullNameError").textContent = "Full Name must start with an uppercase letter.";
        valid = false;
    }

    // Validate Username
    if (username === "") {
        document.getElementById("usernameError").textContent = "Username cannot be empty.";
        valid = false;
    } else if (!/^[a-z0-9@]{5,10}$/.test(username)) {
        document.getElementById("usernameError").textContent = "Username must be 5-10 characters long and contain only lowercase letters, numbers, and '@'.";
        valid = false;
    }

    // Validate Password
    if (password === "") {
        document.getElementById("passwordError").textContent = "Password cannot be empty.";
        valid = false;
    } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{10,}/.test(password)) {
        document.getElementById("passwordError").textContent = "Password must be at least 10 characters long and contain uppercase letters, lowercase letters, numbers, and special characters.";
        valid = false;
    }

    if (valid) {
        // Show the email OTP section
        document.getElementById("emailOtpSection").style.display = "block";
    }
}

// Function to generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via EmailJS
function sendEmailOTP() {
    const email = document.getElementById("email").value.trim();
    const emailError = document.getElementById("emailError");
    emailError.textContent = "";

    // Validate Email
    if (email === "") {
        emailError.textContent = "Email ID cannot be empty.";
        return;
    } else if (!/.+@.+\..+/.test(email)) {
        emailError.textContent = "Email ID must contain '@' and a valid domain.";
        return;
    }

    const otp = generateOTP();
    const templateParams = {
        to_email: email,
        otp: otp
    };

    emailjs.send('service_0bfhhf7', 'template_blfinmg', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            document.getElementById("message").textContent = "OTP sent to your email. Please enter the OTP.";
            document.getElementById("emailOtpSection").style.display = "block";
            document.getElementById("sendEmailOtpButton").style.display = "none"; // Hide Send OTP button
            document.getElementById("emailOtpSection").style.display = "block";
            localStorage.setItem("emailOTP", otp); // Save OTP to localStorage for validation
        }, function(error) {
            console.error('FAILED...', error);
            document.getElementById("message").textContent = "Error sending OTP.";
        });
}

// Function to validate OTP entered by user
function validateEmailOTP() {
    const emailOtp = document.getElementById("emailOtp").value.trim();
    const storedEmailOtp = localStorage.getItem("emailOTP");
    const emailOtpError = document.getElementById("emailOtpError");
    emailOtpError.textContent = "";

    if (emailOtp === storedEmailOtp) {
        document.getElementById("emailOtpSection").style.display = "none";
        document.getElementById("sendEmailOtpButton").style.display = "none"; // Hide Send OTP button
        document.getElementById("mobileOtpSection").style.display = "block";
        document.getElementById("message").textContent = "Email OTP verified. Now enter your mobile number.";
    } else {
        emailOtpError.textContent = "Invalid OTP. Please try again.";
    }
}

// Function to send OTP via Firebase SMS
function sendMobileOTP() {
    const mobile = document.getElementById("mobile").value.trim();
    const mobileError = document.getElementById("mobileError");
    mobileError.textContent = "";

    // Validate Mobile Number
    if (mobile === "") {
        mobileError.textContent = "Mobile Number cannot be empty.";
        return;
    } else if (!/^[7-9]\d{9}$/.test(mobile)) {
        mobileError.textContent = "Mobile Number must start with 7, 8, or 9 and have 10 digits.";
        return;
    }

    // Configure Recaptcha
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': function(response) {
                sendOTP(mobile);
            }
        });
    }

    window.recaptchaVerifier.render().then(function(widgetId) {
        window.recaptchaWidgetId = widgetId;
        sendOTP(mobile);
    });
}

// Function to send OTP via Firebase SMS
function sendOTP(mobile) {
    const formattedMobile = `+91${mobile}`; // Assuming India, adjust country code if necessary
    const appVerifier = window.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(formattedMobile, appVerifier)
        .then(function(confirmationResult) {
            window.confirmationResult = confirmationResult;
            document.getElementById("message").textContent = "OTP sent to your mobile. Please enter the OTP.";
            document.getElementById("mobileOtpSection").style.display = "block";
            document.getElementById("sendMobileOtpButton").style.display = "none"; // Hide Send OTP button
        }).catch(function(error) {
            console.error('Error during signInWithPhoneNumber', error);
            document.getElementById("message").textContent = `Error sending OTP. Please try again. (${error.message})`;
        });
}

// Function to validate mobile OTP entered by user
function validateMobileOTP() {
    const mobileOtp = document.getElementById("mobileOtp").value.trim();
    const mobileOtpError = document.getElementById("mobileOtpError");
    mobileOtpError.textContent = "";

    window.confirmationResult.confirm(mobileOtp).then(function(result) {
        const user = {
            fullName: document.getElementById("fullName").value.trim(),
            email: document.getElementById("email").value.trim(),
            mobile: document.getElementById("mobile").value.trim(),
            username: document.getElementById("username").value.trim(),
            password: document.getElementById("password").value.trim()
        };
        storeUser(user);
        document.getElementById("message").textContent = "User registered successfully!";
        document.getElementById("showTableButton").style.display = "block";
        document.getElementById("mobileOtpSection").style.display = "none";
        document.getElementById("sendMobileOtpButton").style.display = "none"; // Hide Send OTP button
        localStorage.removeItem("emailOTP");
    }).catch(function(error) {
        console.error('Error during OTP confirmation', error);
        mobileOtpError.textContent = `Invalid OTP. Please try again. (${error.message})`;
    });
}

// Function to store registered user in localStorage
function storeUser(user) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
}

// Function to redirect to user table page
function redirectToUserTable() {
    window.location.href = "userTable.html";
}

// Function to show Send Email OTP button
function showEmailOtpButton() {
    const email = document.getElementById("email").value.trim();
    document.getElementById("sendEmailOtpButton").style.display = email ? "inline-block" : "none";
}

// Function to show Send Mobile OTP button
function showMobileOtpButton() {
    const mobile = document.getElementById("mobile").value.trim();
    document.getElementById("sendMobileOtpButton").style.display = mobile ? "inline-block" : "none";
}
