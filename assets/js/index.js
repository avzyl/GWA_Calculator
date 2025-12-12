// ===================== IMPORTS ============== //
// dashboard.js
import { auth } from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to logout?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'No, stay',
        }).then((result) => {
            if (result.isConfirmed) {
                signOut(auth)
                    .then(() => {
                        Swal.fire({
                            title: 'Logged Out',
                            text: 'You have been logged out successfully.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        }).then(() => {
                            window.location.href = 'index.html';
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                        Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
                    });
            }
            // else do nothing if user clicks "No"
        });
    });
}

// Button
const computeBtn = document.getElementById("back-btn");
computeBtn.onclick = () => {
    window.location.href = `home.html`;
};