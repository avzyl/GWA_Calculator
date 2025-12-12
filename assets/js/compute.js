import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, doc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Get school year ID from URL
const urlParams = new URLSearchParams(window.location.search);
const syID = urlParams.get("id");

let UID = null;
const gwaDiv = document.getElementById("gwaResult");
const tableBody = document.querySelector("#computeTable tbody");

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    UID = user.uid;
    await loadSubjectsAndCompute();
});

const gwaLoader = document.getElementById("gwaLoader");
const noSubjectsMessage = document.getElementById("noSubjectsMessage");

async function loadSubjectsAndCompute() {
    tableBody.innerHTML = "";
    gwaDiv.textContent = "";
    gwaLoader.style.display = "block"; // Show loader
    noSubjectsMessage.style.display = "none"; // Hide no-data message

    let totalPoints = 0;
    let totalUnits = 0;

    const subjectsSnap = await getDocs(collection(db, "users", UID, "schoolYears", syID, "subjects"));

    gwaLoader.style.display = "none"; // Hide loader after fetching

    if (subjectsSnap.empty) {
        noSubjectsMessage.style.display = "block";
        return;
    }

    const subjects = [];
    subjectsSnap.forEach(docSnap => {
        const data = docSnap.data();
        data.id = docSnap.id;
        subjects.push(data);
    });

    // Sort by creation time
    subjects.sort((a, b) => a.createdAt?.toDate - b.createdAt?.toDate);

    subjects.forEach(subj => {
        if (subj.status === "included") {
            const grade = parseFloat(subj.finals);
            const units = parseInt(subj.units);
            if (!isNaN(grade) && !isNaN(units)) {
                totalPoints += grade * units;
                totalUnits += units;
            }
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${subj.description}</td>
            <td>${subj.status || "-"}</td>
            <td>${subj.finals || "N/A"}</td>
            <td>${subj.units || "-"}</td>
        `;
        tableBody.appendChild(tr);
    });

    // GWA truncated to 3 decimals
    const gwa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(3) : "N/A";
    gwaDiv.innerHTML = `GWA for this School Year: ${gwa}`;
}


