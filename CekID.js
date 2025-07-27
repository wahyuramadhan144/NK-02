const jkt48Api = require("@jkt48/core");

const apiKey = "J-D55B"; // Ganti kalau punya key lain

async function tampilkanSemuaIDMember() {
  try {
    const members = await jkt48Api.members(apiKey);
    console.log(`Total ditemukan ${members.length} member:\n`);

    members.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} → ID: ${member._id || "tidak ada ID"}`);
    });
  } catch (err) {
    console.error("Gagal mengambil daftar member:", err.message);
  }
}

tampilkanSemuaIDMember();
