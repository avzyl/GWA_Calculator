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
            customClass: {
                confirmButton: 'swal-btn-black',
                cancelButton: 'swal-btn-red'
            },
        }).then((result) => {
            if (result.isConfirmed) {
                signOut(auth)
                    .then(() => {
                        Swal.fire({
                            title: 'Logged Out',
                            text: 'You have been logged out successfully.',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'swal-btn-black'
                            },
                            buttonsStyling: false
                        }).then(() => {
                            window.location.href = 'index.html';
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                        Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
                    });
            }
        });
    });
}

// Button
const computeBtn = document.getElementById("back-btn");
computeBtn.onclick = () => {
    window.location.href = `home.html`;
};