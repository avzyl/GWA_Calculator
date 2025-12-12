import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, addDoc, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const syID = urlParams.get("syID");

const tableBody = document.querySelector("#subjectTable tbody");
const syHeader = document.getElementById("syHeader");

let UID = null;

// modal references
const subjectModal = document.getElementById("subjectModal");
const addSubjectBtn = document.getElementById("addSubjectBtn");
const saveSubject = document.getElementById("saveSubject");
const closeSubjectModal = document.getElementById("closeSubjectModal");

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    UID = user.uid;

    loadSYHeader();
    loadSubjects();
});

// LOAD SCHOOL YEAR TITLE
async function loadSYHeader() {
    const docRef = doc(db, "users", UID, "schoolYears", syID);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        syHeader.textContent = "Subjects for School Year " + snap.data().schoolYear;
    }
}

// LOAD SUBJECTS
async function loadSubjects() {
    tableBody.innerHTML = "";

    const q = await getDocs(collection(db, "users", UID, "schoolYears", syID, "subjects"));

    q.forEach((d) => {
        const data = d.data();

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${data.code}</td>
            <td>${data.description}</td>
            <td>${data.grade}</td>
        `;

        tableBody.appendChild(tr);
    });
}

// OPEN MODAL
addSubjectBtn.addEventListener("click", () => {
    subjectModal.classList.remove("hidden");
});

// CLOSE MODAL
closeSubjectModal.addEventListener("click", () => {
    subjectModal.classList.add("hidden");
});

// SAVE SUBJECT
saveSubject.addEventListener("click", async () => {
    const code = document.getElementById("codeInput").value;
    const desc = document.getElementById("descInput").value;
    const grade = document.getElementById("gradeInput").value;

    if (!code || !desc || !grade) {
        Swal.fire("Fill all fields!");
        return;
    }

    await addDoc(collection(db, "users", UID, "schoolYears", syID, "subjects"), {
        code,
        description: desc,
        grade,
        createdAt: new Date()
    });

    Swal.fire("Saved!", "", "success");

    subjectModal.classList.add("hidden");
    loadSubjects();
});
