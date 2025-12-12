import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, doc, getDoc, getDocs, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const syID = urlParams.get("id");

let UID = null;
let editingSubjectId = null;

const titleSY = document.getElementById("titleSY");
const tableBody = document.querySelector("#subjectTable tbody");

const subjectModal = document.getElementById("subjectsModal");
const openSubjectModal = document.getElementById("openSubjectModal");
const closeSubjectModal = document.getElementById("closeSubjectsModal");
const saveSubject = document.getElementById("saveSubject");
const computeBtn = document.getElementById("computeGWA");

// Inputs
const codeInput = document.getElementById("subjCode");
const descInput = document.getElementById("subjDesc");
const sectionInput = document.getElementById("subjSection");
const statusInput = document.getElementById("subjStatus");
const unitsInput = document.getElementById("subjUnits");
const prelimInput = document.getElementById("subjPrelim");
const midtermInput = document.getElementById("subjMidterm");
const endtermInput = document.getElementById("subjEndterm");
const finalsInput = document.getElementById("subjFinals");

// Auth
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    UID = user.uid;
    await loadSYDetails();
    await loadSubjects();
});

// Load School Year
async function loadSYDetails() {
    const docRef = doc(db, "users", UID, "schoolYears", syID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        titleSY.textContent = `Enrollment Details (${snap.data().schoolYear})`;
    }
}

// Load Subjects
const subjectsLoader = document.getElementById("subjectsLoader");
const noSubjectsMessage = document.getElementById("noSubjectsMessage");

async function loadSubjects() {
    tableBody.innerHTML = "";
    subjectsLoader.style.display = "block"; // Show loader
    noSubjectsMessage.style.display = "none"; // Hide no data message

    const q = await getDocs(collection(db, "users", UID, "schoolYears", syID, "subjects"));

    subjectsLoader.style.display = "none"; // Hide loader after fetching

    const subjects = [];
    q.forEach(docSnap => subjects.push({ id: docSnap.id, ...docSnap.data() }));

    if (subjects.length === 0) {
        noSubjectsMessage.style.display = "block"; // Show no data message
        return;
    }

    // Sort by createdAt ascending (oldest first)
    subjects.sort((a,b) => a.createdAt?.toDate ? a.createdAt.toDate() - b.createdAt.toDate() : 0);

    subjects.forEach(d => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${d.code}</td>
            <td>${d.description}</td>
            <td>${d.section}</td>
            <td>${d.prelim || ""}</td>
            <td>${d.midterm || ""}</td>
            <td>${d.endterm || ""}</td>
            <td>${d.finals || ""}</td>
        `;

        tr.onclick = () => {
            editingSubjectId = d.id;
            codeInput.value = d.code;
            descInput.value = d.description;
            sectionInput.value = d.section;
            statusInput.value = d.status || "included";
            unitsInput.value = d.units || 1;
            prelimInput.value = d.prelim || "";
            midtermInput.value = d.midterm || "";
            endtermInput.value = d.endterm || "";
            finalsInput.value = d.finals || "";
            subjectModal.style.display = "flex";
        };

        tableBody.appendChild(tr);
    });
}

// Modal open/close
openSubjectModal.onclick = () => {
    editingSubjectId = null;
    clearInputs();
    subjectModal.style.display = "flex";
};
closeSubjectModal.onclick = () => subjectModal.style.display = "none";

// Auto-calculate finals on dropdown change
[prelimInput, midtermInput, endtermInput].forEach(input => input.addEventListener("change", calculateFinals));

function calculateFinals() {
    const prelim = parseFloat(prelimInput.value) || NaN;
    const midterm = parseFloat(midtermInput.value) || NaN;
    const endterm = parseFloat(endtermInput.value) || NaN;

    let finals = 0;
    if (!isNaN(prelim) && !isNaN(midterm) && !isNaN(endterm)) finals = (prelim + midterm + endterm)/3;
    else if (!isNaN(prelim) && !isNaN(midterm)) finals = (prelim + midterm)/2;
    else if (!isNaN(midterm) && !isNaN(endterm)) finals = (midterm + endterm)/2;
    else if (!isNaN(prelim) && !isNaN(endterm)) finals = (prelim + endterm)/2;
    else finals = 0;

    finalsInput.value = finals ? roundGrade(finals) : "";
}

function roundGrade(grade) {
    const steps = [1.0, 1.25, 1.5, 1.75, 2.0];
    let closest = steps[0], minDiff = Math.abs(grade - closest);
    steps.forEach(s => { const diff = Math.abs(grade - s); if(diff < minDiff){ minDiff = diff; closest = s; } });
    return closest.toFixed(2);
}

// Save Subject
saveSubject.onclick = async () => {
    const code = codeInput.value;
    const desc = descInput.value;
    const section = sectionInput.value;
    const status = statusInput.value;
    const units = parseInt(unitsInput.value);
    const prelim = prelimInput.value;
    const midterm = midtermInput.value;
    const endterm = endtermInput.value;
    const finals = finalsInput.value;

    if (!code || !desc || !section) {
        Swal.fire("Missing fields!", "", "warning");
        return;
    }

    if (editingSubjectId) {
        const docRef = doc(db, "users", UID, "schoolYears", syID, "subjects", editingSubjectId);
        await updateDoc(docRef, { code, description: desc, section, status, units, prelim, midterm, endterm, finals });
        Swal.fire("Subject Updated!", "", "success");
    } else {
        await addDoc(collection(db, "users", UID, "schoolYears", syID, "subjects"), {
            code, description: desc, section, status, units, prelim, midterm, endterm, finals, createdAt: new Date()
        });
        Swal.fire("Subject Added!", "", "success");
    }

    subjectModal.style.display = "none";
    clearInputs();
    loadSubjects();
};

// Clear inputs
function clearInputs() {
    codeInput.value = "";
    descInput.value = "";
    sectionInput.value = "";
    statusInput.value = "included";
    unitsInput.value = 1;
    prelimInput.value = "";
    midtermInput.value = "";
    endtermInput.value = "";
    finalsInput.value = "";
}

// Compute GWA
computeBtn.onclick = () => {
    window.location.href = `gwa.html?id=${syID}`;
};
