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
    const importBtn = document.getElementById("importFromLyzza");

    // 🔹 Set loading state
    importBtn.disabled = true;
    importBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading Template`;

    try {
        const lyzzaUID = await getLyzzaUID();
        if (!lyzzaUID) {
            Swal.fire("Error", "User 'lyzza' not found.", "error");
            return;
        }

        const sySnap = await getDocs(collection(db, "users", lyzzaUID, "schoolYears"));

        if (sySnap.empty) {
            Swal.fire("No Data", "Lyzza has no school year records.", "warning");
            return;
        }

        let html = `<div style='text-align:left; max-height:300px; overflow-y:auto;'>`;

        for (let syDoc of sySnap.docs) {
            const syData = syDoc.data();
            html += `<h3>${syData.schoolYear} • ${syData.level}</h3>
                     <p><b>${syData.course}</b></p>`;

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

        Swal.fire({
            title: "Preview Import",
            html: html,
            width: 600,
            showCancelButton: true,
            confirmButtonText: "Import Now",
            cancelButtonText: "Cancel",
            customClass: {
                confirmButton: 'swal-btn-black',
                cancelButton: 'swal-btn-black'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                importData(lyzzaUID);
            }
        });

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to load preview.", "error");
    } finally {
        // 🔹 Reset button
        importBtn.disabled = false;
        importBtn.innerHTML = `Import Template <i class="fa-solid fa-download"></i>`;
    }
}

async function importData(lyzzaUID) {
    const user = auth.currentUser;
    if (!user) return;

    const targetUID = user.uid;

    Swal.fire({
        title: "Importing...",
        text: "Please wait while data is being copied.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    // Get existing school years of target user ONCE
    const existing = await getDocs(
        collection(db, "users", targetUID, "schoolYears")
    );

    const existingYears = existing.docs.map(doc => doc.data().schoolYear);

    // Get Lyzza's school years
    const sySnap = await getDocs(collection(db, "users", lyzzaUID, "schoolYears"));

    for (let syDoc of sySnap.docs) {
        const syData = syDoc.data();

        // Skip if this SY already exists
        if (existingYears.includes(syData.schoolYear)) continue;

        // Create school year
        const newSY = await addDoc(
            collection(db, "users", targetUID, "schoolYears"),
            {
                schoolYear: syData.schoolYear,
                course: syData.course,
                level: syData.level,
                createdAt: new Date()
            }
        );

        // Copy subjects including status
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
                    status: subjData.status,
                    prelim: "",
                    midterm: "",
                    endterm: "",
                    finals: ""
                }
            );
        }
    }

    Swal.fire({
        title: "Success",
        text: "Template imported successfully!",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
            confirmButton: 'swal-btn-black'
        }
    });

}