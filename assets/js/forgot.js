import { auth } from "./firebase.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const emailInput = document.getElementById("email");
const resetBtn = document.getElementById("resetPasswordBtn");

resetBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
        Swal.fire("Oops!", "Please enter your email.", "warning");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        Swal.fire("Success!", "Password reset email sent! Check your inbox.", "success");
        emailInput.value = "";
    } catch (error) {
        Swal.fire("Error", error.message, "error");
    }
});
