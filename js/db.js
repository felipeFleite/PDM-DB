import { openDB } from 'https://unpkg.com/idb?module';

let db;

async function createDB() {
    try {
        db = await openDB('little_bank', 1, {
            upgrade(db, oldVersion, newVersion, transaction) {
                if (oldVersion < 1) {
                    const store = db.createObjectStore('plantas', {
                        keyPath: 'nome',
                    });
                    // criar índice para data (opcional)
                    store.createIndex('date', 'date');
                    showResult("Banco criado!");
                }
            }
        });
        showResult("Banco de dados aberto!");
    } catch (e) {
        showResult("Erro ao criar o banco de dados: " + e.message);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    createDB();
    document.getElementById("btnSalvar").addEventListener("click", addData);
    document.getElementById("btnListar").addEventListener("click", getData);
});

async function addData() {
    const date = document.getElementById("date").value;
    const nome = document.getElementById("nome").value;

    // pega a imagem atual do <img id="camera--output">
    const fotoBase64 = document.getElementById("camera--output").src;

    const tx = await db.transaction('plantas', 'readwrite');
    const store = tx.objectStore('plantas');

    await store.put({
        nome: nome,
        date: date,
        foto: fotoBase64 // salva a foto!
    });

    await tx.done;

    showResult("Salvo com sucesso!");
}

async function getData() {
    if (!db) {
        showResult("O banco de dados está fechado");
        return;
    }

    const tx = db.transaction('plantas', 'readonly');
    const store = tx.objectStore('plantas');

    const plantas = await store.getAll();

    const output = document.querySelector("output");

    if (!plantas || plantas.length === 0) {
        output.innerHTML = "Nenhum registro encontrado!";
        return;
    }

    // cria lista visual com imagens
    let html = "<h3>Registros encontrados:</h3>";

    plantas.forEach(p => {
        html += `
            <div style="border:1px solid #aaa; margin:10px; padding:10px;">
                <p><b>Nome:</b> ${p.nome}</p>
                <p><b>Data:</b> ${p.date}</p>
                <img src="${p.foto}" style="width:150px; border:1px solid #444;">
            </div>
        `;
    });

    output.innerHTML = html;
}

function showResult(text) {
    document.querySelector("output").innerHTML = text;
}
