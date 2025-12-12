import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const tableBody = document.querySelector("#computeTable tbody");
const overallDiv = document.getElementById("overallGWAResult");

let UID = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    UID = user.uid;
    await loadAllSYGWA();
});

const gwaLoader = document.getElementById("gwaLoader");
const noSYMessage = document.getElementById("noSYMessage");

async function loadAllSYGWA() {
    tableBody.innerHTML = "";
    overallDiv.textContent = "";
    gwaLoader.style.display = "block";  // Show loader
    noSYMessage.style.display = "none"; // Hide no-data message

    const sySnap = await getDocs(collection(db, "users", UID, "schoolYears"));
    gwaLoader.style.display = "none";   // Hide loader after fetching

    if (sySnap.empty) {
        noSYMessage.style.display = "block";
        return;
    }

    const syList = [];
    sySnap.forEach(docSnap => {
        const data = docSnap.data();
        data.id = docSnap.id;
        syList.push(data);
    });

    // Sort school years by creation date ascending
    syList.sort((a, b) => a.createdAt?.toDate ? a.createdAt.toDate() - b.createdAt.toDate() : 0);

    let totalPointsOverall = 0;
    let totalUnitsOverall = 0;
    let allFinalsGrades = [];

    for (let sy of syList) {
        const subjectsSnap = await getDocs(collection(db, "users", UID, "schoolYears", sy.id, "subjects"));
        let totalPoints = 0;
        let totalUnits = 0;

        subjectsSnap.forEach(docSnap => {
            const subj = docSnap.data();
            if (subj.status === "included") {
                const grade = parseFloat(subj.finals);
                const units = parseInt(subj.units);
                if (!isNaN(grade) && !isNaN(units)) {
                    totalPoints += grade * units;
                    totalUnits += units;
                    allFinalsGrades.push(grade);
                }
            }
        });

        const gwa = totalUnits > 0 ? roundDecimals(totalPoints / totalUnits, 3) : "N/A";
        const award = determineAward(gwa);

        if (!isNaN(gwa)) {
            totalPointsOverall += totalPoints;
            totalUnitsOverall += totalUnits;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${sy.schoolYear}</td>
            <td>${gwa}</td>
            <td>${award}</td>
        `;
        tableBody.appendChild(tr);
    }

    const overallGWA = totalUnitsOverall > 0 ? roundDecimals(totalPointsOverall / totalUnitsOverall, 3) : "N/A";
    const overallAward = determineAward(overallGWA);
    const latinHonors = determineLatinHonors(overallGWA, allFinalsGrades);

    overallDiv.innerHTML = `Overall GWA: ${overallGWA} ${overallAward ? `(${overallAward})` : ""} ${latinHonors ? `- ${latinHonors}` : ""}`;
}


// Round to specific decimals
function roundDecimals(number, digits) {
    const factor = Math.pow(10, digits);
    return Math.round(number * factor) / factor;
}

// Determine award based on GWA
function determineAward(gwa) {
    if (gwa >= 1.21 && gwa <= 1.50) return "Dean's Lister";
    if (gwa >= 1.00 && gwa <= 1.20) return "President's Lister";
    return "";
}

// Determine Latin honors
function determineLatinHonors(overallGWA, finalsGrades) {
    if (!finalsGrades.length || isNaN(overallGWA)) return "";

    const maxGrade = Math.max(...finalsGrades);

    if (overallGWA >= 1.36 && overallGWA <= 1.50 && maxGrade <= 2.50) {
        return "Cum Laude";
    } else if (overallGWA >= 1.21 && overallGWA <= 1.35 && maxGrade <= 2.25) {
        return "Magna Cum Laude";
    } else if (overallGWA >= 1.00 && overallGWA <= 1.20 && maxGrade <= 1.75) {
        return "Summa Cum Laude";
    } else {
        return "";
    }
}
