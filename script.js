const cartKey = "digimaps_cart";

let cart = JSON.parse(localStorage.getItem(cartKey) || "[]");

const rupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCart();
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const count = document.getElementById("cartCount");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  count.textContent = totalItems;
  document.getElementById("cartTotal").textContent = rupiah(total);
  document.getElementById("shippingCost").textContent = rupiah(0);
  document.getElementById("cartSubtotal").textContent = rupiah(total);

  if (cart.length === 0) {
    container.innerHTML = `
      <p class="text-center text-secondary py-4">
        Keranjang lu masih kosong.
      </p>`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="d-flex gap-3 align-items-center mb-4">
      <img
        src="${item.image}"
        alt="${item.name}"
        style="width:80px;height:80px;object-fit:cover;border-radius:10px"
      >

      <div class="flex-grow-1">
        <h6 class="fw-bold">${item.name}</h6>
        <p class="text-secondary mb-2">${rupiah(item.price)}</p>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm"
            data-action="minus" data-id="${item.id}">−</button>

          <span>${item.quantity}</span>

          <button class="btn btn-outline-secondary btn-sm"
            data-action="plus" data-id="${item.id}">+</button>
        </div>
      </div>

      <button class="btn btn-danger btn-sm"
        data-action="remove" data-id="${item.id}"
        aria-label="Hapus ${item.name}">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `).join("");
}

// Tombol Add pada setiap modal produk
document.querySelectorAll(".modal").forEach(modal => {
  const addButton = modal.querySelector(".modal-footer .btn-success");
  if (!addButton) return;

  addButton.addEventListener("click", () => {
    const name = modal.querySelector(".modal-title")
      ?.textContent.trim();

    const image = modal.querySelector(".modal-body img")?.src;
    const priceText = modal.querySelector(".modal-body h4")
      ?.textContent || "";

    const price = Number(priceText.replace(/\D/g, ""));

    if (!name || !image || !Number.isFinite(price) || price <= 0) {
      alert("Data produk belum valid.");
      return;
    }

    addToCart({
      id: modal.id,
      name,
      image,
      price
    });

    // Tutup modal setelah produk ditambahkan
    bootstrap.Modal.getOrCreateInstance(modal).hide();
  });
});

// Tombol +, −, dan hapus pada keranjang
document.getElementById("cartItems").addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "plus") changeQuantity(id, 1);
  if (action === "minus") changeQuantity(id, -1);
  if (action === "remove") removeFromCart(id);
});

// Checkout demo
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  alert("Keranjang siap untuk proses checkout!");
});

// Tampilkan isi keranjang saat halaman dibuka
renderCart();

document.getElementById("registerForm").addEventListener(
  "submit", event => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (password.length < 8) {
      alert("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirm) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }

    alert(
      `Form valid, ${name}! UI register sudah berfungsi.\n` +
      `Email: ${email}\n\n` +
      "Sambungkan backend untuk membuat akun sungguhan."
    );
  }
);

document.getElementById("loginForm").addEventListener(
  "submit", event => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      alert("Email dan password wajib diisi.");
      return;
    }

    alert(
      "Form login valid.\n" +
      "Autentikasi akun sungguhan belum terhubung ke backend."
    );
  }
);
