import { auth, db } from "./firebase.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
    doc,
    collection,
    addDoc,
    getDocs,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Elements
const usernameDisplay = document.getElementById("username");
const addSYBtn = document.getElementById("addSYBtn");
const syModal = document.getElementById("syModal");
const closeModal = document.getElementById("closeModal");
const saveSY = document.getElementById("saveSY");
const tableBody = document.querySelector("#schoolYearTable tbody");

let UID = null;

// WAIT FOR USER
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    UID = user.uid;

    // Fetch Firestore user document
    const userDocRef = doc(db, "users", UID);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        // Use username if exists, otherwise fallback to email
        usernameDisplay.textContent = data.username || data.name || user.email;
    } else {
        usernameDisplay.textContent = user.email;
    }

    loadSchoolYears();
});


// OPEN ADD-SY MODAL
addSYBtn.onclick = () => syModal.style.display = "flex";

// CLOSE MODAL
closeModal.onclick = () => syModal.style.display = "none";

// SAVE SCHOOL YEAR
saveSY.onclick = async () => {
    const sy = document.getElementById("syInput").value;
    const course = document.getElementById("courseInput").value;
    const level = document.getElementById("levelInput").value;

    if (!sy || !course || !level) {
        Swal.fire("Fill all fields!");
        return;
    }

    await addDoc(collection(db, "users", UID, "schoolYears"), {
        schoolYear: sy,
        course,
        level,
        createdAt: new Date()
    });

    Swal.fire("Saved", "", "success");

    syModal.style.display = "none";
    loadSchoolYears();
};

// LOAD SCHOOL YEARS
const loader = document.getElementById("loader");
const noDataMessage = document.getElementById("noDataMessage");

async function loadSchoolYears() {
    tableBody.innerHTML = "";
    loader.style.display = "block";       // Show loader
    noDataMessage.style.display = "none"; // Hide no data message

    const querySnapshot = await getDocs(collection(db, "users", UID, "schoolYears"));

    loader.style.display = "none";        // Hide loader after fetching

    const syList = [];
    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        data.id = docSnap.id;
        syList.push(data);
    });

    if (syList.length === 0) {
        noDataMessage.style.display = "block"; // Show no data message
        return;
    }

    // Sort by start year and semester
    syList.sort((a, b) => {
        const matchA = a.schoolYear.match(/SY(\d+)-(\d+)-(\d+)/);
        const matchB = b.schoolYear.match(/SY(\d+)-(\d+)-(\d+)/);
        if (!matchA || !matchB) return 0;

        const startYearA = parseInt(matchA[1]);
        const startYearB = parseInt(matchB[1]);
        const semesterA = parseInt(matchA[3]);
        const semesterB = parseInt(matchB[3]);

        if (startYearA !== startYearB) return startYearA - startYearB;
        return semesterA - semesterB;
    });

    // Render sorted school years
    syList.forEach((data) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${data.schoolYear}</td>
            <td>${data.course}</td>
            <td>BSIT${data.level}</td>
        `;

        row.onclick = () => {
            window.location.href = `history.html?id=${data.id}`;
        };

        tableBody.appendChild(row);
    });
}

const infoBtn = document.getElementById("info");
const infoModal = document.getElementById("infoModal");
const closeInfoModal = document.getElementById("closeInfoModal");

infoBtn.onclick = () => infoModal.style.display = "flex";
closeInfoModal.onclick = () => infoModal.style.display = "none";

// Close modal if clicking outside the content
window.onclick = (event) => {
    if (event.target === infoModal) {
        infoModal.style.display = "none";
    }
};



// Button
const computeBtn = document.getElementById("computeGWA");
computeBtn.onclick = () => {
    window.location.href = `overall-gwa.html?id=${UID}`;
};
