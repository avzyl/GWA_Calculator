// login.js
import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const loginBtn = document.querySelector('.login-btn');
const googleLoginBtn = document.querySelector('.circle-btn');

if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const usernameOrEmail = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!usernameOrEmail || !password) {
            Swal.fire({ title: 'Oops!', text: 'Please enter username/email and password', icon: 'warning' });
            return;
        }

        try {
            // Disable button and show loading text
            loginBtn.disabled = true;
            loginBtn.textContent = 'Logging in...';

            let emailToUse = usernameOrEmail;
            let displayName = usernameOrEmail;

            // If input is not an email, fetch email from Firestore
            if (!usernameOrEmail.includes('@')) {
                const q = query(collection(db, 'users'), where('username', '==', usernameOrEmail));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    Swal.fire({ title: 'Login Failed', text: 'Username not found', icon: 'error' });
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                    return;
                }

                const userDoc = querySnapshot.docs[0];
                emailToUse = userDoc.data().email;
                displayName = userDoc.data().username;
            }

            const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
            const user = userCredential.user;

            Swal.fire({
                title: `Hello, ${displayName}!`,
                icon: 'success',
                confirmButtonText: 'Go to Home'
            }).then(() => window.location.href = 'home.html');

        } catch (error) {
            console.error(error);
            Swal.fire({ title: 'Login Failed', text: error.message, icon: 'error' });
        } finally {
            // Re-enable button and reset text
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });
}

// Google login
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            Swal.fire({
                title: `Hello, ${user.displayName}!`,
                icon: 'success',
                confirmButtonText: 'Go to Home'
            }).then(() => window.location.href = 'home.html');

        } catch (error) {
            console.error(error);
            Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
        }
    });
}
