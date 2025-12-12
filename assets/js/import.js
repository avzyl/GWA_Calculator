import { auth, db } from "./firebase.js";
import {
    collection,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔍 Find Lyzza by username
async function getLyzzaUID() {
    const usersSnap = await getDocs(collection(db, "users"));

    for (let docSnap of usersSnap.docs) {
        if (docSnap.data().username === "lyzza") {
            return docSnap.id;
        }
    }
    return null;
}

document.getElementById("importFromLyzza").onclick = previewImport;

async function previewImport() {
    const lyzzaUID = await getLyzzaUID();
    if (!lyzzaUID) {
        Swal.fire("Error", "User 'lyzza' not found.", "error");
        return;
    }

    // Get Lyzza school years
    const sySnap = await getDocs(collection(db, "users", lyzzaUID, "schoolYears"));

    if (sySnap.empty) {
        Swal.fire("No Data", "Lyzza has no school year records.", "warning");
        return;
    }

    // Build Preview HTML
    let html = `<div style='text-align:left; max-height:300px; overflow-y:auto;'>`;

    for (let syDoc of sySnap.docs) {
        const syData = syDoc.data();
        html += `
            <h3>${syData.schoolYear} • ${syData.level}</h3>
            <p><b>${syData.course}</b></p>
        `;

        // Subjects
        const subjSnap = await getDocs(
            collection(db, "users", lyzzaUID, "schoolYears", syDoc.id, "subjects")
        );

        html += `<ul>`;
        subjSnap.forEach((subj) => {
            const s = subj.data();
            html += `<li>${s.code} – ${s.description} (${s.units} units)</li>`;
        });
        html += `</ul><hr>`;
    }

    html += `</div>`;

    // Show Preview
    Swal.fire({
        title: "Preview Import",
        html: html,
        width: 600,
        showCancelButton: true,
        confirmButtonText: "Import Now",
        cancelButtonText: "Cancel"
    }).then((result) => {
        if (result.isConfirmed) {
            importData(lyzzaUID);
        }
    });
}

async function importData(lyzzaUID) {
    const user = auth.currentUser;
    if (!user) return;

    const targetUID = user.uid;

    // 🌀 Show loading animation
    Swal.fire({
        title: "Importing...",
        text: "Please wait while data is being copied.",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Grab Lyzza's school years
    const sySnap = await getDocs(collection(db, "users", lyzzaUID, "schoolYears"));

    for (let syDoc of sySnap.docs) {
        const syData = syDoc.data();

        // Prevent double import
        const existing = await getDocs(collection(db, "users", targetUID, "schoolYears"));
        let alreadyExists = false;

        existing.forEach((x) => {
            if (x.data().schoolYear === syData.schoolYear) {
                alreadyExists = true;
            }
        });

        if (alreadyExists) continue;

        // Create new school year
        const newSY = await addDoc(collection(db, "users", targetUID, "schoolYears"), {
            schoolYear: syData.schoolYear,
            course: syData.course,
            level: syData.level,
            createdAt: new Date()
        });

        // Copy subjects but clear grades
        const subjSnap = await getDocs(
            collection(db, "users", lyzzaUID, "schoolYears", syDoc.id, "subjects")
        );

        for (let subjDoc of subjSnap.docs) {
            const subjData = subjDoc.data();

            await addDoc(
                collection(db, "users", targetUID, "schoolYears", newSY.id, "subjects"),
                {
                    code: subjData.code,
                    description: subjData.description,
                    section: subjData.section,
                    units: subjData.units,
                    status: "included",
                    prelim: "",
                    midterm: "",
                    endterm: "",
                    finals: ""
                }
            );
        }
    }

    // Done
    Swal.fire("Success", "Template imported successfully!", "success");
}
