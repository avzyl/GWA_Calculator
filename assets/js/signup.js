// signup.js
import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, query, where, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const signUpBtn = document.querySelector('.login-btn');
const googleSignupBtn = document.querySelector('.circle-btn');

if (signUpBtn) {
    signUpBtn.addEventListener('click', async () => {
        const name = document.getElementById('name').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!name || !username || !email || !password) {
            Swal.fire({ title: 'Oops!', text: 'Please fill in all fields', icon: 'warning' });
            return;
        }

        try {
            // Disable button and show processing text
            signUpBtn.disabled = true;
            signUpBtn.textContent = 'Signing up...';

            // Check if username exists
            const q = query(collection(db, 'users'), where('username', '==', username));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                Swal.fire({ title: 'Username Taken', text: 'Please choose another username', icon: 'error' });
                return;
            }

            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user document
            await setDoc(doc(db, 'users', user.uid), {
                name,
                username,
                email: user.email,
                createdAt: new Date()
            });

            Swal.fire({
                title: 'Welcome!',
                text: `Hello, ${name}!`,
                icon: 'success',
                confirmButtonText: 'Continue'
            }).then(() => window.location.href = 'home.html');

        } catch (error) {
            console.error(error);
            Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
        } finally {
            // Re-enable button and reset text
            signUpBtn.disabled = false;
            signUpBtn.textContent = 'Sign Up';
        }
    });
}

// Google signup
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            googleSignupBtn.disabled = true;

            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            await setDoc(doc(db, 'users', user.uid), {
                name: user.displayName,
                username: user.displayName.replace(/\s+/g, '').toLowerCase(),
                email: user.email,
                createdAt: new Date()
            }, { merge: true });

            Swal.fire({
                title: `Hello, ${displayName}!`,
                icon: 'success',
                confirmButtonText: 'Go to Home',
                customClass: {
                    confirmButton: 'swal-btn-black'
                }
            }).then(() => window.location.href = 'home.html');

        } catch (error) {
            console.error(error);
            Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
        } finally {
            googleSignupBtn.disabled = false;
        }
    });
}


// Google signup
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Save user document
            await setDoc(doc(db, 'users', user.uid), {
                name: user.displayName,
                username: user.displayName.replace(/\s+/g, '').toLowerCase(),
                email: user.email,
                createdAt: new Date()
            }, { merge: true });

            Swal.fire({
                title: `Hello, ${displayName}!`,
                icon: 'success',
                confirmButtonText: 'Go to Home',
                customClass: {
                    confirmButton: 'swal-btn-black'
                }
            }).then(() => window.location.href = 'home.html');

        } catch (error) {
            console.error(error);
            Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
        }
    });
}
